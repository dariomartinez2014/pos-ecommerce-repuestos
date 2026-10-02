# Entrega pública — Repuestos

## Direcciones

- API: https://pos-ecommerce-repuestos.onrender.com/api
- Swagger: https://pos-ecommerce-repuestos.onrender.com/api/docs
- Estado con consulta a PostgreSQL: https://pos-ecommerce-repuestos.onrender.com/api/health
- Código: https://github.com/dariomartinez2014/pos-ecommerce-repuestos

Render ejecuta NestJS; Supabase guarda PostgreSQL. La computadora local puede estar apagada. La interfaz de evaluación es Swagger; la entrega corresponde al backend del curso.

## Configuración de Render

Rama main, Node, raíz del repositorio, plan Free.

Build Command:

```bash
npm ci --include=dev && npm run prisma:generate && npm run build
```

Start Command después de cargar ejemplos:

```bash
npm run db:deploy && npm run start
```

Variables: DATABASE_URL (Session pooler de Supabase), JWT_SECRET, NODE_ENV=production, STORE_CURRENCY=GTQ, MOCKPAY_API_URL=https://mockpay-backend.onrender.com y MOCKPAY_SECRET_KEY. No se publican sus valores privados.

La semilla se ejecutó una vez con SEED_PASSWORD y este comando para evitar revisar tipos de TypeScript dentro de la instancia de poca memoria:

```bash
npm run db:deploy && npx ts-node --transpile-only prisma/seed.ts && npm run start
```

El build sí verifica los tipos de los archivos de src. La semilla agrega ejemplos faltantes sin borrar las ventas existentes. Cambiar SEED_PASSWORD después no modifica las contraseñas de usuarios ya creados.

## Accesos de demostración

| Correo | Rol |
| --- | --- |
| admin@repuestos.demo | ADMIN |
| cajero@repuestos.demo | CASHIER |
| cliente@repuestos.demo | CUSTOMER |

La contraseña pública es el valor de SEED_PASSWORD utilizado durante la primera semilla en Render. Puede ser diferente de la contraseña de demostración local. Compartirla con el evaluador por un medio privado; no incluirla en README, commits o capturas.

## Verificación pública

Se aprobaron 31 comprobaciones públicas: 17 de estado, catálogo, identidad, checkout, MockPay e inventario, más 14 de administración, POS, caja y logística. Se comprobaron ocho repuestos sin costos internos, restricciones 401/403, checkout idempotente, descuento único de inventario, URL MockPay normalizada, retorno público, rechazo de webhook cuyo estado no coincide con el proveedor, pago aprobado, fondos insuficientes y reposición al cancelar.

Los pagos usaron exclusivamente tarjetas ficticias del simulador del curso. El pago SUCCESS quedó PAID con pago registrado. INSUFFICIENT_FUNDS quedó PENDING sin pago y luego se canceló para devolver existencias. Repetir sync no duplicó el pago. POST /mockpay/demo permanece bloqueado con 403 en producción.

La pasarela se probó procesando la tarjeta ficticia directamente contra la API de MockPay y verificando el resultado en nuestra API pública. El formulario externo del curso tiene un problema conocido al enviar números con espacios; consulta MOCKPAY.md. Esta validación no confirma que ese formulario externo haya sido reparado ni la entrega automática de todos los webhooks.

También se comprobaron los accesos públicos ADMIN/CASHIER/CUSTOMER, costos internos restringidos, ajustes de inventario reversibles, rechazo de venta con caja cerrada, una sola caja abierta, ventas POS CASH y CARD, conciliación que suma solo efectivo, cierre sin diferencia y rechazo de cierre repetido. Se verificó la secuencia PENDING → PAID → IN_TRANSIT → DELIVERED, con rechazo antes de pagar y rechazo por rol. El pedido SOCIAL conservó su privacidad y pudo cancelarse con autorización.

Ejemplos adicionales de verificación conservados: caja 2 cerrada sin diferencia; pedidos 11 y 12 POS; pedido 13 entregado; pedido 14 SOCIAL cancelado. Son datos ficticios para explicar el funcionamiento. No quedan pendientes de estas comprobaciones administrativas públicas.

## Presentación

1. Mostrar health y catálogo públicos.
2. Explicar módulos, controladores, servicios, DTO, Guards y Prisma.
3. Mostrar compra WEB: dirección, carrito, checkout y descuento de stock.
4. Explicar pago verificado: importe y correlación comprobados contra MockPay; una redirección no acredita un pago.
5. Mostrar idempotencia, rechazo por permisos y cancelación con reposición.
6. Mostrar caja y logística con los accesos públicos verificados.
7. Mostrar el DER de 12 tablas y explicar precio/dirección históricos.

Render Free puede suspenderse por inactividad. Abrir Swagger antes de la presentación. Los documentos GUIA-DEFENSA.md, DEMO.md, DER.md, ENDPOINTS.md y MOCKPAY.md complementan esta guía.
