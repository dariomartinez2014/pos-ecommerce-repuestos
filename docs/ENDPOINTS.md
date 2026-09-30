# Rutas y permisos

Prefijo común: /api. En Swagger pega accessToken de login en Authorize. Los Guards comprueban JWT y rol; los servicios comprueban propiedad y estado.

| Método | Ruta | Permiso y función |
| --- | --- | --- |
| GET | /health | Público; estado de backend y PostgreSQL |
| POST | /auth/register | Público; crea CUSTOMER |
| POST | /auth/login | Público; token de una hora |
| GET | /auth/me | Autenticado; identidad actual |
| GET | /users | ADMIN; máximo 100 cuentas sin hashes |
| POST | /users | ADMIN; crear cuenta y asignar rol |
| PATCH | /users/:id/active | ADMIN; activar/desactivar; no puede desactivarse a sí mismo |
| GET | /categories | Público; categorías activas |
| POST | /categories | ADMIN; crear |
| PATCH | /categories/:id | ADMIN; renombrar |
| DELETE | /categories/:id | ADMIN; desactivar |
| GET | /products | Público; catálogo sin costos |
| GET | /products/internal | ADMIN; catálogo con costos e inactivos |
| GET | /products/:id | Público; producto activo de categoría activa |
| POST | /products | ADMIN; crear con stock cero |
| PATCH | /products/:id | ADMIN; editar |
| DELETE | /products/:id | ADMIN; desactivar |
| POST | /products/:id/stock | ADMIN; ajuste entero con motivo |
| GET | /addresses | CUSTOMER; direcciones propias |
| POST | /addresses | CUSTOMER; guardar dirección propia |
| PATCH | /addresses/:id | CUSTOMER dueño; editar |
| DELETE | /addresses/:id | CUSTOMER dueño; eliminar |
| POST | /carts | CUSTOMER: WEB; CASHIER: POS; ADMIN: POS/SOCIAL |
| GET | /carts/:id | Creador; consultar |
| PUT | /carts/:id/items | Creador; fijar cantidad en carrito abierto |
| DELETE | /carts/:id/items/:productId | Creador; retirar del carrito abierto |
| POST | /carts/:id/checkout | Creador; confirmar según canal |
| GET | /orders | CUSTOMER: propios; CASHIER: sus POS; ADMIN: todos |
| GET | /orders/:id | Mismo alcance que listado |
| POST | /orders/:id/payment | ADMIN; cobrar WEB/SOCIAL pendiente |
| PATCH | /orders/:id/status | ADMIN; PAID → IN_TRANSIT → DELIVERED |
| POST | /orders/:id/cancel | ADMIN o CUSTOMER dueño; pendiente sin pago |
| GET | /cash-sessions | ADMIN/CASHIER; últimas 100 sesiones |
| POST | /cash-sessions | ADMIN; una única abierta |
| GET | /cash-sessions/:id | ADMIN; conciliación |
| POST | /cash-sessions/:id/close | ADMIN; cerrar y registrar contado |

## Filtros y confirmación

Catálogo: page=1&limit=20&search=filtro&categoryId=2. Pedidos: page=1&limit=20&channel=WEB&status=PENDING&date=2026-09-29. Máximo 100 por página. La fecha usa el día comercial de Guatemala. Los filtros no amplían la propiedad del usuario.

| Canal | Datos adicionales de checkout | Estado inicial |
| --- | --- | --- |
| WEB | addressId propio | PENDING |
| POS | cashSessionId abierto y paymentMethod | COMPLETED con pago |
| SOCIAL | recipientName, recipientPhone, deliveryAddress; referencia opcional | PENDING |

Todos requieren idempotencyKey única de 8 a 100 caracteres. Precios y totales se obtienen y calculan en el servidor.

GET/PUT/PATCH/DELETE devuelven 200. POST devuelve 201, excepto login (200). Bajas de categorías/productos devuelven el registro desactivado. Eliminar dirección devuelve el registro eliminado.

## Respuestas

400: datos inválidos; 401: autenticación; 403: permiso; 404: recurso; 409: duplicado, stock o estado; 429: límite; 500: error interno. Swagger documenta esquemas de éxito y error. Cada ruta puede utilizar un subconjunto de esos errores.

~~~json
{"statusCode":409,"message":"Stock insuficiente para producto 1","path":"/api/carts/1/checkout","timestamp":"2026-09-29T18:00:00.000Z"}
~~~

Listados paginados: data, total, page y limit. El catálogo público omite acquisitionCost; pedidos y carritos omiten unitCost. CARD y TRANSFER describen pagos verificados administrativamente, sin conexión automática con un banco. Importes JSON en cadenas decimales y moneda GTQ.

