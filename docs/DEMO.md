# Demostración desde Swagger

Inicia iniciar-local.cmd, abre http://localhost:3000/api/docs y consulta .local/ACCESOS-DEMO.md. Usa los IDs devueltos por la API: no supongas que siempre valen 1. Duración sugerida: 10 a 15 minutos.

## 1. Catálogo e identidad

GET /api/health debe mostrar estado ok y moneda GTQ. Consulta GET /api/products con search=filtro y explica que el costo de compra es privado.

En POST /api/auth/login usa el cliente de demostración. Copia accessToken a Authorize; Swagger añade Bearer. GET /api/auth/me muestra su identidad. GET /api/users debe rechazarlo con 403.

## 2. Compra web e idempotencia

1. Consulta GET /api/addresses y toma una dirección propia.
2. Consulta GET /api/products, selecciona un producto disponible y anota el stock.
3. Crea carrito con POST /api/carts y el cuerpo {"channel":"WEB"}.
4. Agrega dos unidades con PUT /api/carts/{id}/items: {"productId":1,"quantity":2}. Cambia productId al ID real.
5. Confirma con POST /api/carts/{id}/checkout:

~~~json
{"idempotencyKey":"demo-web-primera-001","addressId":1}
~~~

Cambia addressId al ID real. Anota el pedido: PENDING, total precio × 2, sin envío. Consulta el producto: dos unidades menos. Repite EXACTAMENTE el checkout: mismo pedido y mismo stock. Para otra compra utiliza un carrito y una clave nuevos.

## 3. Pago y logística

Inicia sesión como administrador y reemplaza el token. Busca el pedido con GET /api/orders?channel=WEB&status=PENDING.

- POST /api/orders/{id}/payment: {"method":"TRANSFER","reference":"Pago verificado de demostración"}. Estado PAID.
- PATCH /api/orders/{id}/status: {"status":"IN_TRANSIT"}.
- Repite el cambio con {"status":"DELIVERED"}.

Explica que se comprueba el orden de estados y que el cliente no puede declararse pagado. El motorista cobra el delivery fuera del sistema.

## 4. Venta POS y caja

Como administrador abre caja con POST /api/cash-sessions: {"openingAmount":200}. Si existe una abierta, selecciona su ID de GET /api/cash-sessions.

Inicia sesión como cajero. Crea carrito POS, agrega una unidad y confirma:

~~~json
{"idempotencyKey":"demo-pos-efectivo-001","cashSessionId":1,"paymentMethod":"CASH"}
~~~

Cambia el ID de caja. El pedido contiene comprobante REP-..., estado COMPLETED y pago. El catálogo público refleja el stock actualizado después de confirmar.

Vuelve a administrador. GET /api/cash-sessions/{id} muestra esperado y totales por método. Apertura Q200 más venta CASH Q195 da Q395. Una venta CARD se reporta aparte y no incrementa el efectivo.

Cierra con POST /api/cash-sessions/{id}/close: {"countedAmount":395}, usando el efectivo correspondiente a tus ventas. Diferencia negativa significa faltante; positiva, sobrante. Una caja cerrada rechaza nuevos cobros.

## 5. Cancelación y stock

Crea otro pedido WEB pendiente y cancélalo con POST /api/orders/{id}/cancel como cliente dueño o administrador. Comprueba que repone unidades. Repite la cancelación: no se suman otra vez.

Confirma una compra con cantidad mayor que stock: debe responder 409 y conservar los datos. Las pruebas automatizadas cubren compras simultáneas de la última unidad y cierre/cobro concurrentes.

## 6. Explicación técnica

Muestra docs/DER.md, prisma/schema.prisma, src/sales/sales.service.ts y src/common/security.ts. Explica 11 tablas, transacción, idempotencia y Guards.

La base incluye tres roles, cuatro categorías, ocho repuestos, ventas POS y pedidos en varios estados. Son ejemplos ficticios. La publicación del curso se completará después en Render y Supabase.

