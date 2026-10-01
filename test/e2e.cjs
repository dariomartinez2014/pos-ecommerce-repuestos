// PRUEBAS REALES: ejecutan HTTP, Guards, DTOs, Prisma y PostgreSQL juntos.
// Solo permiten una base cuyo nombre termine en _test; nunca usan datos de producción.
require('reflect-metadata');
require('dotenv').config({ quiet: true });
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { hash } = require('bcryptjs');
const testUrl = process.env.TEST_DATABASE_URL;
if (!testUrl || !new URL(testUrl).pathname.endsWith('_test')) throw new Error('Define TEST_DATABASE_URL con una base dedicada terminada en _test');
process.env.DATABASE_URL = testUrl;
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET ||= 'test-secret-only-never-use-in-production-123';
// ORDEN SEGURO: fijar la conexión de pruebas antes de importar ConfigModule.
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/app.module');
const { configureApp } = require('../dist/setup');
const { PrismaService } = require('../dist/prisma/prisma.service');

test('POS y e-commerce: reglas completas contra PostgreSQL', async t => {
  const app = await NestFactory.create(AppModule, { logger: false });
  configureApp(app);
  await app.listen(0, '127.0.0.1');
  const db = app.get(PrismaService);
  const base = await app.getUrl();
  try {
    // Limpieza exclusiva del entorno de pruebas, validado antes de arrancar.
    await db.$executeRawUnsafe('TRUNCATE gateway_attempts, inventory_movements, payments, order_items, orders, cart_items, carts, addresses, cash_sessions, products, categories, users RESTART IDENTITY CASCADE');
    const password = 'PruebaSegura123!';
    const admin = await db.user.create({ data: { name: 'Admin Test', email: 'admin@test.local', passwordHash: await hash(password, 10), role: 'ADMIN' } });
    async function req(method, path, body, token, expected) {
      const res = await fetch(base + '/api' + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
      const json = await res.json();
      if (expected) assert.equal(res.status, expected, `${method} ${path}: ${JSON.stringify(json)}`);
      return { status: res.status, body: json };
    }
    const login = async email => (await req('POST', '/auth/login', { email, password }, null, 200)).body.accessToken;
    const a = await login('admin@test.local');
    let c, c2, cashier, category, product, second, address, session;
    await t.test('Registro público no permite elevar privilegios y errores HTTP son claros', async () => {
      await req('POST', '/auth/register', { name: 'Intruso', email: 'bad@test.local', password, role: 'ADMIN' }, null, 400);
      await req('POST', '/auth/register', { name: 'Cliente Test', email: 'customer@test.local', password }, null, 201);
      await req('POST', '/auth/register', { name: 'Cliente Test', email: 'customer@test.local', password }, null, 409);
      await req('POST', '/auth/register', { name: 'Otro Cliente', email: 'other@test.local', password }, null, 201);
      c = await login('customer@test.local'); c2 = await login('other@test.local');
      await req('GET', '/users', undefined, null, 401);
      await req('GET', '/users', undefined, c, 403);
      await req('POST', '/users', { name: 'Cajero Test', email: 'cashier@test.local', password, role: 'CASHIER' }, a, 201);
      cashier = await login('cashier@test.local');
    });
    await t.test('Catálogo: valida dinero, protege costos y registra stock', async () => {
      category = (await req('POST', '/categories', { name: 'Frenos Test' }, a, 201)).body;
      const dto = { categoryId: category.id, sku: 'TEST-001', name: 'Pastillas Test', acquisitionCost: 10, salePrice: 25.50 };
      await req('POST', '/products', { ...dto, salePrice: -5 }, a, 400);
      product = (await req('POST', '/products', dto, a, 201)).body;
      second = (await req('POST', '/products', { ...dto, sku: 'TEST-002', name: 'Filtro Test', salePrice: 10 }, a, 201)).body;
      await req('POST', `/products/${product.id}/stock`, { delta: 10, reason: 'Carga inicial de prueba' }, a, 201);
      await req('POST', `/products/${second.id}/stock`, { delta: 1, reason: 'Carga inicial de prueba' }, a, 201);
      const pub = (await req('GET', '/products', undefined, null, 200)).body;
      assert.equal(pub.total, 2); assert.equal(JSON.stringify(pub).includes('acquisitionCost'), false);
      await req('GET', '/products/internal', undefined, c, 403);
      await req('GET', '/products?page=0', undefined, null, 400);
      await req('PATCH', `/products/${product.id}`, { salePrice: 25.50 }, a, 200);
      await req('GET', '/products/999999', undefined, null, 404);
    });
    await t.test('Direcciones y carritos pertenecen al usuario', async () => {
      address = (await req('POST', '/addresses', { recipientName: 'Cliente Test', phone: '5555-0101', addressLine: 'Dirección de prueba zona 1' }, c, 201)).body;
      await req('PATCH', `/addresses/${address.id}`, { phone: '5555-0999' }, c2, 403);
      await req('POST', '/carts', { channel: 'POS' }, c, 403);
    });
    async function cart(token, channel, entries) {
      const x = (await req('POST', '/carts', { channel }, token, 201)).body;
      for (const [productId, quantity] of entries) await req('PUT', `/carts/${x.id}/items`, { productId, quantity }, token, 200);
      return x;
    }
    let webOrder;
    await t.test('Checkout conserva precio, valida propiedad y reintenta sin duplicar', async () => {
      const x = await cart(c, 'WEB', [[product.id, 2]]);
      await req('GET', `/carts/${x.id}`, undefined, c2, 403);
      const dto = { idempotencyKey: 'test-web-0001', addressId: address.id };
      webOrder = (await req('POST', `/carts/${x.id}/checkout`, dto, c, 201)).body;
      assert.equal(Number(webOrder.total), 51);
      assert.equal(JSON.stringify(webOrder).includes('unitCost'), false);
      assert.equal((await db.product.findUnique({ where: { id: product.id } })).stock, 8);
      const retry = (await req('POST', `/carts/${x.id}/checkout`, dto, c, 201)).body;
      assert.equal(retry.id, webOrder.id);
      assert.equal((await db.product.findUnique({ where: { id: product.id } })).stock, 8);
      await req('PUT', `/carts/${x.id}/items`, { productId: product.id, quantity: 1 }, c, 409);
      await req('GET', `/orders/${webOrder.id}`, undefined, c2, 403);
      await req('PATCH', `/products/${product.id}`, { salePrice: 30 }, a, 200);
      const historic = (await req('GET', `/orders/${webOrder.id}`, undefined, c, 200)).body;
      assert.equal(Number(historic.items[0].unitPrice), 25.50);
    });
    await t.test('Una línea sin stock revierte todos los descuentos y el pedido', async () => {
      const x = await cart(c, 'WEB', [[product.id, 1], [second.id, 5]]);
      await req('POST', `/carts/${x.id}/checkout`, { idempotencyKey: 'test-rollback-001', addressId: address.id }, c, 409);
      assert.equal((await db.product.findUnique({ where: { id: product.id } })).stock, 8);
      assert.equal(await db.order.count({ where: { cartId: x.id } }), 0);
    });
    await t.test('Dos compras simultáneas de la última unidad: solo una gana', async () => {
      const x = await cart(c, 'WEB', [[second.id, 1]]); const y = await cart(c, 'WEB', [[second.id, 1]]);
      const results = await Promise.all([req('POST', `/carts/${x.id}/checkout`, { idempotencyKey: 'race-last-one-a', addressId: address.id }, c), req('POST', `/carts/${y.id}/checkout`, { idempotencyKey: 'race-last-one-b', addressId: address.id }, c)]);
      assert.deepEqual(results.map(r => r.status).sort(), [201, 409]);
      assert.equal((await db.product.findUnique({ where: { id: second.id } })).stock, 0);
    });
    await t.test('Cancelación repetida repone unidades una sola vez', async () => {
      await req('POST', `/orders/${webOrder.id}/cancel`, {}, c, 201);
      await req('POST', `/orders/${webOrder.id}/cancel`, {}, c, 201);
      assert.equal((await db.product.findUnique({ where: { id: product.id } })).stock, 10);
    });
    await t.test('Pago y logística: impide salto de estados y pago por cliente', async () => {
      const x = await cart(c, 'WEB', [[product.id, 1]]);
      const o = (await req('POST', `/carts/${x.id}/checkout`, { idempotencyKey: 'test-logistics-001', addressId: address.id }, c, 201)).body;
      await req('PATCH', `/orders/${o.id}/status`, { status: 'DELIVERED' }, a, 409);
      await req('POST', `/orders/${o.id}/payment`, { method: 'TRANSFER' }, c, 403);
      await req('POST', `/orders/${o.id}/payment`, { method: 'TRANSFER' }, a, 201);
      await req('POST', `/orders/${o.id}/payment`, { method: 'TRANSFER' }, a, 409);
      await req('POST', `/orders/${o.id}/cancel`, {}, c, 409);
      await req('PATCH', `/orders/${o.id}/status`, { status: 'IN_TRANSIT' }, a, 200);
      await req('PATCH', `/orders/${o.id}/status`, { status: 'DELIVERED' }, a, 200);
      await req('PATCH', `/addresses/${address.id}`, { addressLine: 'Otra dirección modificada' }, c, 200);
      assert.equal((await req('GET', `/orders/${o.id}`, undefined, c, 200)).body.deliveryAddress, 'Dirección de prueba zona 1');
    });
    await t.test('Pedidos de redes sociales tienen logística sin tarifa de envío', async () => {
      const x = await cart(a, 'SOCIAL', [[product.id, 1]]);
      const o = (await req('POST', `/carts/${x.id}/checkout`, { idempotencyKey: 'social-test-001', recipientName: 'Comprador Social', recipientPhone: '5555-0202', deliveryAddress: 'Dirección de prueba social' }, a, 201)).body;
      assert.equal(Number(o.total), 30); assert.equal(o.channel, 'SOCIAL');
      assert.equal(Object.hasOwn(o, 'shippingCost'), false);
    });
    await t.test('Caja única, POS y conciliación separan efectivo de tarjeta', async () => {
      session = (await req('POST', '/cash-sessions', { openingAmount: 100 }, a, 201)).body;
      await req('POST', '/cash-sessions', { openingAmount: 100 }, a, 409);
      for (const method of ['CASH', 'CARD']) {
        const x = await cart(cashier, 'POS', [[product.id, 1]]);
        await req('POST', `/carts/${x.id}/checkout`, { idempotencyKey: 'pos-test-' + method, cashSessionId: session.id, paymentMethod: method }, cashier, 201);
      }
      const report = (await req('GET', `/cash-sessions/${session.id}`, undefined, a, 200)).body;
      assert.equal(Number(report.expectedAmount), 130);
      const closed = (await req('POST', `/cash-sessions/${session.id}/close`, { countedAmount: 128 }, a, 201)).body;
      assert.equal(Number(closed.difference), -2);
      const x = await cart(cashier, 'POS', [[product.id, 1]]);
      await req('POST', `/carts/${x.id}/checkout`, { idempotencyKey: 'closed-cash-test', cashSessionId: session.id, paymentMethod: 'CASH' }, cashier, 409);
    });
    await t.test('Cobro y cierre simultáneos mantienen conciliación e inventario', async () => {
      const open = (await req('POST', '/cash-sessions', { openingAmount: 0 }, a, 201)).body;
      const before = (await db.product.findUnique({ where: { id: product.id } })).stock;
      const x = await cart(cashier, 'POS', [[product.id, 1]]);
      const [sale, close] = await Promise.all([
        req('POST', `/carts/${x.id}/checkout`, { idempotencyKey: 'race-cash-close-001', cashSessionId: open.id, paymentMethod: 'CASH' }, cashier),
        req('POST', `/cash-sessions/${open.id}/close`, { countedAmount: 0 }, a),
      ]);
      assert.equal(close.status, 201);
      assert.ok([201, 409].includes(sale.status));
      const report = (await req('GET', `/cash-sessions/${open.id}`, undefined, a, 200)).body;
      assert.equal(Number(report.expectedAmount), sale.status === 201 ? 30 : 0);
      assert.equal((await db.product.findUnique({ where: { id: product.id } })).stock, before - (sale.status === 201 ? 1 : 0));
      await req('POST', `/cash-sessions/${open.id}/close`, { countedAmount: 0 }, a, 409);
    });
    await t.test('Cuenta desactivada pierde acceso aunque conserve su JWT', async () => {
      const other = await db.user.findUnique({ where: { email: 'other@test.local' } });
      await req('PATCH', `/users/${other.id}/active`, { active: false }, a, 200);
      await req('GET', '/auth/me', undefined, c2, 401);
    });
    await t.test('MockPay: enlaces, propiedad, verificación externa y notificaciones idempotentes', async () => {
      // El caso anterior desactivó esta cuenta; restaurarla para comprobar propiedad.
      await db.user.update({ where: { email: 'other@test.local' }, data: { active: true } });
      const { MockPayClient, singleSlash } = require('../dist/mockpay/mockpay.client');
      const gateway = app.get(MockPayClient);
      const originalCreate = gateway.create.bind(gateway);
      const originalGet = gateway.get.bind(gateway);
      const originalDemo = gateway.processDemo.bind(gateway);
      const remote = new Map();
      let calls = 0;
      gateway.create = async (amount, metadata) => {
        calls++;
        const id = require('node:crypto').randomUUID();
        remote.set(id, { id, amount, currency: 'GTQ', metadata, status: 'PENDING' });
        return { id_transaccion: id, checkout_url: 'https://mockpay-frontend.vercel.app//checkout/' + id };
      };
      gateway.get = async id => ({ ...remote.get(id) });
      gateway.processDemo = async (id, scenario) => { remote.get(id).status = scenario === 'SUCCESS' ? 'SUCCEEDED' : 'FAILED'; return remote.get(id); };
      try {
        assert.equal(singleSlash('https://mockpay-backend.onrender.com//api/v1/payments'), 'https://mockpay-backend.onrender.com/api/v1/payments');
        const x = await cart(c, 'WEB', [[product.id, 1]]);
        const o = (await req('POST', '/carts/' + x.id + '/checkout', { idempotencyKey: 'mockpay-order-001', addressId: address.id }, c, 201)).body;
        await req('POST', '/orders/' + o.id + '/mockpay', {}, c2, 403);
        const results = await Promise.all([req('POST', '/orders/' + o.id + '/mockpay', {}, c), req('POST', '/orders/' + o.id + '/mockpay', {}, c)]);
        assert.ok(results.some(r => r.status === 201));
        assert.equal(calls, 1);
        const attempt = (await req('GET', '/orders/' + o.id + '/mockpay', undefined, c, 200)).body;
        assert.ok(!attempt.checkoutUrl.includes('app//'));
        await req('POST', '/orders/' + o.id + '/payment', { method: 'CASH' }, a, 409);
        await req('POST', '/orders/' + o.id + '/cancel', {}, c, 409);
        // Una notificación falsificada no cambia PENDING: manda la respuesta real del proveedor.
        await req('POST', '/mockpay/webhook', { id: attempt.gatewayId, status: 'SUCCEEDED' }, null, 201);
        assert.equal((await db.order.findUnique({ where: { id: o.id } })).status, 'PENDING');
        remote.get(attempt.gatewayId).status = 'SUCCEEDED';
        remote.get(attempt.gatewayId).amount = 0.01;
        await req('POST', '/orders/' + o.id + '/mockpay/sync', {}, c, 502);
        assert.equal(await db.payment.count({ where: { orderId: o.id } }), 0);
        remote.get(attempt.gatewayId).amount = 30;
        await req('POST', '/orders/' + o.id + '/mockpay/sync', {}, c, 201);
        await req('POST', '/mockpay/webhook', { id: attempt.gatewayId, event: 'payment.succeeded' }, null, 201);
        assert.equal(await db.payment.count({ where: { orderId: o.id } }), 1);
        assert.equal((await db.order.findUnique({ where: { id: o.id } })).status, 'PAID');
        const y = await cart(c, 'WEB', [[product.id, 1]]);
        const failedOrder = (await req('POST', '/carts/' + y.id + '/checkout', { idempotencyKey: 'mockpay-failed-001', addressId: address.id }, c, 201)).body;
        const failed = (await req('POST', '/orders/' + failedOrder.id + '/mockpay', {}, c, 201)).body;
        const config = app.get(require('@nestjs/config').ConfigService);
        const mode = config.get('NODE_ENV');
        config.set('NODE_ENV', 'production');
        await req('POST', '/orders/' + failedOrder.id + '/mockpay/demo', { scenario: 'SUCCESS' }, c, 403);
        config.set('NODE_ENV', mode);
        await req('POST', '/orders/' + failedOrder.id + '/mockpay/demo', { scenario: 'INSUFFICIENT_FUNDS' }, c, 201);
        assert.equal(await db.payment.count({ where: { orderId: failedOrder.id } }), 0);
        await req('POST', '/orders/' + failedOrder.id + '/cancel', {}, c, 201);
        // Un resultado de creación incierto bloquea reintentos que podrían duplicar intenciones.
        const z = await cart(c, 'WEB', [[product.id, 1]]);
        const uncertain = (await req('POST', '/carts/' + z.id + '/checkout', { idempotencyKey: 'mockpay-unknown-001', addressId: address.id }, c, 201)).body;
        gateway.create = async () => { throw new (require('@nestjs/common').BadGatewayException)('Timeout de prueba'); };
        await req('POST', '/orders/' + uncertain.id + '/mockpay', {}, c, 502);
        await req('POST', '/orders/' + uncertain.id + '/mockpay', {}, c, 409);
        assert.equal(await db.gatewayAttempt.count({ where: { orderId: uncertain.id } }), 1);
      } finally { gateway.create = originalCreate; gateway.get = originalGet; gateway.processDemo = originalDemo; }
    });
    await t.test('Stock coincide con movimientos y Swagger documenta rutas', async () => {
      for (const p of await db.product.findMany()) {
        const sum = await db.inventoryMovement.aggregate({ where: { productId: p.id }, _sum: { quantityDelta: true } });
        assert.equal(p.stock, sum._sum.quantityDelta);
      }
      const doc = await (await fetch(base + '/api/docs-json')).json();
      assert.ok(doc.paths['/api/carts/{id}/checkout']);
      assert.ok(doc.components.securitySchemes.bearer);
      assert.ok(doc.components.schemas.CheckoutDto);
      // CONTRATOS: toda ruta tiene esquema de éxito y errores normalizados.
      for (const item of Object.values(doc.paths)) for (const [method, operation] of Object.entries(item)) {
        if (!['get', 'post', 'put', 'patch', 'delete'].includes(method)) continue;
        const success = operation.responses['200'] ?? operation.responses['201'];
        assert.ok(success?.content?.['application/json']?.schema);
        assert.ok(operation.responses['400'].content['application/json'].schema);
      }
      assert.equal(doc.components.schemas.PublicProduct.properties.salePrice.type, 'string');
      assert.equal(Object.hasOwn(doc.components.schemas.PublicProduct.properties, 'acquisitionCost'), false);
    });
  } finally { await app.close(); }
});
