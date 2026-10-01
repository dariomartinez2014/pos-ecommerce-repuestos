# Pasarela MockPay del curso

MockPay simula pagos educativos. Integración revisada el 1 de octubre de 2026 contra https://mockpay-frontend.vercel.app/.

## Configuración y URLs

La tienda ya está registrada para pruebas locales. MOCKPAY_SECRET_KEY está únicamente en .env. La clave pública no es necesaria para el checkout alojado.

MOCKPAY_API_URL=https://mockpay-backend.onrender.com

El cliente crea /api/v1/payments con una sola barra. Corrige también el checkout_url: el proveedor devuelve app//checkout y la tienda entrega app/checkout, conservando https://.

## Probar desde Swagger

1. Autorizar como cliente, crear carrito WEB, agregar productos y confirmar con dirección propia.
2. POST /api/orders/{id}/mockpay sin cuerpo crea o recupera la intención.
3. Abrir checkoutUrl para ver la pantalla de MockPay. GET /api/orders/{id}/mockpay recupera enlace y estado.
4. POST /api/orders/{id}/mockpay/demo permite probar desde Swagger:

~~~json
{"scenario":"SUCCESS"}
~~~

También admite INSUFFICIENT_FUNDS y DECLINED. Usar un pedido nuevo por escenario. SUCCESS verifica el proveedor y deja PAID con pago CARD. Un rechazo deja PENDING, sin pago. Un intento FAILED permite otro intento o cancelar. Los intentos activos bloquean pago manual y cancelación.

La ruta demo utiliza solo tarjetas ficticias codificadas en el servidor. Funciona en development/test y se rechaza en production.

## Problema en el formulario externo

La versión compartida envía 4242 4242 4242 4242 con espacios y su API devuelve HTTP 400: Card number must be between 13 and 16 digits. Los mismos dígitos sin espacios sí aprueban. La ruta demo permite probar el backend de MockPay sin modificar el sitio externo. El checkout alojado podrá utilizarse normalmente cuando el curso corrija el formulario.

## Webhook y sincronización

POST /api/mockpay/webhook recibe notificaciones. El backend consulta nuevamente a MockPay y verifica ID remoto, moneda GTQ, total, order_id y attempt_id. No confía en el estado enviado por el visitante.

GET /api/mockpay/return informa al usuario y no confirma pagos. El retorno de cancelación tampoco cancela el pedido.

MockPay no puede enviar webhooks desde internet a localhost. POST /api/orders/{id}/mockpay/sync consulta el resultado real; la ruta demo también sincroniza. Al publicar, registrar un comercio de ese entorno con webhook_url pública terminada en /api/mockpay/webhook y sus URLs de retorno/cancelación. Guardar la llave en Render y configurar NODE_ENV=production.

La guía del curso no publica firma de webhook: por eso la notificación solo inicia una consulta externa, sin ser prueba de pago.

## Integridad y estados

gateway_attempts es la tabla número 12. Un índice parcial permite un intento activo por pedido. Se bloquea el pedido para coordinar creación, pago manual, aplicación de pago y cancelación. HTTP ocurre fuera de la transacción.

Sincronizaciones repetidas crean un único pago y no descuentan stock nuevamente. El inventario se descontó en checkout.

CREATING: solicitud en preparación. PENDING: creada, falta resultado. SUCCEEDED: aprobado. FAILED: rechazado. UNKNOWN: la respuesta de creación fue incierta.

UNKNOWN bloquea otra intención: un timeout no garantiza que el proveedor no la creó. Si se perdió el ID remoto, requiere revisión con el proveedor; no hay recuperación automática que arriesgue duplicar el cobro.

POS continúa usando caja y pagos presenciales. El pago manual sigue disponible cuando no hay intento activo.

## Código

src/mockpay contiene módulo, cliente HTTP, servicio, controladores y DTOs. La migración 202610010001_mockpay crea tabla e índice parcial. Las pruebas cubren propiedad, enlaces, concurrencia de creación, importes falsos, notificaciones repetidas, rechazo y timeout.
