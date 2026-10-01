# Modelo de datos implementado

Modelo de 12 tablas. Los roles, canales y estados son enums; no se crean tablas artificiales únicamente para alcanzar el mínimo.

| Tabla | Responsabilidad |
|---|---|
| users | Cuentas, hash de contraseña, rol y estado activo |
| categories | Agrupaciones del catálogo |
| products | SKU, nombre, categoría, costo, precio y stock actual |
| addresses | Direcciones reutilizables de cada cliente |
| carts | Carritos abiertos de clientes o ventas de mostrador en preparación |
| cart_items | Productos y cantidades de un carrito |
| orders | Venta confirmada, canal, comprador, estado y destino histórico |
| order_items | Líneas con cantidades, precios y costos históricos |
| payments | Registro de pago completo y método usado |
| cash_sessions | Apertura, cierre y conciliación de caja |
| inventory_movements | Registro de entradas, descuentos, ajustes y reposiciones |

## Relaciones
- Una categoría tiene muchos productos.
- Un usuario tiene muchas direcciones, carritos y pedidos.
- Un carrito contiene muchas líneas; cada línea refiere a un producto.
- Un pedido contiene muchas líneas y puede tener un pago completo.
- Una sesión de caja agrupa muchas ventas POS.
- Un producto tiene muchos movimientos de inventario.
- Un pedido puede generar movimientos de venta o cancelación.

## Decisiones que debes poder explicar
1. `cart_items` y `order_items` resuelven relaciones muchos-a-muchos con atributos propios: cantidad y, en la venta, valores históricos.
2. Carrito y pedido son distintos: el primero cambia y no reserva inventario; el segundo conserva la operación confirmada.
3. POS y WEB usan `orders` e inventario compartidos. `channel` diferencia sus flujos; no duplicamos tablas de productos o stock.
4. La dirección copiada en el pedido es un dato histórico, no un duplicado accidental de la dirección actual.
5. Precio y costo de la línea son valores de aquella venta. No se recalculan al consultar el ticket.
6. `products.stock` facilita comprobar disponibilidad; `inventory_movements` registra por qué cambió. Ambos se actualizan juntos y deben reconciliarse.
7. `orders.total` es un resumen persistido de las líneas; lo calcula exclusivamente el servidor dentro de la confirmación.
8. `payments.order_id` es único por la decisión de admitir un pago completo. Cambiar a pagos parciales requiere ampliar esa regla.
9. No hay costo de envío en el modelo porque el requerimiento lo excluye.

## Restricciones implementadas en migraciones y servicios
El DBML describe columnas, llaves y cardinalidades; no implementa por sí solo toda la integridad.

- CHECK para stock no negativo, cantidades positivas, precios positivos y costos no negativos.
- Índice único parcial para una sola sesión de caja abierta en la caja física única.
- Validación de canal: POS exige sesión abierta; WEB/SOCIAL exige destinatario y destino.
- Pago y transición de estado coherentes; un pedido no puede pagarse dos veces.
- Permisos por rol y pertenencia; fechas y transiciones válidas.
- Idempotencia y operaciones atómicas de confirmación y cancelación.
- Mantener historial: no borrar productos, usuarios o categorías referenciados por ventas; desactivarlos cuando corresponda.
- Evitar carreras entre cierre de caja y cobros, y entre compras de las últimas unidades.

Implementado en prisma/schema.prisma. La migración inicial crea tablas, relaciones, CHECK e índices; fue aplicada en PostgreSQL local y registrada por el motor Prisma. Diagrama completo: docs/DER.md.

## Integración MockPay

Consulta docs/MOCKPAY.md para crear intenciones, probar tarjetas ficticias y verificar pagos. La tabla gateway_attempts conserva su correlación; la llave secreta permanece en .env. El registro de pago CARD puede proceder de una aprobación verificada de la pasarela.
