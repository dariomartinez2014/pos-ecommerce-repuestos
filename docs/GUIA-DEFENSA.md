# Guía para entender y defender el proyecto

## El problema que resuelve

Una tienda vende repuestos por mostrador, web y redes sociales. Registros separados permiten vender dos veces la misma unidad. La API concentra catálogo, inventario, pedidos, cobros y caja en PostgreSQL. Los tres canales usan los mismos productos y la misma confirmación transaccional.

Puedes presentarlo así: «Mi proyecto es una API para una tienda de repuestos en Guatemala. Unifica ventas presenciales y pedidos digitales con inventario compartido, precios en quetzales y permisos para administrador, cajero y cliente».

## Recorrido de una solicitud

~~~mermaid
flowchart LR
  A[Swagger o cliente] --> B[Guards: JWT y rol]
  B --> C[ValidationPipe y DTO]
  C --> D[Controller: ruta y parámetros]
  D --> E[Service: reglas del negocio]
  E --> F[Prisma y transacción]
  F --> G[(PostgreSQL)]
~~~

Nest ejecuta middleware, Guards, interceptores y Pipes según su ciclo de vida. El interceptor envuelve la ejecución y registra duración. El filtro transforma excepciones en respuestas. Los Guards controlan acceso; DTOs y Pipes validan entradas; servicios comprueban propiedad y reglas.

| Concepto del curso | Archivo para estudiar | Función |
| --- | --- | --- |
| Module | src/app.module.ts y módulos de área | Registra dependencias y componentes |
| Controller | src/sales/sales.controller.ts | Define rutas, parámetros y permisos |
| Service | src/sales/sales.service.ts | Negocio y transacciones |
| DTO | src/sales/sales.dto.ts | Describe y valida entradas |
| Pipe | src/setup.ts | ValidationPipe global |
| Guard | src/common/security.ts | Autenticación y autorización |
| Passport | src/auth/jwt.strategy.ts | Verifica JWT e identidad vigente |
| Filter | src/common/http.ts | Traduce errores sin revelar secretos |
| Interceptor | src/common/http.ts | Registra método, ruta y tiempo |
| ORM | src/prisma/prisma.service.ts | Consultas tipadas y conexión |
| Migración | prisma/migrations/202609290001_initial/migration.sql | Tablas, relaciones y restricciones |
| Swagger | src/setup.ts y src/common/openapi.ts | Entradas, respuestas y autenticación |

## Las 12 tablas

users, categories y products representan identidad y catálogo. addresses guarda destinos reutilizables. carts y cart_items describen la compra en preparación. orders y order_items conservan lo vendido. payments registra el pago. cash_sessions agrupa ventas físicas. inventory_movements explica cambios de stock.

Las tablas de líneas resuelven relaciones muchos-a-muchos y añaden cantidad y valores históricos. Roles y estados son enums. La dirección copiada al pedido y los precios de sus líneas describen aquella operación; cambiar el catálogo o la dirección guardada no altera la historia.

## Checkout: la parte principal

Lee SalesService.checkout y sigue estos pasos:

1. Bloquear el carrito y comprobar quién lo creó.
2. Buscar la clave de idempotencia; devolver la confirmación existente para ese actor/carrito si ya ocurrió.
3. Comprobar canal: caja/pago POS; dirección propia WEB; destinatario SOCIAL.
4. Bloquear productos por orden de ID y validar stock.
5. Calcular total con precios del servidor y Prisma.Decimal.
6. Guardar pedido, líneas, stock, movimientos y pago POS.
7. Convertir el carrito y devolver el pedido.

Todo ocurre en una transacción. Si una línea falla, se revierte la operación completa. SELECT ... FOR UPDATE bloquea filas hasta terminarla. Dos compradores de la última unidad se coordinan: el segundo observa stock después de la confirmación del primero. Ordenar productos por ID reduce bloqueos cruzados. La actualización también exige stock suficiente.

La transacción evita escrituras parciales. La idempotencia evita duplicar una operación confirmada cuyo cliente reintenta por pérdida de conexión. La clave y el carrito son únicos en pedidos. La cancelación bloquea el pedido y repone stock una sola vez.

## Identidad y datos privados

bcrypt guarda el hash de la contraseña. JWT contiene el ID y vence en una hora. Passport comprueba firma y expiración y consulta si la cuenta sigue activa; desactivarla invalida su acceso aunque conserve el token.

Registro público crea CUSTOMER. ValidationPipe rechaza campos no declarados, como role en ese registro. ADMIN crea cuentas internas. RolesGuard lee metadata del método o controlador. El servicio comprueba propiedad: un cliente no puede leer el pedido de otro.

Selecciones de respuesta excluyen hashes y costos privados. Los secretos quedan en .env y luego en variables de entorno. Git excluye .env y .local.

## Dinero y caja

Importes: DECIMAL(12,2) en PostgreSQL y Prisma.Decimal para cálculos. JSON devuelve cadenas para conservar precisión. Moneda: GTQ.

Efectivo esperado = apertura + pagos CASH del POS de la sesión. Tarjeta/transferencia se reportan aparte. Diferencia = contado − esperado. Apertura Q200 + efectivo Q195 = esperado Q395; contar Q390 produce −Q5.

Un índice único parcial permite una sola caja abierta. Checkout y cierre bloquean la misma sesión: si gana el cobro, el cierre lo incluye; si gana el cierre, el cobro se rechaza.

## Logística

WEB/SOCIAL: PENDING → PAID → IN_TRANSIT → DELIVERED. ADMIN registra pago completo y avanza estados. Solo se cancelan pendientes sin pago. POS termina COMPLETED al cobrar. El envío se paga al transportista y no se suma al pedido.

## Preguntas de entrevista

| Pregunta | Idea que debes explicar con tus palabras |
| --- | --- |
| ¿Por qué NestJS? | Módulos, inyección y separación de responsabilidades aprendidas. |
| ¿Por qué carrito y pedido separados? | El primero cambia; el segundo conserva la operación confirmada. |
| ¿Por qué consultar stock antes no basta? | Otra solicitud puede cambiarlo; hay que coordinar lectura y escritura. |
| ¿Qué evita descontar dos veces? | Idempotencia, bloqueo del carrito y restricciones únicas. |
| ¿Qué hace Prisma? | Genera tipos y consultas; PostgreSQL ejecuta y garantiza escrituras. |
| ¿Qué aporta la migración? | Cambios versionados del esquema, reproducibles y registrados. |
| ¿Por qué restricciones SQL? | CHECK e índices parciales complementan el ORM. |
| ¿Cómo proteges recursos ajenos? | JWT/rol en Guards y propiedad en servicios. |
| ¿Qué pasa si cambia un precio? | Nuevas ventas usan el nuevo; anteriores conservan su valor. |
| ¿Cómo compruebas concurrencia? | Solicitudes HTTP simultáneas contra PostgreSQL real. |
| ¿Dónde está la tienda visual? | Esta etapa entrega backend; una interfaz consumiría la API. |
| ¿Qué falta para la entrega final? | Render/Supabase, datos y comprobación desde URL pública. |

## Orden para estudiar

1. Sigue la demo y aprende qué hace cada rol.
2. Dibuja tablas y explica relaciones.
3. Sigue una solicitud desde controller a service y Prisma.
4. Explica checkout, idempotencia, cancelación y caja usando las pruebas.
5. Practica la demo y modifica una validación sencilla para comprobar tu comprensión.

Conviene entender el recorrido del código y poder predecir sus resultados, además de responder las preguntas.


## Integración MockPay

Consulta docs/MOCKPAY.md para crear intenciones, probar tarjetas ficticias y verificar pagos. La tabla gateway_attempts conserva su correlación; la llave secreta permanece en .env. El registro de pago CARD puede proceder de una aprobación verificada de la pasarela.
