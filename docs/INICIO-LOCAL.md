# Repuestos — POS & E-commerce

API del proyecto final de backend: ventas de mostrador, web y redes sociales con inventario compartido. Moneda: quetzales (GTQ).

## Estado

Implementado con NestJS, TypeScript, PostgreSQL, Prisma, Passport/JWT y Swagger. Incluye 11 tablas, migración, datos de demostración, pruebas de integración y comentarios en español. La publicación en Render y Supabase queda pendiente y es obligatoria para la entrega final del curso.

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
- docs/PUBLICACION-PENDIENTE.md: siguiente etapa.

Esta entrega corresponde a la API del curso. Interfaz visual, pasarela bancaria, reembolsos y mejoras comerciales podrán agregarse después de la publicación requerida.

