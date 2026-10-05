// Describe respuestas OpenAPI: tipos, listas, importes y errores. Documentar una respuesta no ejecuta la operación.

import { OpenAPIObject } from '@nestjs/swagger';
import { SchemaObject, ReferenceObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
// los Decimal se serializan como cadenas; todos los importes están en GTQ.
const integer: SchemaObject = { type: 'integer', example: 1 };
const text: SchemaObject = { type: 'string' };
const nullableText: SchemaObject = { ...text, nullable: true };
const money: SchemaObject = { type: 'string', example: '195.00', description: 'Importe decimal en quetzales (GTQ)' };
const date: SchemaObject = { type: 'string', format: 'date-time', example: '2026-09-29T18:00:00.000Z' };
const ref = (name: string): ReferenceObject => ({ $ref: `#/components/schemas/${name}` });
const array = (name: string): SchemaObject => ({ type: 'array', items: ref(name) });
const object = (properties: Record<string, SchemaObject | ReferenceObject>, required = Object.keys(properties)): SchemaObject => ({ type: 'object', properties, required });
const enumString = (...values: string[]): SchemaObject => ({ type: 'string', enum: values });
const page = (name: string): SchemaObject => object({ data: array(name), total: integer, page: integer, limit: { type: 'integer', example: 20 } });
const cashProperties = { id: integer, openedById: integer, closedById: { ...integer, nullable: true }, openingAmount: money, countedAmount: { ...money, nullable: true }, expectedAmount: { ...money, nullable: true }, openedAt: date, closedAt: { ...date, nullable: true } };
const productProperties = { id: integer, sku: { ...text, example: 'FRE-001' }, name: { ...text, example: 'Pastillas de freno delanteras' }, description: nullableText, salePrice: money, stock: integer, active: { type: 'boolean' } as SchemaObject, category: object({ id: integer, name: text }) };
// DOCUMENTACIÓN: cada ruta declara su respuesta real, no altera el comportamiento de la API.
// BLOQUE documentResponses: Agrega schemas, respuestas y errores a las operaciones Swagger; no modifica el comportamiento del servidor.
export function documentResponses(doc: OpenAPIObject) {
  const schemas: Record<string, SchemaObject> = {
    ApiError: object({ statusCode: integer, message: { oneOf: [text, { type: 'array', items: text }] }, path: text, timestamp: date }),
    SafeUser: object({ id: integer, name: text, email: { type: 'string', format: 'email' }, phone: nullableText, role: enumString('ADMIN', 'CASHIER', 'CUSTOMER'), active: { type: 'boolean' } }),
    Token: object({ accessToken: text, tokenType: { type: 'string', example: 'Bearer' }, expiresIn: { type: 'integer', example: 3600 } }),
    Health: object({ status: { type: 'string', example: 'ok' }, store: { type: 'string', example: 'Repuestos' }, currency: { type: 'string', example: 'GTQ' } }),
    Category: object({ id: integer, name: { ...text, example: 'Frenos' }, active: { type: 'boolean' } }),
    PublicProduct: object(productProperties),
    InternalProduct: object({ ...productProperties, acquisitionCost: money }),
    ProductRecord: object({ id: integer, categoryId: integer, sku: productProperties.sku, name: productProperties.name, description: nullableText, acquisitionCost: money, salePrice: money, stock: integer, active: { type: 'boolean' }, createdAt: date }),
    ProductsPage: page('PublicProduct'), InternalProductsPage: page('InternalProduct'),
    Address: object({ id: integer, userId: integer, recipientName: text, phone: text, addressLine: text, reference: nullableText }),
    CartProduct: object({ id: integer, name: text, sku: text, salePrice: money, stock: integer, active: { type: 'boolean' } }),
    CartItem: object({ id: integer, cartId: integer, productId: integer, quantity: integer, product: ref('CartProduct') }),
    Cart: object({ id: integer, createdById: integer, customerId: { ...integer, nullable: true }, channel: enumString('POS', 'WEB', 'SOCIAL'), status: enumString('OPEN', 'CONVERTED', 'ABANDONED'), createdAt: date, items: array('CartItem') }, ['id', 'createdById', 'customerId', 'channel', 'status', 'createdAt']),
    OrderItem: object({ id: integer, productId: integer, productName: text, quantity: integer, unitPrice: money }),
    Payment: object({ id: integer, orderId: integer, recordedById: integer, method: enumString('CASH', 'CARD', 'TRANSFER'), amount: money, reference: nullableText, paidAt: date }),
    Order: object({ id: integer, receiptNumber: { ...text, example: 'REP-00000000-0000-4000-8000-000000000001' }, idempotencyKey: text, cartId: { ...integer, nullable: true }, customerId: { ...integer, nullable: true }, createdById: integer, cashSessionId: { ...integer, nullable: true }, channel: enumString('POS', 'WEB', 'SOCIAL'), status: enumString('PENDING', 'PAID', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'COMPLETED'), total: money, recipientName: nullableText, recipientPhone: nullableText, deliveryAddress: nullableText, deliveryReference: nullableText, createdAt: date, updatedAt: date, items: array('OrderItem'), payment: { ...ref('Payment'), nullable: true } }),
    OrdersPage: page('Order'), CashSession: object(cashProperties),
    CashReport: object({ ...cashProperties, totalsByMethod: { type: 'array', items: object({ method: enumString('CASH', 'CARD', 'TRANSFER'), _sum: object({ amount: { ...money, nullable: true } }), _count: object({ _all: integer }) }) }, difference: { ...money, nullable: true } }),
  };
  doc.components ??= {};
  doc.components.schemas = { ...doc.components.schemas, ...schemas };
  // MÉTODO Y RUTA: una lista explícita permite detectar endpoints sin documentar en pruebas.
  const routes: [string, string, string, boolean?][] = [
    ['get', '/api/health', 'Health'], ['post', '/api/auth/register', 'SafeUser'], ['post', '/api/auth/login', 'Token'], ['get', '/api/auth/me', 'SafeUser'],
    ['get', '/api/users', 'SafeUser', true], ['post', '/api/users', 'SafeUser'], ['patch', '/api/users/{id}/active', 'SafeUser'],
    ['get', '/api/categories', 'Category', true], ['post', '/api/categories', 'Category'], ['patch', '/api/categories/{id}', 'Category'], ['delete', '/api/categories/{id}', 'Category'],
    ['get', '/api/products', 'ProductsPage'], ['get', '/api/products/internal', 'InternalProductsPage'], ['get', '/api/products/{id}', 'PublicProduct'], ['post', '/api/products', 'ProductRecord'], ['patch', '/api/products/{id}', 'ProductRecord'], ['delete', '/api/products/{id}', 'ProductRecord'], ['post', '/api/products/{id}/stock', 'ProductRecord'],
    ['get', '/api/addresses', 'Address', true], ['post', '/api/addresses', 'Address'], ['patch', '/api/addresses/{id}', 'Address'], ['delete', '/api/addresses/{id}', 'Address'],
    ['post', '/api/carts', 'Cart'], ['get', '/api/carts/{id}', 'Cart'], ['put', '/api/carts/{id}/items', 'Cart'], ['delete', '/api/carts/{id}/items/{productId}', 'Cart'], ['post', '/api/carts/{id}/checkout', 'Order'],
    ['get', '/api/orders', 'OrdersPage'], ['get', '/api/orders/{id}', 'Order'], ['post', '/api/orders/{id}/payment', 'Order'], ['patch', '/api/orders/{id}/status', 'Order'], ['post', '/api/orders/{id}/cancel', 'Order'],
    ['get', '/api/cash-sessions', 'CashSession', true], ['post', '/api/cash-sessions', 'CashSession'], ['get', '/api/cash-sessions/{id}', 'CashReport'], ['post', '/api/cash-sessions/{id}/close', 'CashReport'],
  ];
  // RUTAS DE PASARELA: preservan su respuesta específica y comparten los errores normalizados.
  for (const [path, item] of Object.entries(doc.paths)) for (const method of ['get', 'post'] as const) {
    const operation = item[method];
    if (!operation || !path.includes('mockpay')) continue;
    for (const code of ['400','401','403','404','409','429','500','502','503']) operation.responses[code] = { description: 'Error de validación, acceso, estado o comunicación con MockPay', content: { 'application/json': { schema: ref('ApiError') } } };
  }
  for (const [method, path, name, isArray] of routes) {
    const operation = doc.paths[path]?.[method as 'get' | 'post' | 'patch' | 'put' | 'delete'];
    if (!operation) throw new Error(`Ruta Swagger no encontrada: ${method} ${path}`);
    const status = method === 'post' && path !== '/api/auth/login' ? '201' : '200';
    operation.responses[status] = { description: 'Operación completada; importes en GTQ', content: { 'application/json': { schema: isArray ? array(name) : ref(name) } } };
    const protectedRoute = !!operation.security?.length;
    for (const [code, description] of Object.entries({ '400': 'Datos inválidos o regla de entrada incumplida', ...(protectedRoute ? { '401': 'JWT ausente, vencido o cuenta desactivada', '403': 'Rol o propiedad no autorizados' } : {}), '404': 'Recurso no disponible', '409': 'Conflicto de estado, duplicado o stock insuficiente', '429': 'Límite de solicitudes alcanzado', '500': 'Fallo interno; los detalles quedan en el servidor' })) {
      operation.responses[code] = { description, content: { 'application/json': { schema: ref('ApiError') } } };
    }
    operation.description = `${operation.description ?? ''} ${protectedRoute ? 'Requiere JWT. Las restricciones de rol y propiedad se indican en la guía de endpoints.' : 'Acceso público.'} Fechas de respuesta en UTC; filtro de día comercial en UTC-6.`.trim();
  }
}

