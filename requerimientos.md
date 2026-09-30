# Requerimientos — POS & E-commerce

## 1. Objetivo
Construir una API que permita vender productos por mostrador y por internet utilizando un único inventario, y registrar pedidos, pagos y caja.

Fuente: caso de negocio POS & E-commerce y checkpoints compartidos por el estudiante. Las decisiones marcadas como propuestas son elecciones de diseño, no requisitos textuales del curso.

## 2. Alcance obligatorio
- Catálogo con categorías, costo de adquisición, precio de venta y stock.
- Ventas de mostrador con varios productos, método de pago y comprobante interno.
- Registro de clientes web, direcciones, carrito y confirmación de pedidos.
- Pedidos web y pedidos ingresados por ventas en redes sociales.
- Estados de logística y dirección de entrega con referencias.
- Apertura, cierre y conciliación de caja.
- Usuarios y permisos según rol.
- DER normalizado de al menos nueve tablas, API modular, documentación Swagger y despliegue con datos de prueba.

El total incluye únicamente productos. El sistema no calcula, cobra ni muestra tarifas de delivery. El backend es la entrega explícita; la interfaz gráfica completa queda fuera de esta primera etapa. Registrar un pago con tarjeta no implica integrar una pasarela bancaria real.

## 3. Actores
| Actor | Operaciones |
|---|---|
| Visitante | Consultar catálogo público y registrarse como cliente |
| Cliente | Gestionar sus direcciones y carrito, confirmar compras y consultar sus pedidos |
| Cajero | Crear ventas POS, registrar cobros y consultar operaciones permitidas |
| Administrador | Administrar catálogo, stock y cuentas internas; gestionar pedidos y caja |

Propuesta: el administrador abre y cierra las sesiones de caja y los cajeros venden en una sesión abierta. La creación manual de pedidos de redes sociales se asigna al administrador. El administrador inicial se crea mediante seed, no mediante registro público.

## 4. Reglas del sistema
### Identidad y autorización
- El registro público crea exclusivamente clientes activos. No acepta un rol privilegiado elegido por el cliente.
- Administradores y cajeros son creados por un administrador.
- Login mediante Passport y JWT. Contraseñas almacenadas como hash.
- Cada operación valida tanto el rol como la pertenencia del recurso cuando corresponda.
- Clientes no reciben el costo de adquisición ni datos de otros clientes.

### Catálogo e inventario
- Cantidades enteras positivas en carritos y ventas; existencias nunca negativas.
- Propuesta: costo no negativo, precio de venta positivo y una categoría por producto.
- Un producto sin stock puede mostrarse agotado, pero no comprarse.
- Propuesta: agregar al carrito NO reserva stock. Se verifica y descuenta al confirmar la compra web o cobrar la venta POS.
- Pedido, líneas, descuento de stock y movimientos de inventario se guardan en una transacción.
- Ante compras simultáneas, una validación previa aislada no basta: la escritura debe impedir descontar más stock del disponible. Si falla cualquier línea, se revierte toda la compra.
- Reintentar una confirmación no crea otro pedido ni descuenta otra vez: se usa una clave de idempotencia única.

### Precios y ventas
- El servidor calcula el total; no confía en precios ni totales enviados por el cliente.
- Cada línea conserva precio de venta y costo al confirmar, independientemente de cambios posteriores del catálogo.
- Propuesta: moneda única GTQ (quetzales), importes decimales y dos posiciones decimales.
- POS requiere sesión de caja abierta y registra método de pago y comprobante interno único.
- Propuesta: un pago completo por pedido, sin pagos divididos, devoluciones parciales ni integración bancaria en esta primera versión.

### Pedidos y logística
- Propuesta: un único modelo de pedido distingue canales POS, WEB y SOCIAL.
- Confirmar WEB/SOCIAL crea pedido PENDING y descuenta stock; registrar su pago lo lleva a PAID.
- Para entregas: PENDING → PAID → IN_TRANSIT → DELIVERED.
- POS se confirma como COMPLETED al cobrar. No recorre logística de envío.
- Propuesta inicial: cancelar únicamente pedidos WEB/SOCIAL PENDING sin pago. La cancelación repone stock una sola vez en una transacción. Cancelaciones pagadas/reembolsos requieren una política posterior y no se habilitan implícitamente.
- La dirección del pedido se guarda como copia histórica. Editar una dirección del cliente no cambia pedidos anteriores.
- Los pedidos de redes sociales también guardan destinatario, teléfono y referencias aunque el comprador no tenga cuenta.
- Propuesta: la cola logística es una consulta de pedidos por canal y estado; no exige un servidor de mensajería adicional.

### Caja
- Cada venta POS pertenece a una sesión de caja abierta.
- Propuesta: una única caja física y como máximo una sesión abierta.
- Efectivo esperado = fondo inicial + pagos en efectivo de ventas POS de esa sesión.
- Tarjetas y transferencias se reportan por separado y no aumentan el efectivo esperado.
- Diferencia = efectivo contado al cierre − efectivo esperado.
- Una sesión cerrada no admite nuevas ventas. Cierre y cobro deben coordinarse transaccionalmente para evitar ventas posteriores al cierre.
- Primera versión sin retiros, gastos de caja ni reembolsos; si se añaden, deberán modelarse explícitamente.

## 5. Pruebas de aceptación prioritarias
| Caso | Resultado esperado |
|---|---|
| Cliente intenta crear cajero | Acceso rechazado |
| Cliente consulta pedido ajeno | Acceso rechazado |
| Consulta de catálogo público | No muestra costos internos |
| Venta de dos unidades con stock tres | Pedido guardado y stock uno |
| Compra de dos unidades con stock uno | Rechazo sin escrituras parciales |
| Dos compras simultáneas de la última unidad | Como máximo una confirmación exitosa |
| Falla en una línea de venta | Se revierte pedido y descuentos |
| Reintento de la misma confirmación | Mismo resultado, sin duplicados |
| Precio del producto cambia después | Ticket anterior conserva su precio |
| Venta POS y posterior consulta web | Ambas observan el stock actualizado |
| Cancelación pendiente repetida | Stock repuesto una sola vez |
| Edición de dirección del cliente | Pedido anterior conserva dirección original |
| Venta con tarjeta | No aumenta efectivo físico esperado |
| Venta sobre caja cerrada | Operación rechazada |
| Total de pedido | Solo suma productos, sin envío |

## 6. Entrega y evaluación
Modelado 15%; catálogo/inventario 20%; POS 15%; tienda web 10%; logística 10%; usuarios/caja 5%; arquitectura 10%; Swagger 5%; despliegue 10%.

Entrega: DER, schema Prisma y migraciones, repositorio, Swagger público, README, API en Render y PostgreSQL en Supabase con usuarios por rol, categorías, productos, ventas y pedidos en distintos estados.

## 7. Decisiones implementadas
La tienda vende repuestos y usa quetzales, como indicó el estudiante. Una caja física, pago completo y cancelación pendiente son decisiones de diseño implementadas; no se presentan como exigencias textuales del curso. El despliegue sigue pendiente.
