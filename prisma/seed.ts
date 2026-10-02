// ARCHIVO: Carga usuarios y repuestos ficticios; recorre los servicios reales para generar pedidos y caja de demostración.
// ESTUDIO: consulta docs/GUIA-CODIGO-COMPLETA.md para recorrer este archivo.
import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { hash } from 'bcryptjs';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { SalesService } from '../src/sales/sales.service';
import { CashService } from '../src/cash/cash.module';
import { Actor } from '../src/common/security';

// SEMILLA REUTILIZABLE: agrega demostraciones sin borrar ventas o modificar claves existentes.
// BLOQUE seed: Crea ejemplos faltantes con contraseña de entorno y reutiliza servicios para respetar reglas reales.
async function seed() {
  const password = process.env.SEED_PASSWORD;
  if (!password || password.length < 12 || Buffer.byteLength(password) > 72) throw new Error('Define SEED_PASSWORD con 12 caracteres como mínimo y máximo 72 bytes');
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error'] });
  try {
    const db = app.get(PrismaService);
    const sales = app.get(SalesService);
    const cash = app.get(CashService);
    const passwordHash = await hash(password, 12);
    const actors: Actor[] = [];
    for (const [name, email, role] of [
      ['Administrador Demo', 'admin@repuestos.demo', 'ADMIN'],
      ['Cajero Demo', 'cajero@repuestos.demo', 'CASHIER'],
      ['Cliente Demo', 'cliente@repuestos.demo', 'CUSTOMER'],
    ] as const) {
      actors.push(await db.user.upsert({ where: { email }, update: {}, create: { name, email, role, passwordHash } }));
    }
    const [admin, cashier, customer] = actors;
    const categories: { id: number }[] = [];
    for (const name of ['Frenos', 'Filtros', 'Sistema eléctrico', 'Lubricación']) categories.push(await db.category.upsert({ where: { name }, update: {}, create: { name } }));
    const samples = [
      ['FRE-001', 'Pastillas de freno delanteras', 0, 125, 195],
      ['FRE-002', 'Disco de freno ventilado', 0, 210, 325],
      ['FIL-001', 'Filtro de aceite', 1, 25, 45],
      ['FIL-002', 'Filtro de aire', 1, 40, 75],
      ['ELE-001', 'Bujía de encendido', 2, 18, 35],
      ['ELE-002', 'Bombilla para faro', 2, 22, 40],
      ['LUB-001', 'Aceite de motor 10W-30, un litro', 3, 38, 65],
      ['LUB-002', 'Líquido de frenos DOT 4', 3, 30, 55],
    ] as const;
    const products = [];
    for (const [sku, name, category, cost, price] of samples) {
      let product = await db.product.findUnique({ where: { sku } });
      if (!product) product = await db.$transaction(async tx => {
        const p = await tx.product.create({ data: { sku, name, description: 'Repuesto de demostración. Confirmar compatibilidad del vehículo antes de comprar.', categoryId: categories[category].id, acquisitionCost: cost, salePrice: price, stock: 40 } });
        await tx.inventoryMovement.create({ data: { productId: p.id, actorId: admin.id, type: 'INITIAL', quantityDelta: 40, reason: 'Inventario inicial de demostración' } });
        return p;
      });
      products.push(product);
    }
    let address = await db.address.findFirst({ where: { userId: customer.id } });
    if (!address) address = await db.address.create({ data: { userId: customer.id, recipientName: 'Cliente Demo', phone: '5555-0101', addressLine: 'Dirección ficticia, zona 1, Guatemala', reference: 'Datos de prueba para presentación' } });
    // Pedidos de ejemplo recorren los mismos servicios que usa la API.
    for (const status of ['PENDING', 'PAID', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'] as const) {
      const key = `seed-web-${status.toLowerCase()}`;
      if (await db.order.findUnique({ where: { idempotencyKey: key } })) continue;
      const cart = await sales.createCart({ channel: 'WEB' }, customer);
      await sales.setItem(cart.id, { productId: products[2].id, quantity: 1 }, customer);
      const order = await sales.checkout(cart.id, { idempotencyKey: key, addressId: address.id }, customer);
      if (status === 'CANCELLED') await sales.cancel(order.id, customer);
      else if (status !== 'PENDING') {
        await sales.pay(order.id, { method: 'TRANSFER', reference: 'Pago de demostración' }, admin);
        if (status === 'IN_TRANSIT' || status === 'DELIVERED') await sales.transition(order.id, 'IN_TRANSIT');
        if (status === 'DELIVERED') await sales.transition(order.id, 'DELIVERED');
      }
    }
    if (!(await db.order.findUnique({ where: { idempotencyKey: 'seed-social-001' } }))) {
      const cart = await sales.createCart({ channel: 'SOCIAL' }, admin);
      await sales.setItem(cart.id, { productId: products[4].id, quantity: 2 }, admin);
      await sales.checkout(cart.id, { idempotencyKey: 'seed-social-001', recipientName: 'Comprador de redes Demo', recipientPhone: '5555-0102', deliveryAddress: 'Dirección ficticia para entrega', deliveryReference: 'Pedido por redes sociales' }, admin);
    }
    if (!(await db.order.findUnique({ where: { idempotencyKey: 'seed-pos-cash' } }))) {
      let session = await db.cashSession.findFirst({ where: { closedAt: null } });
      const createdSession = !session;
      session ??= await cash.open({ openingAmount: 200 }, admin);
      for (const method of ['CASH', 'CARD'] as const) {
        const cart = await sales.createCart({ channel: 'POS' }, cashier);
        await sales.setItem(cart.id, { productId: products[0].id, quantity: 1 }, cashier);
        await sales.checkout(cart.id, { idempotencyKey: `seed-pos-${method.toLowerCase()}`, cashSessionId: session.id, paymentMethod: method }, cashier);
      }
      if (createdSession) await cash.close(session.id, { countedAmount: 395 }, admin);
    }
    console.log('Datos de repuestos cargados en GTQ. Usuarios: admin@repuestos.demo, cajero@repuestos.demo, cliente@repuestos.demo. Clave: valor privado de SEED_PASSWORD.');
  } finally { await app.close(); }
}
seed().catch(e => { console.error(e); process.exitCode = 1; });

