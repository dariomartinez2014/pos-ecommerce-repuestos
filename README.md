# Repuestos — POS & E-commerce

API del proyecto final de backend: ventas de mostrador, web y redes sociales con inventario compartido. Moneda: quetzales (GTQ).

Repositorio privado: [pos-ecommerce-repuestos](https://github.com/dariomartinez2014/pos-ecommerce-repuestos). Los cambios y la documentación se escriben en español.

## Estado

Implementado con NestJS, TypeScript, PostgreSQL, Prisma, Passport/JWT y Swagger. Incluye 12 tablas, migraciones, datos de demostración, pruebas de integración y comentarios en español. Publicado en Render con PostgreSQL en Supabase y MockPay configurado para las direcciones públicas.

- [Swagger público](https://pos-ecommerce-repuestos.onrender.com/api/docs)
- [Estado del servidor y PostgreSQL](https://pos-ecommerce-repuestos.onrender.com/api/health)
- [Catálogo de repuestos](https://pos-ecommerce-repuestos.onrender.com/api/products)

Validación: 15 comprobaciones de integración locales y 31 comprobaciones públicas de catálogo, identidad, compra WEB, pagos ficticios, cancelación, administración, ventas POS, caja y logística. Consulta docs/ENTREGA-PUBLICA.md.

## Inicio local en Windows

1. Abre la carpeta del proyecto y ejecuta iniciar-local.cmd con doble clic.
2. Mantén abierta la consola y abre [Swagger local](http://localhost:3000/api/docs).
3. Consulta los usuarios y la contraseña privada en .local/ACCESOS-DEMO.md.

Requiere Node.js 22.12 o superior y PostgreSQL instalado. Esta computadora tiene ambos. El inicio prepara dependencias, Prisma, migraciones, compilación y ejemplos. Las ejecuciones posteriores conservan tus datos. PostgreSQL usa 127.0.0.1:55433, contraseña aleatoria y el directorio propio .local/postgres.

Desde PowerShell, dentro de la carpeta:

~~~powershell
# Preparar e iniciar; úsalo después de modificar código.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/iniciar-local.ps1 -Preparar
# Inicio rápido después de preparar.
npm run local:start
~~~

Si un entorno restringido informa spawn EPERM al migrar, utiliza el adaptador local del mismo motor Prisma:

~~~powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/iniciar-local.ps1 -Preparar -EngineFallback
~~~

Ctrl+C detiene la API. Para detener ordenadamente su base:

~~~powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/detener-base.ps1
~~~

.env y .local/ contienen secretos; Git los excluye. El inicializador preserva las contraseñas. Cambiar SEED_PASSWORD después de crear cuentas no cambia sus contraseñas.

El entorno de construcción protege las escrituras en .git, por lo que la subida inicial se realiza directamente con la API de GitHub. Para conectar el historial local desde tu propia consola, ejecuta scripts/conectar-github.ps1. También puedes clonar el repositorio en otra carpeta cuando necesites trabajar con Git desde cero.

## Instalación con otra base PostgreSQL

~~~powershell
# Instalar las versiones fijadas y completar variables privadas.
npm ci
Copy-Item .env.example .env
# Generar cliente, aplicar migraciones y cargar ejemplos.
npm run prisma:generate
npm run db:deploy
npm run build
npm run db:seed
npm start
~~~

Completa DATABASE_URL, un JWT_SECRET aleatorio de al menos 32 caracteres y SEED_PASSWORD de al menos 12. Swagger: /api/docs; OpenAPI JSON: /api/docs-json; estado: /api/health. El seed crea ejemplos faltantes y conserva los registros existentes.

## Funciones

| Área | Comportamiento |
| --- | --- |
| Identidad | Registro de clientes, JWT, roles y desactivación |
| Catálogo | Categorías, repuestos, costos privados, búsqueda y paginación |
| Inventario | Ajustes con motivo; stock y movimientos cambian juntos |
| POS | Carrito, pago, comprobante y caja abierta obligatoria |
| E-commerce | Direcciones propias, carrito, confirmación e historial |
| Logística | WEB/SOCIAL: pendiente, pagado, en camino y entregado |
| Cancelación | Pendientes sin pago; reposición una sola vez |
| Caja | Apertura única, cierre y diferencia de efectivo |

El carrito no reserva stock; checkout lo descuenta. Repetir la confirmación devuelve el pedido existente mediante idempotencyKey. El servidor calcula totales y guarda precio, costo y dirección históricos. El delivery se paga al transportista y queda fuera del total.

Los importes JSON son cadenas decimales: "195" o "195.00" equivalen a Q195.00. Fechas en UTC; filtro de día comercial de Guatemala (UTC-6).

## Pruebas

~~~powershell
# Base separada: limpia únicamente tablas de pos_ecommerce_test.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/probar-local.ps1
# Variante para el entorno restringido de construcción.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/probar-local.ps1 -EngineFallback
~~~

En otros entornos, migra una base terminada en _test, configura TEST_DATABASE_URL, compila y ejecuta npm run test:e2e.

## Organización y documentos

src/auth, catalog, addresses, sales y cash agrupan cada área en módulos, controladores, servicios y DTOs. src/common contiene Guards, filtro, interceptor y OpenAPI. src/prisma administra la conexión. prisma guarda schema, migraciones y seed; scripts, los ayudantes locales.

- docs/GUIA-DEFENSA.md: arquitectura y preguntas de entrevista.
- docs/DEMO.md: demostración desde Swagger.
- docs/ENDPOINTS.md: rutas y permisos.
- docs/DER.md y diagrama.dbml: diagrama y versión editable.
- modelo-datos.md y requerimientos.md: diseño y alcance.
- docs/PRUEBAS.md: verificaciones y límites.
- docs/ENTREGA-PUBLICA.md: publicación, comandos y verificaciones pendientes.

Esta entrega corresponde a la API del curso. Interfaz visual, pasarela bancaria, reembolsos y mejoras comerciales podrán agregarse después de la publicación requerida.

## Integración MockPay

Consulta docs/MOCKPAY.md para crear intenciones, probar tarjetas ficticias y verificar pagos. La tabla gateway_attempts conserva su correlación; la llave secreta permanece en .env. El registro de pago CARD puede proceder de una aprobación verificada de la pasarela.
