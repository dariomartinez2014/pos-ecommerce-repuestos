// Relaciona intentos y pedidos, confirma importe/moneda/metadata y registra un pago verificado una sola vez.

import { BadGatewayException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { SalesService } from '../sales/sales.service';
import { Actor } from '../common/security';
import { Prisma } from '../generated/prisma/client';
import { MockPayClient, singleSlash } from './mockpay.client';

const active = ['CREATING', 'PENDING', 'UNKNOWN'];

@Injectable()
export class MockPayService {
  
  constructor(private readonly db: PrismaService, private readonly sales: SalesService, private readonly client: MockPayClient, private readonly config: ConfigService) {}
  // Crea o recupera un intento sin duplicarlo; llama MockPay fuera de la transacción y guarda su URL normalizada.
  async create(orderId: number, actor: Actor) {
    await this.sales.get(orderId, actor);
    const attempt = await this.db.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM orders WHERE id = ${orderId} FOR UPDATE`;
      const order = await tx.order.findUniqueOrThrow({ where: { id: orderId } });
      if (order.channel === 'POS' || order.status !== 'PENDING') throw new ConflictException('MockPay solo admite pedidos WEB/SOCIAL pendientes');
      const previous = await tx.gatewayAttempt.findFirst({ where: { orderId, status: { in: active } } });
      if (previous) return { ...previous, amount: order.total, fresh: false };
      const created = await tx.gatewayAttempt.create({ data: { id: randomUUID(), orderId } });
      return { ...created, amount: order.total, fresh: true };
    });
    if (!attempt.fresh) {
      if (!attempt.gatewayId) throw new ConflictException('Intención en creación o resultado incierto; no se genera otro cobro');
      return attempt;
    }
    try {
      // HTTP FUERA DE TRANSACCIÓN: no mantener bloqueadas filas mientras responde la pasarela.
      const remote = await this.client.create(attempt.amount.toNumber(), { order_id: String(orderId), attempt_id: attempt.id });
      if (typeof remote.id_transaccion !== 'string' || typeof remote.checkout_url !== 'string') throw new BadGatewayException('Contrato de MockPay inválido');
      const checkoutUrl = singleSlash(remote.checkout_url);
      const url = new URL(checkoutUrl);
      if (url.origin !== 'https://mockpay-frontend.vercel.app' || url.pathname !== '/checkout/' + remote.id_transaccion) throw new BadGatewayException('URL de checkout inesperada');
      return await this.db.gatewayAttempt.update({ where: { id: attempt.id }, data: { gatewayId: remote.id_transaccion, checkoutUrl, status: 'PENDING' } });
    } catch (error) {
      // INCERTIDUMBRE: un timeout no significa que la pasarela no creó la intención.
      await this.db.gatewayAttempt.update({ where: { id: attempt.id }, data: { status: 'UNKNOWN' } });
      throw error;
    }
  }
  // BLOQUE latest: Comprueba propiedad del pedido y devuelve el intento de pago más reciente.
  async latest(orderId: number, actor: Actor) {
    await this.sales.get(orderId, actor);
    const attempt = await this.db.gatewayAttempt.findFirst({ where: { orderId }, orderBy: { createdAt: 'desc' } });
    if (!attempt) throw new NotFoundException('Este pedido aún no tiene intento MockPay');
    return attempt;
  }
  // BLOQUE sync: Consulta al proveedor usando el identificador guardado; no acepta el estado enviado por el cliente.
  async sync(orderId: number, actor: Actor) {
    const attempt = await this.latest(orderId, actor);
    if (!attempt.gatewayId) throw new ConflictException('No hay identificador remoto confirmado; requiere revisión');
    return this.verify(attempt.gatewayId);
  }
  // BLOQUE demo: Permite tarjetas ficticias solo en development/test; en production devuelve 403.
  async demo(orderId: number, scenario: 'SUCCESS' | 'INSUFFICIENT_FUNDS' | 'DECLINED', actor: Actor) {
    if (!['development', 'test'].includes(this.config.get<string>('NODE_ENV', 'production'))) throw new ForbiddenException('La simulación desde Swagger está habilitada únicamente en desarrollo y pruebas');
    const attempt = await this.latest(orderId, actor);
    if (!attempt.gatewayId || attempt.status !== 'PENDING') throw new ConflictException('La simulación requiere un intento pendiente');
    // CONSULTA PREVIA: no procesar de nuevo si la pasarela ya terminó el cobro.
    const remote = await this.client.get(attempt.gatewayId);
    if (remote.status === 'PENDING') await this.client.processDemo(attempt.gatewayId, scenario);
    return this.verify(attempt.gatewayId);
  }
  // BLOQUE verify: Contrasta id, GTQ, importe y metadata con el pedido; registra pago CARD/PAID de forma idempotente.
  async verify(gatewayId: string) {
    const attempt = await this.db.gatewayAttempt.findUnique({ where: { gatewayId } });
    if (!attempt) throw new NotFoundException('Transacción no vinculada a esta tienda');
    const remote = await this.client.get(gatewayId);
    const order = await this.db.order.findUniqueOrThrow({ where: { id: attempt.orderId } });
    // VERIFICACIÓN: el webhook y la redirección nunca deciden importe, pedido ni estado.
    if (remote.id !== gatewayId || remote.currency !== 'GTQ' || remote.metadata?.order_id !== String(order.id) || remote.metadata?.attempt_id !== attempt.id ||
      !Number.isFinite(Number(remote.amount)) || !new Prisma.Decimal(String(remote.amount)).equals(order.total) ||
      !['PENDING', 'SUCCEEDED', 'FAILED'].includes(remote.status)) throw new BadGatewayException('Los datos verificados de MockPay no coinciden con el pedido');
    return this.db.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM orders WHERE id = ${order.id} FOR UPDATE`;
      const current = await tx.order.findUniqueOrThrow({ where: { id: order.id }, include: { payment: true } });
      if (remote.status === 'SUCCEEDED') {
        const reference = 'mockpay:' + gatewayId;
        if (current.payment && current.payment.reference !== reference) throw new ConflictException('Pedido ya cobrado por otra operación');
        if (!current.payment) {
          if (current.status !== 'PENDING') throw new ConflictException('Pedido no disponible para aplicar pago');
          // ATÓMICO: un webhook repetido no crea otro pago ni descuenta stock nuevamente.
          await tx.payment.create({ data: { orderId: order.id, recordedById: current.createdById, method: 'CARD', amount: current.total, reference } });
          await tx.order.update({ where: { id: order.id }, data: { status: 'PAID' } });
        }
      }
      const local = await tx.gatewayAttempt.findUniqueOrThrow({ where: { id: attempt.id } });
      // MONOTONÍA: una notificación atrasada no revierte un resultado exitoso.
      const status = local.status === 'SUCCEEDED' ? 'SUCCEEDED' : remote.status;
      const result = await tx.gatewayAttempt.update({ where: { id: attempt.id }, data: { status } });
      return { ...result, orderStatus: remote.status === 'SUCCEEDED' && !current.payment ? 'PAID' : current.status };
    });
  }
}
