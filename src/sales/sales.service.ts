import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { Actor } from '../common/security';
import { CartDto, CartItemDto, CheckoutDto, OrdersQuery, PaymentDto } from './sales.dto';
import { Prisma } from '../generated/prisma/client';

// SELECT SEGURO: no devuelve costos de adquisición ni hashes en tickets y carritos.
const cartView = { items: { include: { product: { select: { id: true, name: true, sku: true, salePrice: true, stock: true, active: true } } } } } as const;
const orderView = { items: { select: { id: true, productId: true, productName: true, quantity: true, unitPrice: true } }, payment: true } as const;

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}
  // PROPIEDAD: ningún usuario modifica el carrito creado por otra persona.
  private async ownCart(tx: Prisma.TransactionClient, id: number, actor: Actor, open = false) {
    const cart = await tx.cart.findUnique({ where: { id } });
    if (!cart) throw new NotFoundException('Carrito no encontrado');
    if (cart.createdById !== actor.id) throw new ForbiddenException('Carrito ajeno');
    if (open && cart.status !== 'OPEN') throw new ConflictException('El carrito ya fue cerrado');
    return cart;
  }
  createCart(dto: CartDto, actor: Actor) {
    if ((actor.role === 'CUSTOMER' && dto.channel !== 'WEB') || (actor.role === 'CASHIER' && dto.channel !== 'POS') || (actor.role === 'ADMIN' && dto.channel === 'WEB')) throw new ForbiddenException('Canal no permitido para este rol');
    return this.prisma.cart.create({ data: { channel: dto.channel, createdById: actor.id, customerId: actor.role === 'CUSTOMER' ? actor.id : null } });
  }
  async cart(id: number, actor: Actor) {
    await this.ownCart(this.prisma, id, actor);
    return this.prisma.cart.findUniqueOrThrow({ where: { id }, include: cartView });
  }
  async setItem(id: number, dto: CartItemDto, actor: Actor) {
    return this.prisma.$transaction(async tx => {
      // BLOQUEO: serializa edición y checkout del mismo carrito.
      await tx.$queryRaw`SELECT id FROM carts WHERE id = ${id} FOR UPDATE`;
      await this.ownCart(tx, id, actor, true);
      if (!(await tx.product.findFirst({ where: { id: dto.productId, active: true, category: { active: true } } }))) throw new NotFoundException('Producto no disponible');
      await tx.cartItem.upsert({ where: { cartId_productId: { cartId: id, productId: dto.productId } }, create: { cartId: id, ...dto }, update: { quantity: dto.quantity } });
      return tx.cart.findUniqueOrThrow({ where: { id }, include: cartView });
    });
  }
  async removeItem(id: number, productId: number, actor: Actor) {
    return this.prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM carts WHERE id = ${id} FOR UPDATE`;
      await this.ownCart(tx, id, actor, true);
      await tx.cartItem.deleteMany({ where: { cartId: id, productId } });
      return tx.cart.findUniqueOrThrow({ where: { id }, include: cartView });
    });
  }
  // CONFIRMACIÓN ATÓMICA: pedido + detalles + stock + movimientos + pago POS.
  async checkout(id: number, dto: CheckoutDto, actor: Actor) {
    return this.prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM carts WHERE id = ${id} FOR UPDATE`;
      const cart = await this.ownCart(tx, id, actor);
      const previous = await tx.order.findUnique({ where: { idempotencyKey: dto.idempotencyKey }, include: orderView });
      if (previous) {
        if (previous.createdById !== actor.id || previous.cartId !== id) throw new ConflictException('Clave de confirmación ya utilizada');
        return previous;
      }
      if (cart.status !== 'OPEN') throw new ConflictException('Carrito ya confirmado');
      const lines = await tx.cartItem.findMany({ where: { cartId: id }, orderBy: { productId: 'asc' } });
      if (!lines.length) throw new BadRequestException('El carrito está vacío');
      let delivery: { recipientName?: string; recipientPhone?: string; deliveryAddress?: string; deliveryReference?: string | null } = {};
      if (cart.channel === 'POS') {
        if (!dto.cashSessionId || !dto.paymentMethod) throw new BadRequestException('POS requiere caja abierta y método de pago');
        // El cierre toma el mismo bloqueo: nunca se cobra sobre una caja cerrada.
        await tx.$queryRaw`SELECT id FROM cash_sessions WHERE id = ${dto.cashSessionId} FOR UPDATE`;
        const session = await tx.cashSession.findUnique({ where: { id: dto.cashSessionId } });
        if (!session || session.closedAt) throw new ConflictException('Caja no disponible');
      } else if (cart.channel === 'WEB') {
        if (!dto.addressId) throw new BadRequestException('Selecciona una dirección propia');
        const address = await tx.address.findFirst({ where: { id: dto.addressId, userId: actor.id } });
        if (!address) throw new ForbiddenException('Dirección no disponible para este usuario');
        delivery = { recipientName: address.recipientName, recipientPhone: address.phone, deliveryAddress: address.addressLine, deliveryReference: address.reference };
      } else {
        if (!dto.recipientName || !dto.recipientPhone || !dto.deliveryAddress) throw new BadRequestException('Pedido social requiere destinatario, teléfono y dirección');
        delivery = { recipientName: dto.recipientName, recipientPhone: dto.recipientPhone, deliveryAddress: dto.deliveryAddress, deliveryReference: dto.deliveryReference };
      }
      const items: { productId: number; productName: string; quantity: number; unitPrice: Prisma.Decimal; unitCost: Prisma.Decimal }[] = [];
      let total = new Prisma.Decimal(0);
      for (const line of lines) {
        // Ordenar por producto reduce deadlocks entre carritos con varios artículos.
        await tx.$queryRaw`SELECT id FROM products WHERE id = ${line.productId} FOR UPDATE`;
        const product = await tx.product.findFirst({ where: { id: line.productId, active: true, category: { active: true } } });
        if (!product || product.stock < line.quantity) throw new ConflictException(`Stock insuficiente para producto ${line.productId}`);
        const changed = await tx.product.updateMany({ where: { id: product.id, stock: { gte: line.quantity } }, data: { stock: { decrement: line.quantity } } });
        if (!changed.count) throw new ConflictException('Inventario modificado por otra venta');
        total = total.plus(product.salePrice.mul(line.quantity));
        items.push({ productId: product.id, productName: product.name, quantity: line.quantity, unitPrice: product.salePrice, unitCost: product.acquisitionCost });
      }
      const order = await tx.order.create({ data: { receiptNumber: `REP-${randomUUID()}`, idempotencyKey: dto.idempotencyKey, cartId: id, customerId: cart.customerId,
        createdById: actor.id, channel: cart.channel, status: cart.channel === 'POS' ? 'COMPLETED' : 'PENDING', cashSessionId: cart.channel === 'POS' ? dto.cashSessionId : null,
        total, ...delivery, items: { create: items } } });
      await tx.inventoryMovement.createMany({ data: items.map(item => ({ productId: item.productId, orderId: order.id, actorId: actor.id, type: 'SALE' as const, quantityDelta: -item.quantity, reason: `Venta ${order.receiptNumber}` })) });
      if (cart.channel === 'POS') await tx.payment.create({ data: { orderId: order.id, recordedById: actor.id, method: dto.paymentMethod!, amount: total } });
      await tx.cart.update({ where: { id }, data: { status: 'CONVERTED' } });
      return tx.order.findUniqueOrThrow({ where: { id: order.id }, include: orderView });
    }, { timeout: 15000 });
  }
  async list(q: OrdersQuery, actor: Actor) {
    const where: Prisma.OrderWhereInput = { channel: q.channel, status: q.status };
    if (actor.role === 'CUSTOMER') where.customerId = actor.id;
    if (actor.role === 'CASHIER') { where.channel = 'POS'; where.createdById = actor.id; }
    if (q.date) {
      const start = new Date(`${q.date}T00:00:00-06:00`);
      where.createdAt = { gte: start, lt: new Date(start.getTime() + 86400000) };
    }
    const [data, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({ where, include: orderView, orderBy: { id: 'desc' }, skip: (q.page - 1) * q.limit, take: q.limit }), this.prisma.order.count({ where }),
    ]);
    return { data, total, page: q.page, limit: q.limit };
  }
  async get(id: number, actor: Actor) {
    const order = await this.prisma.order.findUnique({ where: { id }, include: orderView });
    if (!order) throw new NotFoundException('Pedido no encontrado');
    if (actor.role === 'CUSTOMER' && order.customerId !== actor.id) throw new ForbiddenException('Pedido ajeno');
    if (actor.role === 'CASHIER' && (order.channel !== 'POS' || order.createdById !== actor.id)) throw new ForbiddenException('Pedido no permitido');
    return order;
  }
  // COBRO WEB/SOCIAL: registro administrativo; el cliente no puede declararse pagado.
  async pay(id: number, dto: PaymentDto, actor: Actor) {
    return this.prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM orders WHERE id = ${id} FOR UPDATE`;
      const order = await tx.order.findUnique({ where: { id } });
      if (!order) throw new NotFoundException();
      if (order.channel === 'POS' || order.status !== 'PENDING') throw new ConflictException('El pedido no admite este pago');
      if (await tx.gatewayAttempt.findFirst({ where: { orderId: id, status: { in: ['CREATING', 'PENDING', 'UNKNOWN'] } } })) throw new ConflictException('Hay un cobro MockPay activo; sincroniza su resultado antes de registrar otro pago');
      await tx.payment.create({ data: { orderId: id, recordedById: actor.id, method: dto.method, reference: dto.reference, amount: order.total } });
      return tx.order.update({ where: { id }, data: { status: 'PAID' }, include: orderView });
    });
  }
  async transition(id: number, status: 'IN_TRANSIT' | 'DELIVERED') {
    return this.prisma.$transaction(async tx => {
      const changed = await tx.order.updateMany({ where: { id, channel: { in: ['WEB', 'SOCIAL'] }, status: status === 'IN_TRANSIT' ? 'PAID' : 'IN_TRANSIT' }, data: { status } });
      if (!changed.count) throw new ConflictException('Transición de estado no permitida');
      return tx.order.findUniqueOrThrow({ where: { id }, include: orderView });
    });
  }
  // CANCELACIÓN: solo pendientes sin pago; repetirla nunca repone stock dos veces.
  async cancel(id: number, actor: Actor) {
    await this.get(id, actor);
    return this.prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM orders WHERE id = ${id} FOR UPDATE`;
      const order = await tx.order.findUniqueOrThrow({ where: { id }, include: { items: { orderBy: { productId: 'asc' } }, payment: true } });
      if (order.status === 'CANCELLED') return tx.order.findUniqueOrThrow({ where: { id }, include: orderView });
      if (order.channel === 'POS' || order.status !== 'PENDING' || order.payment) throw new ConflictException('Solo se cancelan pedidos pendientes sin pago');
      if (await tx.gatewayAttempt.findFirst({ where: { orderId: id, status: { in: ['CREATING', 'PENDING', 'UNKNOWN'] } } })) throw new ConflictException('Hay un cobro MockPay activo; sincroniza antes de cancelar');
      for (const line of order.items) {
        await tx.product.update({ where: { id: line.productId }, data: { stock: { increment: line.quantity } } });
        await tx.inventoryMovement.create({ data: { productId: line.productId, orderId: id, actorId: actor.id, type: 'CANCELLATION', quantityDelta: line.quantity, reason: 'Cancelación de pedido pendiente' } });
      }
      return tx.order.update({ where: { id }, data: { status: 'CANCELLED' }, include: orderView });
    });
  }
}
