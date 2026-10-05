# Guía completa del código — Repuestos

Esta guía se construyó leyendo los archivos reales del proyecto. Cada sección explica un archivo y, en TypeScript, cada clase, función, método y campo DTO. El código completo acompaña cada archivo ejecutable escrito para el proyecto. No incluye claves privadas ni copia miles de líneas de dependencias o código generado.

## Cómo estudiar

1. Lee main.ts, app.module.ts y setup.ts.
2. Sigue auth y common/security.ts para entender un login.
3. Recorre catalog y addresses antes de estudiar sales.service.ts.
4. Estudia Prisma y el checkout; después caja y MockPay.
5. Reproduce una petición en Swagger y localiza su controller, DTO, service y modelo.
6. Lee pruebas y scripts al final.

No necesitas memorizar cada línea: debes poder explicar entradas, decisión, efecto en base de datos y respuesta. Los comentarios explican la intención del código con frases cortas en español; TypeScript los ignora. Los import, decorators y funciones sí forman parte del programa.

## Recorrido de una petición

`Swagger → Guard JWT → Guard de roles → Pipe/DTO → Controller → Service → Prisma → PostgreSQL → JSON`

El interceptor envuelve el manejo de la petición para medir su duración; el filtro actúa ante excepciones. Swagger describe el contrato y sirve para probarlo; no es la base de datos ni la tienda visual.

## Diccionario para leer el código

| Código | Significado y ejemplo del proyecto |
| --- | --- |
| import / export | Importa dependencias o permite que otro archivo use una clase/función. |
| class / interface / type | Clase ejecutable; interface/type describen formas de datos en TypeScript. |
| constructor(private readonly service) | NestJS inyecta una instancia; private limita acceso y readonly evita reasignar la referencia. |
| async / await | Espera operaciones de base de datos/HTTP sin bloquear todo el servidor. |
| return / throw | Devuelve un resultado o interrumpe con una excepción. |
| const / let | Referencia no reasignable o variable que puede cambiar. const no congela un objeto. |
| ? / ?. / ?? / ! | Opcional, acceso si existe, valor por defecto ante null/undefined y aserción de no nulo; ! no valida datos en ejecución. |
| ... / {name} / [a,b] | Expande objetos/arreglos, abrevia propiedades y desestructura valores. |
| map / filter / find / includes | Transforma una lista, filtra elementos, busca uno o comprueba pertenencia. |
| @Module / @Injectable | Registra dependencias / permite inyectar un servicio. |
| @Controller / @Get / @Post / @Put / @Patch / @Delete | Declara rutas y métodos HTTP. |
| @Body / @Param / @Query / @CurrentUser | Lee JSON, segmento de ruta, filtros o usuario verificado. |
| @Public / @Roles | Metadata propia que los Guards leen; no son validadores de DTO. |
| @ApiProperty / @ApiOperation | Documenta Swagger; no protege ni valida por sí mismo. |
| @IsString / @IsInt / @IsEnum / @Min / @Max / @IsOptional | Valida tipos, opciones, límites y ausencia permitida mediante ValidationPipe. |
| PartialType | Genera DTO para edición con campos opcionales; conserva validadores. |
| findUnique / findMany / create / update / delete | Operaciones de Prisma sobre modelos. |
| select / include / where | Escoge campos, incorpora relaciones y filtra filas. |
| upsert / updateMany | Crea o actualiza según clave / cambia filas que cumplen condiciones. |
| $transaction / tx | Agrupa operaciones para confirmar todas o revertirlas juntas. |
| FOR UPDATE | Bloquea filas durante una transacción; coordina checkout, pagos y caja. |
| Prisma.Decimal | Hace cálculos de dinero con decimales; no confía en total enviado por el cliente. |
| JWT / bcrypt | Token firmado de sesión / hash irreversible para comparar contraseñas. |
| HTTP 200/201/400/401/403/404/409 | Éxito, creado, entrada inválida, sin sesión, permiso denegado, inexistente, conflicto. |

## Ejemplo explicado de compra

Un cliente agrega dos filtros de Q45: el carrito aún no reserva stock. Checkout verifica dirección propia, bloquea productos, resta dos unidades, calcula Q90 y crea pedido PENDING con precio y dirección históricos. El intento MockPay guarda una correlación. Solo una consulta verificada del proveedor puede crear el pago y cambiar a PAID. Un reintento usa idempotencyKey y devuelve el mismo pedido. Cancelar un pendiente sin pago repone una sola vez.

## Inventario de archivos

| Archivo | Para qué sirve |
| --- | --- |
| [.env](../.env) | Archivo de configuración o apoyo incluido en la entrega. |
| [.env.example](../.env.example) | Plantilla de variables. Los valores reales van en .env local o Environment de Render. |
| [.gitignore](../.gitignore) | Excluye secretos, dependencias, archivos compilados y base de datos local de GitHub. |
| [diagrama.dbml](../diagrama.dbml) | Representación editable del DER para visualizar tablas y relaciones. |
| [docs/DEMO.md](../docs/DEMO.md) | Documento de apoyo: DEMO |
| [docs/DER.md](../docs/DER.md) | Documento de apoyo: DER |
| [docs/ENDPOINTS.md](../docs/ENDPOINTS.md) | Documento de apoyo: ENDPOINTS |
| [docs/ENTREGA-PUBLICA.md](../docs/ENTREGA-PUBLICA.md) | Documento de apoyo: ENTREGA PUBLICA |
| [docs/GUIA-DEFENSA.md](../docs/GUIA-DEFENSA.md) | Documento de apoyo: GUIA DEFENSA |
| [docs/INICIO-LOCAL.md](../docs/INICIO-LOCAL.md) | Documento de apoyo: INICIO LOCAL |
| [docs/MOCKPAY.md](../docs/MOCKPAY.md) | Documento de apoyo: MOCKPAY |
| [docs/PRUEBAS.md](../docs/PRUEBAS.md) | Documento de apoyo: PRUEBAS |
| [docs/PUBLICACION-PENDIENTE.md](../docs/PUBLICACION-PENDIENTE.md) | Documento de apoyo: PUBLICACION PENDIENTE |
| [iniciar-local.cmd](../iniciar-local.cmd) | Lanzador Windows que ejecuta el preparador PowerShell y mantiene visible la consola. |
| [modelo-datos.md](../modelo-datos.md) | Explicación de las tablas y decisiones del modelo. |
| [package-lock.json](../package-lock.json) | Archivo generado que fija versiones y hashes del árbol de dependencias. No contiene lógica de ventas. |
| [package.json](../package.json) | Identifica el proyecto, versiones compatibles, dependencias y comandos npm. |
| [prisma/migrations/202609290001_initial/migration.sql](../prisma/migrations/202609290001_initial/migration.sql) | Crea once tablas iniciales, claves, relaciones, índices y restricciones CHECK en PostgreSQL. |
| [prisma/migrations/202610010001_mockpay/migration.sql](../prisma/migrations/202610010001_mockpay/migration.sql) | Agrega gateway_attempts y el índice que evita varios intentos activos para un pedido. |
| [prisma/migrations/migration_lock.toml](../prisma/migrations/migration_lock.toml) | Declara PostgreSQL como proveedor del historial de migraciones. |
| [prisma/schema.prisma](../prisma/schema.prisma) | Fuente del modelo de datos: enums, doce modelos, relaciones, tipos decimales e índices. |
| [prisma/seed.ts](../prisma/seed.ts) | Carga usuarios y repuestos ficticios; recorre los servicios reales para generar pedidos y caja de demostración. |
| [prisma.config.ts](../prisma.config.ts) | Indica al CLI de Prisma dónde están el schema, las migraciones y la conexión privada. |
| [README.md](../README.md) | Entrada principal: instalación, funciones, estado y enlaces del proyecto. |
| [requerimientos.md](../requerimientos.md) | Alcance, reglas de negocio y criterios del proyecto. |
| [scripts/conectar-github.ps1](../scripts/conectar-github.ps1) | Vincula el historial local al remoto desde la consola del usuario, conservando los archivos de trabajo. |
| [scripts/configure-local.cjs](../scripts/configure-local.cjs) | Prepara configuración privada local y credenciales aleatorias sin imprimir secretos. |
| [scripts/detener-base.ps1](../scripts/detener-base.ps1) | Solicita detener PostgreSQL local de forma ordenada. |
| [scripts/iniciar-local.ps1](../scripts/iniciar-local.ps1) | Coordina configuración, PostgreSQL, instalación, Prisma, migraciones, build, seed y arranque. |
| [scripts/local-db.ps1](../scripts/local-db.ps1) | Inicializa, inicia o detiene únicamente el clúster PostgreSQL propio del proyecto. |
| [scripts/migrate-local.ps1](../scripts/migrate-local.ps1) | Aplica las migraciones usando el motor oficial Prisma cuando un entorno restringido no permite lanzarlo desde Node. |
| [scripts/probar-local.ps1](../scripts/probar-local.ps1) | Prepara la base exclusiva de pruebas y ejecuta e2e sin limpiar la base de demostración. |
| [src/addresses/addresses.controller.ts](../src/addresses/addresses.controller.ts) | Recibe solicitudes HTTP, valida parámetros con DTO/Pipes y delega reglas en servicios. |
| [src/addresses/addresses.dto.ts](../src/addresses/addresses.dto.ts) | Declara contratos de entrada, validadores y ejemplos Swagger. Un tipo TypeScript solo no valida un JSON recibido. |
| [src/addresses/addresses.module.ts](../src/addresses/addresses.module.ts) | Registra controladores y servicios para que NestJS pueda construir sus dependencias. |
| [src/addresses/addresses.service.ts](../src/addresses/addresses.service.ts) | Guarda y modifica direcciones del usuario autenticado, comprobando propiedad. |
| [src/app.module.ts](../src/app.module.ts) | Reúne los módulos, valida variables con Joi y registra Guards globales. Incluye la ruta de salud que consulta PostgreSQL. |
| [src/auth/auth.controller.ts](../src/auth/auth.controller.ts) | Recibe solicitudes HTTP, valida parámetros con DTO/Pipes y delega reglas en servicios. |
| [src/auth/auth.dto.ts](../src/auth/auth.dto.ts) | Declara contratos de entrada, validadores y ejemplos Swagger. Un tipo TypeScript solo no valida un JSON recibido. |
| [src/auth/auth.module.ts](../src/auth/auth.module.ts) | Registra controladores y servicios para que NestJS pueda construir sus dependencias. |
| [src/auth/auth.service.ts](../src/auth/auth.service.ts) | Registra cuentas con bcrypt, valida el login, emite JWT y administra activación de usuarios. |
| [src/auth/jwt.strategy.ts](../src/auth/jwt.strategy.ts) | Passport obtiene el Bearer token, verifica firma/expiración y consulta el estado actual del usuario. |
| [src/cash/cash.controller.ts](../src/cash/cash.controller.ts) | Recibe solicitudes HTTP, valida parámetros con DTO/Pipes y delega reglas en servicios. |
| [src/cash/cash.dto.ts](../src/cash/cash.dto.ts) | Declara contratos de entrada, validadores y ejemplos Swagger. Un tipo TypeScript solo no valida un JSON recibido. |
| [src/cash/cash.module.ts](../src/cash/cash.module.ts) | Registra controladores y servicios para que NestJS pueda construir sus dependencias. |
| [src/cash/cash.service.ts](../src/cash/cash.service.ts) | Abre caja, agrupa pagos POS, calcula efectivo esperado y coordina el cierre con ventas concurrentes. |
| [src/catalog/catalog.controller.ts](../src/catalog/catalog.controller.ts) | Recibe solicitudes HTTP, valida parámetros con DTO/Pipes y delega reglas en servicios. |
| [src/catalog/catalog.dto.ts](../src/catalog/catalog.dto.ts) | Declara contratos de entrada, validadores y ejemplos Swagger. Un tipo TypeScript solo no valida un JSON recibido. |
| [src/catalog/catalog.module.ts](../src/catalog/catalog.module.ts) | Registra controladores y servicios para que NestJS pueda construir sus dependencias. |
| [src/catalog/catalog.service.ts](../src/catalog/catalog.service.ts) | Busca repuestos, oculta costos públicos, comprueba categorías y ajusta stock con su movimiento contable. |
| [src/catalog/categories.service.ts](../src/catalog/categories.service.ts) | Gestiona categorías y su desactivación sin eliminar el historial de productos. |
| [src/common/dto.ts](../src/common/dto.ts) | Valida page y limit para compartir paginación entre catálogo y pedidos. |
| [src/common/http.ts](../src/common/http.ts) | Convierte excepciones a respuestas JSON seguras y registra la duración de las solicitudes. |
| [src/common/openapi.ts](../src/common/openapi.ts) | Describe respuestas OpenAPI: tipos, listas, importes y errores. Documentar una respuesta no ejecuta la operación. |
| [src/common/security.ts](../src/common/security.ts) | Define la identidad Actor, los decoradores propios y los Guards de autenticación y autorización. |
| [src/main.ts](../src/main.ts) | Punto de entrada: crea la aplicación NestJS, aplica la configuración común y escucha el puerto del servidor. |
| [src/mockpay/mockpay.client.ts](../src/mockpay/mockpay.client.ts) | Envía solicitudes a la pasarela del curso con la clave privada; normaliza barras y limita el tiempo de espera. |
| [src/mockpay/mockpay.controller.ts](../src/mockpay/mockpay.controller.ts) | Publica las rutas de intención, consulta, sincronización, simulación local, webhook y redirecciones. |
| [src/mockpay/mockpay.module.ts](../src/mockpay/mockpay.module.ts) | Registra controladores y servicios para que NestJS pueda construir sus dependencias. |
| [src/mockpay/mockpay.service.ts](../src/mockpay/mockpay.service.ts) | Correlaciona intentos y pedidos, confirma importe/moneda/metadata y registra un pago verificado una sola vez. |
| [src/prisma/prisma.service.ts](../src/prisma/prisma.service.ts) | Conecta Prisma con PostgreSQL mediante adapter-pg y comparte el cliente entre módulos. |
| [src/sales/sales.controller.ts](../src/sales/sales.controller.ts) | Recibe solicitudes HTTP, valida parámetros con DTO/Pipes y delega reglas en servicios. |
| [src/sales/sales.dto.ts](../src/sales/sales.dto.ts) | Declara contratos de entrada, validadores y ejemplos Swagger. Un tipo TypeScript solo no valida un JSON recibido. |
| [src/sales/sales.module.ts](../src/sales/sales.module.ts) | Registra controladores y servicios para que NestJS pueda construir sus dependencias. |
| [src/sales/sales.service.ts](../src/sales/sales.service.ts) | Centraliza carritos, checkout, pedidos, pagos administrativos, estados y cancelación en transacciones. |
| [src/setup.ts](../src/setup.ts) | Configura prefijo /api, Helmet, CORS, validación global, filtro de errores, registro HTTP y Swagger. |
| [test/e2e.cjs](../test/e2e.cjs) | Pruebas integradas con NestJS, HTTP y PostgreSQL real en una base separada terminada en _test. |
| [tsconfig.json](../tsconfig.json) | Configura TypeScript estricto, decoradores, CommonJS, ES2022 y compilación de src hacia dist. |

## .env

Archivo de configuración o apoyo incluido en la entrega.

Lee este documento como apoyo. No ejecuta solicitudes ni cambia la base de datos. 

## .env.example

Plantilla de variables. Los valores reales van en .env local o Environment de Render.

### Código completo para leer junto a la explicación

```text
# Completar localmente; no publicar contraseñas reales.
DATABASE_URL=postgresql://postgres:CAMBIAR@localhost:5432/pos_ecommerce
JWT_SECRET=REEMPLAZAR_POR_UN_SECRETO_ALEATORIO_DE_32_CARACTERES_O_MAS
PORT=3000
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000
STORE_CURRENCY=GTQ
# Solo para sembrar cuentas de demostración; configurar antes de db:seed.
SEED_PASSWORD=

# Pasarela del curso: mantener la llave real fuera del repositorio.
MOCKPAY_API_URL=https://mockpay-backend.onrender.com
MOCKPAY_SECRET_KEY=
```

## .gitignore

Excluye secretos, dependencias, archivos compilados y base de datos local de GitHub.

### Código completo para leer junto a la explicación

```text
# Secretos y resultados generados
node_modules/
dist/
.env
.env.*
!.env.example
src/generated/
coverage/
*.log

# Clúster y accesos privados de demostración
.local/
*.pid
```

## diagrama.dbml

Representación editable del DER para visualizar tablas y relaciones.

### Código completo para leer junto a la explicación

```text
// PROPÓSITO: propuesta relacional editable para el proyecto POS & E-commerce.
// Los comentarios explican cada entidad. Las reglas adicionales están en modelo-datos.md.
Project pos_ecommerce {
  database_type: 'PostgreSQL'
}

Enum user_role {
  ADMIN
  CASHIER
  CUSTOMER
}
Enum sales_channel {
  POS
  WEB
  SOCIAL
}
Enum order_status {
  PENDING
  PAID
  IN_TRANSIT
  DELIVERED
  CANCELLED
  COMPLETED
}
Enum cart_status {
  OPEN
  CONVERTED
  ABANDONED
}
Enum payment_method {
  CASH
  CARD
  TRANSFER
}
Enum movement_type {
  INITIAL
  RESTOCK
  SALE
  CANCELLATION
  ADJUSTMENT
}

// IDENTIDAD: el registro público solo crea CUSTOMER; password_hash nunca se expone.
Table users {
  id integer [pk, increment]
  name varchar(150) [not null]
  email varchar(254) [not null, unique]
  phone varchar(30)
  password_hash varchar(255) [not null]
  role user_role [not null, default: 'CUSTOMER']
  active boolean [not null, default: true]
  created_at timestamptz [not null, default: `now()`]
}

// CATÁLOGO: una categoría agrupa varios productos.
Table categories {
  id integer [pk, increment]
  name varchar(100) [not null, unique]
  active boolean [not null, default: true]
}

// INVENTARIO COMÚN: mostrador y web consultan las mismas existencias.
Table products {
  id integer [pk, increment]
  category_id integer [not null, ref: > categories.id]
  sku varchar(60) [not null, unique]
  name varchar(150) [not null]
  description text
  acquisition_cost decimal(12,2) [not null]
  sale_price decimal(12,2) [not null]
  stock integer [not null, default: 0]
  active boolean [not null, default: true]
  created_at timestamptz [not null, default: `now()`]
}

// DIRECCIONES: pertenecen al cliente; el pedido conserva una copia independiente.
Table addresses {
  id integer [pk, increment]
  user_id integer [not null, ref: > users.id]
  recipient_name varchar(150) [not null]
  phone varchar(30) [not null]
  address_line text [not null]
  reference text
}

// CARRITO: prepara la compra. Agregar líneas no descuenta stock.
Table carts {
  id integer [pk, increment]
  created_by_id integer [not null, ref: > users.id]
  customer_id integer [ref: > users.id]
  channel sales_channel [not null]
  status cart_status [not null, default: 'OPEN']
  created_at timestamptz [not null, default: `now()`]
}

// DETALLE DE CARRITO: un producto aparece una sola vez por carrito.
Table cart_items {
  id integer [pk, increment]
  cart_id integer [not null, ref: > carts.id]
  product_id integer [not null, ref: > products.id]
  quantity integer [not null]
  indexes {
    (cart_id, product_id) [unique]
  }
}

// CAJA: solo pagos CASH de ventas POS aumentan el efectivo esperado.
Table cash_sessions {
  id integer [pk, increment]
  opened_by_id integer [not null, ref: > users.id]
  closed_by_id integer [ref: > users.id]
  opening_amount decimal(12,2) [not null]
  counted_amount decimal(12,2)
  expected_amount decimal(12,2)
  opened_at timestamptz [not null, default: `now()`]
  closed_at timestamptz
}

// PEDIDO: canal común, comprobante único y destino histórico sin tarifa de envío.
Table orders {
  id integer [pk, increment]
  receipt_number varchar(60) [not null, unique]
  idempotency_key varchar(100) [not null, unique]
  cart_id integer [unique, ref: > carts.id]
  customer_id integer [ref: > users.id]
  created_by_id integer [not null, ref: > users.id]
  cash_session_id integer [ref: > cash_sessions.id]
  channel sales_channel [not null]
  status order_status [not null]
  total decimal(12,2) [not null]
  recipient_name varchar(150)
  recipient_phone varchar(30)
  delivery_address text
  delivery_reference text
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
}

// HISTORIAL: conserva nombre, precio y costo que existían al confirmar la compra.
Table order_items {
  id integer [pk, increment]
  order_id integer [not null, ref: > orders.id]
  product_id integer [not null, ref: > products.id]
  product_name varchar(150) [not null]
  quantity integer [not null]
  unit_price decimal(12,2) [not null]
  unit_cost decimal(12,2) [not null]
  indexes {
    (order_id, product_id) [unique]
  }
}

// PAGO: primera versión con un pago completo por pedido, sin procesador bancario.
Table payments {
  id integer [pk, increment]
  order_id integer [not null, unique, ref: > orders.id]
  recorded_by_id integer [not null, ref: > users.id]
  method payment_method [not null]
  amount decimal(12,2) [not null]
  reference varchar(150)
  paid_at timestamptz [not null, default: `now()`]
}

// TRAZABILIDAD: delta positivo agrega stock; negativo lo descuenta.
// Cada movimiento y el cambio de products.stock se guardan en la misma transacción.
Table inventory_movements {
  id integer [pk, increment]
  product_id integer [not null, ref: > products.id]
  order_id integer [ref: > orders.id]
  actor_id integer [not null, ref: > users.id]
  type movement_type [not null]
  quantity_delta integer [not null]
  reason text
  created_at timestamptz [not null, default: `now()`]
}

// PASARELA: la tarjeta se introduce en el sandbox y no se almacena aquí.
Table gateway_attempts {
 id uuid [pk]
 order_id integer [not null]
 gateway_id text [unique]
 checkout_url text
 status varchar(20) [not null, default: 'CREATING']
 created_at timestamptz [not null]
 updated_at timestamptz [not null]
}
Ref: gateway_attempts.order_id > orders.id
```

## docs/DEMO.md

Documento de apoyo: DEMO

Lee este documento como apoyo. No ejecuta solicitudes ni cambia la base de datos. 

## docs/DER.md

Documento de apoyo: DER

Lee este documento como apoyo. No ejecuta solicitudes ni cambia la base de datos. 

## docs/ENDPOINTS.md

Documento de apoyo: ENDPOINTS

Lee este documento como apoyo. No ejecuta solicitudes ni cambia la base de datos. 

## docs/ENTREGA-PUBLICA.md

Documento de apoyo: ENTREGA PUBLICA

Lee este documento como apoyo. No ejecuta solicitudes ni cambia la base de datos. 

## docs/GUIA-DEFENSA.md

Documento de apoyo: GUIA DEFENSA

Lee este documento como apoyo. No ejecuta solicitudes ni cambia la base de datos. 

## docs/INICIO-LOCAL.md

Documento de apoyo: INICIO LOCAL

Lee este documento como apoyo. No ejecuta solicitudes ni cambia la base de datos. 

## docs/MOCKPAY.md

Documento de apoyo: MOCKPAY

Lee este documento como apoyo. No ejecuta solicitudes ni cambia la base de datos. 

## docs/PRUEBAS.md

Documento de apoyo: PRUEBAS

Lee este documento como apoyo. No ejecuta solicitudes ni cambia la base de datos. 

## docs/PUBLICACION-PENDIENTE.md

Documento de apoyo: PUBLICACION PENDIENTE

Lee este documento como apoyo. No ejecuta solicitudes ni cambia la base de datos. 

## iniciar-local.cmd

Lanzador Windows que ejecuta el preparador PowerShell y mantiene visible la consola.

### Código completo para leer junto a la explicación

```text
REM Lanzador Windows que ejecuta el preparador PowerShell y mantiene visible la consola.

@echo off
REM prepara el proyecto y mantiene visible la consola del servidor.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\iniciar-local.ps1" -Preparar
pause
```

## modelo-datos.md

Explicación de las tablas y decisiones del modelo.

Lee este documento como apoyo. No ejecuta solicitudes ni cambia la base de datos. 

## package-lock.json

Archivo generado que fija versiones y hashes del árbol de dependencias. No contiene lógica de ventas.

Lee este documento como apoyo. No ejecuta solicitudes ni cambia la base de datos. Es generado por npm; sus entradas describen versiones, descargas y hashes y se estudia junto a package.json.

## package.json

Identifica el proyecto, versiones compatibles, dependencias y comandos npm.

### Código completo para leer junto a la explicación

```json
{
  "name": "pos-ecommerce",
  "version": "1.0.0",
  "private": true,
  "description": "Proyecto final backend POS y comercio electrónico",
  "engines": {
    "node": ">=22.12.0"
  },
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "start": "node dist/main.js",
    "start:dev": "ts-node src/main.ts",
    "prisma:generate": "prisma generate",
    "prisma:validate": "prisma validate",
    "db:deploy": "prisma migrate deploy",
    "db:seed": "ts-node prisma/seed.ts",
    "test:e2e": "node --test test/e2e.cjs",
    "local:start": "powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/iniciar-local.ps1",
    "local:setup": "powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/iniciar-local.ps1 -Preparar"
  },
  "dependencies": {
    "@nestjs/common": "^11.0.0",
    "@nestjs/core": "^11.0.0",
    "@nestjs/platform-express": "^11.0.0",
    "@nestjs/config": "^4.0.0",
    "@nestjs/swagger": "^11.0.0",
    "@nestjs/passport": "^11.0.0",
    "@nestjs/jwt": "^11.0.0",
    "@nestjs/throttler": "^6.0.0",
    "@prisma/client": "^7.0.0",
    "@prisma/adapter-pg": "^7.0.0",
    "bcryptjs": "^3.0.0",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.0",
    "dotenv": "^17.0.0",
    "helmet": "^8.0.0",
    "joi": "^18.0.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "pg": "^8.0.0",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.0"
  },
  "devDependencies": {
    "prisma": "^7.0.0",
    "typescript": "^5.9.0",
    "ts-node": "^10.9.2",
    "@types/node": "^24.0.0",
    "@types/express": "^5.0.0",
    "@types/passport-jwt": "^4.0.0",
    "@types/pg": "^8.0.0"
  }
}
```

## prisma/migrations/202609290001_initial/migration.sql

Crea once tablas iniciales, claves, relaciones, índices y restricciones CHECK en PostgreSQL.

### Código completo para leer junto a la explicación

```sql
-- ESTRUCTURA: tablas, enums y relaciones de POS & E-commerce.

-- No modifica datos existentes: migración inicial para una base nueva.

CREATE TYPE "user_role" AS ENUM ('ADMIN', 'CASHIER', 'CUSTOMER');

CREATE TYPE "sales_channel" AS ENUM ('POS', 'WEB', 'SOCIAL');

CREATE TYPE "order_status" AS ENUM ('PENDING', 'PAID', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'COMPLETED');

CREATE TYPE "cart_status" AS ENUM ('OPEN', 'CONVERTED', 'ABANDONED');

CREATE TYPE "payment_method" AS ENUM ('CASH', 'CARD', 'TRANSFER');

CREATE TYPE "movement_type" AS ENUM ('INITIAL', 'RESTOCK', 'SALE', 'CANCELLATION', 'ADJUSTMENT');

CREATE TABLE "users" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "name" VARCHAR(150) NOT NULL,
  "email" VARCHAR(254) NOT NULL UNIQUE,
  "phone" VARCHAR(30),
  "password_hash" VARCHAR(255) NOT NULL,
  "role" "user_role" NOT NULL DEFAULT 'CUSTOMER',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT now()
);

CREATE TABLE "categories" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "name" VARCHAR(100) NOT NULL UNIQUE,
  "active" BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE "products" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "category_id" INTEGER NOT NULL,
  "sku" VARCHAR(60) NOT NULL UNIQUE,
  "name" VARCHAR(150) NOT NULL,
  "description" TEXT,
  "acquisition_cost" DECIMAL(12,2) NOT NULL,
  "sale_price" DECIMAL(12,2) NOT NULL,
  "stock" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT now()
);

CREATE TABLE "addresses" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "recipient_name" VARCHAR(150) NOT NULL,
  "phone" VARCHAR(30) NOT NULL,
  "address_line" TEXT NOT NULL,
  "reference" TEXT
);

CREATE TABLE "carts" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "created_by_id" INTEGER NOT NULL,
  "customer_id" INTEGER,
  "channel" "sales_channel" NOT NULL,
  "status" "cart_status" NOT NULL DEFAULT 'OPEN',
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT now()
);

CREATE TABLE "cart_items" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "cart_id" INTEGER NOT NULL,
  "product_id" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL,
  CONSTRAINT "cart_items_cart_id_product_id_key" UNIQUE ("cart_id", "product_id")
);

CREATE TABLE "cash_sessions" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "opened_by_id" INTEGER NOT NULL,
  "closed_by_id" INTEGER,
  "opening_amount" DECIMAL(12,2) NOT NULL,
  "counted_amount" DECIMAL(12,2),
  "expected_amount" DECIMAL(12,2),
  "opened_at" TIMESTAMPTZ(3) NOT NULL DEFAULT now(),
  "closed_at" TIMESTAMPTZ(3)
);

CREATE TABLE "orders" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "receipt_number" VARCHAR(60) NOT NULL UNIQUE,
  "idempotency_key" VARCHAR(100) NOT NULL UNIQUE,
  "cart_id" INTEGER UNIQUE,
  "customer_id" INTEGER,
  "created_by_id" INTEGER NOT NULL,
  "cash_session_id" INTEGER,
  "channel" "sales_channel" NOT NULL,
  "status" "order_status" NOT NULL,
  "total" DECIMAL(12,2) NOT NULL,
  "recipient_name" VARCHAR(150),
  "recipient_phone" VARCHAR(30),
  "delivery_address" TEXT,
  "delivery_reference" TEXT,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT now()
);

CREATE TABLE "order_items" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "order_id" INTEGER NOT NULL,
  "product_id" INTEGER NOT NULL,
  "product_name" VARCHAR(150) NOT NULL,
  "quantity" INTEGER NOT NULL,
  "unit_price" DECIMAL(12,2) NOT NULL,
  "unit_cost" DECIMAL(12,2) NOT NULL,
  CONSTRAINT "order_items_order_id_product_id_key" UNIQUE ("order_id", "product_id")
);

CREATE TABLE "payments" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "order_id" INTEGER NOT NULL UNIQUE,
  "recorded_by_id" INTEGER NOT NULL,
  "method" "payment_method" NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "reference" VARCHAR(150),
  "paid_at" TIMESTAMPTZ(3) NOT NULL DEFAULT now()
);

CREATE TABLE "inventory_movements" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "product_id" INTEGER NOT NULL,
  "order_id" INTEGER,
  "actor_id" INTEGER NOT NULL,
  "type" "movement_type" NOT NULL,
  "quantity_delta" INTEGER NOT NULL,
  "reason" TEXT,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT now()
);

ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "carts" ADD CONSTRAINT "carts_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "carts" ADD CONSTRAINT "carts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "cash_sessions" ADD CONSTRAINT "cash_sessions_opened_by_id_fkey" FOREIGN KEY ("opened_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "cash_sessions" ADD CONSTRAINT "cash_sessions_closed_by_id_fkey" FOREIGN KEY ("closed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "orders" ADD CONSTRAINT "orders_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "orders" ADD CONSTRAINT "orders_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "orders" ADD CONSTRAINT "orders_cash_session_id_fkey" FOREIGN KEY ("cash_session_id") REFERENCES "cash_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payments" ADD CONSTRAINT "payments_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- INTEGRIDAD: restricciones que complementan el schema Prisma.
ALTER TABLE products ADD CONSTRAINT products_amounts_check CHECK (stock >= 0 AND acquisition_cost >= 0 AND sale_price > 0);
ALTER TABLE cart_items ADD CONSTRAINT cart_items_quantity_check CHECK (quantity > 0);
ALTER TABLE order_items ADD CONSTRAINT order_items_amounts_check CHECK (quantity > 0 AND unit_price > 0 AND unit_cost >= 0);
ALTER TABLE payments ADD CONSTRAINT payments_amount_check CHECK (amount > 0);
ALTER TABLE inventory_movements ADD CONSTRAINT inventory_nonzero_check CHECK (quantity_delta <> 0);
ALTER TABLE cash_sessions ADD CONSTRAINT cash_amounts_check CHECK (opening_amount >= 0 AND (counted_amount IS NULL OR counted_amount >= 0) AND (expected_amount IS NULL OR expected_amount >= 0));
ALTER TABLE cash_sessions ADD CONSTRAINT cash_closure_check CHECK ((closed_at IS NULL AND closed_by_id IS NULL AND counted_amount IS NULL AND expected_amount IS NULL) OR (closed_at IS NOT NULL AND closed_by_id IS NOT NULL AND counted_amount IS NOT NULL AND expected_amount IS NOT NULL AND closed_at >= opened_at));
-- Una sola caja física: como máximo una fila cumple closed_at IS NULL.
CREATE UNIQUE INDEX cash_one_open ON cash_sessions ((1)) WHERE closed_at IS NULL;
ALTER TABLE orders ADD CONSTRAINT orders_total_check CHECK (total > 0);
ALTER TABLE orders ADD CONSTRAINT orders_channel_check CHECK ((channel = 'POS' AND cash_session_id IS NOT NULL AND status = 'COMPLETED') OR (channel IN ('WEB','SOCIAL') AND cash_session_id IS NULL AND status <> 'COMPLETED' AND recipient_name IS NOT NULL AND recipient_phone IS NOT NULL AND delivery_address IS NOT NULL));
ALTER TABLE orders ADD CONSTRAINT orders_web_customer_check CHECK (channel <> 'WEB' OR customer_id IS NOT NULL);
-- ÍNDICES: aceleran las búsquedas habituales y las referencias de las relaciones.
CREATE INDEX products_category_id_idx ON products(category_id);
CREATE INDEX orders_customer_id_created_at_idx ON orders(customer_id, created_at);
CREATE INDEX orders_channel_status_created_at_idx ON orders(channel, status, created_at);
CREATE INDEX orders_cash_session_id_idx ON orders(cash_session_id);
CREATE INDEX addresses_user_id_idx ON addresses(user_id);
CREATE INDEX inventory_movements_product_id_created_at_idx ON inventory_movements(product_id, created_at);
```

## prisma/migrations/202610010001_mockpay/migration.sql

Agrega gateway_attempts y el índice que evita varios intentos activos para un pedido.

### Código completo para leer junto a la explicación

```sql
-- PASARELA: correlación persistente e índice parcial para un único intento activo por pedido.
CREATE TABLE gateway_attempts (
  id UUID PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  gateway_id TEXT UNIQUE,
  checkout_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'CREATING',
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ(3) NOT NULL DEFAULT now(),
  CONSTRAINT gateway_attempts_status_check CHECK (status IN ('CREATING','PENDING','UNKNOWN','FAILED','SUCCEEDED'))
);
CREATE INDEX gateway_attempts_order_id_idx ON gateway_attempts(order_id);
CREATE UNIQUE INDEX gateway_one_active_order ON gateway_attempts(order_id) WHERE status IN ('CREATING','PENDING','UNKNOWN');
```

## prisma/migrations/migration_lock.toml

Declara PostgreSQL como proveedor del historial de migraciones.

### Código completo para leer junto a la explicación

```text
# Motor de base de datos de las migraciones.
provider = "postgresql"
```

## prisma/schema.prisma

Fuente del modelo de datos: enums, doce modelos, relaciones, tipos decimales e índices.

### Código completo para leer junto a la explicación

```text
// Prisma 7 genera tipos y consultas a partir de este modelo.
// DATABASE_URL se configura en prisma.config.ts, nunca se escribe aquí.
generator client {
 provider = "prisma-client"
 output = "../src/generated/prisma"
 moduleFormat = "cjs"
}
datasource db {
 provider = "postgresql"
}

// evita estados o roles escritos de forma inconsistente.
enum UserRole {
  ADMIN
  CASHIER
  CUSTOMER

 @@map("user_role")
}

// evita estados o roles escritos de forma inconsistente.
enum SalesChannel {
  POS
  WEB
  SOCIAL

 @@map("sales_channel")
}

// evita estados o roles escritos de forma inconsistente.
enum OrderStatus {
  PENDING
  PAID
  IN_TRANSIT
  DELIVERED
  CANCELLED
  COMPLETED

 @@map("order_status")
}

// evita estados o roles escritos de forma inconsistente.
enum CartStatus {
  OPEN
  CONVERTED
  ABANDONED

 @@map("cart_status")
}

// evita estados o roles escritos de forma inconsistente.
enum PaymentMethod {
  CASH
  CARD
  TRANSFER

 @@map("payment_method")
}

// evita estados o roles escritos de forma inconsistente.
enum MovementType {
  INITIAL
  RESTOCK
  SALE
  CANCELLATION
  ADJUSTMENT

 @@map("movement_type")
}

// cuentas y roles; no exponer passwordHash.
model User {
  // Identificador primario del registro.
  id Int @id @default(autoincrement())
  // Nombre legible.
  name String @db.VarChar(150)
  // Correo único usado para iniciar sesión. No puede repetirse.
  email String @unique @db.VarChar(254)
  // Teléfono de contacto. Puede estar ausente (null).
  phone String? @db.VarChar(30)
  // Hash bcrypt; nunca contraseña en texto plano.
  passwordHash String @db.VarChar(255) @map("password_hash")
  // Rol de permisos: ADMIN, CASHIER o CUSTOMER.
  role UserRole @default(CUSTOMER)
  // Permite desactivar sin borrar historial.
  active Boolean @default(true)
  // Momento de creación.
  createdAt DateTime @default(now()) @db.Timestamptz(3) @map("created_at")
  // Colección de registros relacionados; no es una columna que guarde toda la lista.
  addressesByUser Address[] @relation("Address_user")
  // Colección de registros relacionados; no es una columna que guarde toda la lista.
  cartsByCreatedBy Cart[] @relation("Cart_createdBy")
  // Colección de registros relacionados; no es una columna que guarde toda la lista.
  cartsByCustomer Cart[] @relation("Cart_customer")
  // Colección de registros relacionados; no es una columna que guarde toda la lista.
  cashSessionsByOpenedBy CashSession[] @relation("CashSession_openedBy")
  // Colección de registros relacionados; no es una columna que guarde toda la lista.
  cashSessionsByClosedBy CashSession[] @relation("CashSession_closedBy")
  // Colección de registros relacionados; no es una columna que guarde toda la lista.
  ordersByCustomer Order[] @relation("Order_customer")
  // Colección de registros relacionados; no es una columna que guarde toda la lista.
  ordersByCreatedBy Order[] @relation("Order_createdBy")
  // Colección de registros relacionados; no es una columna que guarde toda la lista.
  paymentsByRecordedBy Payment[] @relation("Payment_recordedBy")
  // Colección de registros relacionados; no es una columna que guarde toda la lista.
  inventoryMovementsByActor InventoryMovement[] @relation("InventoryMovement_actor")
  @@map("users")
}

// relaciones y datos del negocio.
model Category {
  // Identificador primario del registro.
  id Int @id @default(autoincrement())
  // Nombre legible. No puede repetirse.
  name String @unique @db.VarChar(100)
  // Permite desactivar sin borrar historial.
  active Boolean @default(true)
  // Colección de registros relacionados; no es una columna que guarde toda la lista.
  productsByCategory Product[] @relation("Product_category")
  @@map("categories")
}

// inventario único y precios decimales.
model Product {
  // Identificador primario del registro.
  id Int @id @default(autoincrement())
  // Clave que vincula este registro con category.
  categoryId Int @map("category_id")
  // Relación que Prisma permite consultar mediante include/select.
  category Category @relation("Product_category", fields: [categoryId], references: [id], onDelete: Restrict)
  // Código único del repuesto. No puede repetirse.
  sku String @unique @db.VarChar(60)
  // Nombre legible.
  name String @db.VarChar(150)
  // Descripción opcional. Puede estar ausente (null).
  description String? 
  // Costo interno de compra; se oculta al público.
  acquisitionCost Decimal @db.Decimal(12,2) @map("acquisition_cost")
  // Precio usado por el servidor al calcular ventas.
  salePrice Decimal @db.Decimal(12,2) @map("sale_price")
  // Unidades disponibles en el inventario compartido.
  stock Int @default(0)
  // Permite desactivar sin borrar historial.
  active Boolean @default(true)
  // Momento de creación.
  createdAt DateTime @default(now()) @db.Timestamptz(3) @map("created_at")
  // Colección de registros relacionados; no es una columna que guarde toda la lista.
  cartItemsByProduct CartItem[] @relation("CartItem_product")
  // Colección de registros relacionados; no es una columna que guarde toda la lista.
  orderItemsByProduct OrderItem[] @relation("OrderItem_product")
  // Colección de registros relacionados; no es una columna que guarde toda la lista.
  inventoryMovementsByProduct InventoryMovement[] @relation("InventoryMovement_product")
  @@index([categoryId])
  @@map("products")
}

// relaciones y datos del negocio.
model Address {
  // Identificador primario del registro.
  id Int @id @default(autoincrement())
  // Clave que vincula este registro con user.
  userId Int @map("user_id")
  // Relación que Prisma permite consultar mediante include/select.
  user User @relation("Address_user", fields: [userId], references: [id], onDelete: Restrict)
  // Nombre de quien recibe la entrega.
  recipientName String @db.VarChar(150) @map("recipient_name")
  // Teléfono de contacto.
  phone String @db.VarChar(30)
  // Dirección personal guardada.
  addressLine String @map("address_line")
  // Referencia opcional de dirección o pago, según el modelo. Puede estar ausente (null).
  reference String? 
  @@index([userId])
  @@map("addresses")
}

// relaciones y datos del negocio.
model Cart {
  // Identificador primario del registro.
  id Int @id @default(autoincrement())
  // Clave que vincula este registro con createdBy.
  createdById Int @map("created_by_id")
  // Relación que Prisma permite consultar mediante include/select.
  createdBy User @relation("Cart_createdBy", fields: [createdById], references: [id], onDelete: Restrict)
  // Clave que vincula este registro con customer. Puede estar ausente (null).
  customerId Int? @map("customer_id")
  // Relación que Prisma permite consultar mediante include/select. Puede estar ausente (null).
  customer User? @relation("Cart_customer", fields: [customerId], references: [id], onDelete: Restrict)
  // Canal POS, WEB o SOCIAL.
  channel SalesChannel 
  // Estado permitido del registro; las reglas de transición están en el servicio.
  status CartStatus @default(OPEN)
  // Momento de creación.
  createdAt DateTime @default(now()) @db.Timestamptz(3) @map("created_at")
  // Colección de registros relacionados; no es una columna que guarde toda la lista.
  items CartItem[] @relation("CartItem_cart")
  // Relación que Prisma permite consultar mediante include/select. Puede estar ausente (null).
  order Order? @relation("Order_cart")
  @@map("carts")
}

// relaciones y datos del negocio.
model CartItem {
  // Identificador primario del registro.
  id Int @id @default(autoincrement())
  // Clave que vincula este registro con cart.
  cartId Int @map("cart_id")
  // Relación que Prisma permite consultar mediante include/select.
  cart Cart @relation("CartItem_cart", fields: [cartId], references: [id], onDelete: Restrict)
  // Clave que vincula este registro con product.
  productId Int @map("product_id")
  // Relación que Prisma permite consultar mediante include/select.
  product Product @relation("CartItem_product", fields: [productId], references: [id], onDelete: Restrict)
  // Cantidad de unidades de una línea.
  quantity Int 
  @@unique([cartId, productId])
  @@map("cart_items")
}

// relaciones y datos del negocio.
model CashSession {
  // Identificador primario del registro.
  id Int @id @default(autoincrement())
  // Clave que vincula este registro con openedBy.
  openedById Int @map("opened_by_id")
  // Relación que Prisma permite consultar mediante include/select.
  openedBy User @relation("CashSession_openedBy", fields: [openedById], references: [id], onDelete: Restrict)
  // Clave que vincula este registro con closedBy. Puede estar ausente (null).
  closedById Int? @map("closed_by_id")
  // Relación que Prisma permite consultar mediante include/select. Puede estar ausente (null).
  closedBy User? @relation("CashSession_closedBy", fields: [closedById], references: [id], onDelete: Restrict)
  // Fondo inicial de efectivo.
  openingAmount Decimal @db.Decimal(12,2) @map("opening_amount")
  // Efectivo contado al cierre. Puede estar ausente (null).
  countedAmount Decimal? @db.Decimal(12,2) @map("counted_amount")
  // Efectivo esperado fijado al cierre. Puede estar ausente (null).
  expectedAmount Decimal? @db.Decimal(12,2) @map("expected_amount")
  // Momento de apertura.
  openedAt DateTime @default(now()) @db.Timestamptz(3) @map("opened_at")
  // Momento de cierre; null indica caja abierta. Puede estar ausente (null).
  closedAt DateTime? @db.Timestamptz(3) @map("closed_at")
  // Colección de registros relacionados; no es una columna que guarde toda la lista.
  orders Order[] @relation("Order_cashSession")
  @@map("cash_sessions")
}

// venta confirmada con datos históricos de entrega.
model Order {
  // Identificador primario del registro.
  id Int @id @default(autoincrement())
  // Número único del comprobante. No puede repetirse.
  receiptNumber String @unique @db.VarChar(60) @map("receipt_number")
  // Clave única que identifica un checkout y permite reintentos sin duplicarlo. No puede repetirse.
  idempotencyKey String @unique @db.VarChar(100) @map("idempotency_key")
  // Clave que vincula este registro con cart. Puede estar ausente (null). No puede repetirse.
  cartId Int? @unique @map("cart_id")
  // Relación que Prisma permite consultar mediante include/select. Puede estar ausente (null).
  cart Cart? @relation("Order_cart", fields: [cartId], references: [id], onDelete: Restrict)
  // Clave que vincula este registro con customer. Puede estar ausente (null).
  customerId Int? @map("customer_id")
  // Relación que Prisma permite consultar mediante include/select. Puede estar ausente (null).
  customer User? @relation("Order_customer", fields: [customerId], references: [id], onDelete: Restrict)
  // Clave que vincula este registro con createdBy.
  createdById Int @map("created_by_id")
  // Relación que Prisma permite consultar mediante include/select.
  createdBy User @relation("Order_createdBy", fields: [createdById], references: [id], onDelete: Restrict)
  // Clave que vincula este registro con cashSession. Puede estar ausente (null).
  cashSessionId Int? @map("cash_session_id")
  // Relación que Prisma permite consultar mediante include/select. Puede estar ausente (null).
  cashSession CashSession? @relation("Order_cashSession", fields: [cashSessionId], references: [id], onDelete: Restrict)
  // Canal POS, WEB o SOCIAL.
  channel SalesChannel 
  // Estado permitido del registro; las reglas de transición están en el servicio.
  status OrderStatus 
  // Total calculado por el servidor con Decimal.
  total Decimal @db.Decimal(12,2)
  // Nombre de quien recibe la entrega. Puede estar ausente (null).
  recipientName String? @db.VarChar(150) @map("recipient_name")
  // Teléfono histórico del destinatario. Puede estar ausente (null).
  recipientPhone String? @db.VarChar(30) @map("recipient_phone")
  // Copia histórica de la dirección del pedido. Puede estar ausente (null).
  deliveryAddress String? @map("delivery_address")
  // Referencia histórica para entrega. Puede estar ausente (null).
  deliveryReference String? @map("delivery_reference")
  // Momento de creación.
  createdAt DateTime @default(now()) @db.Timestamptz(3) @map("created_at")
  // Momento de última actualización.
  updatedAt DateTime @default(now()) @db.Timestamptz(3) @updatedAt @map("updated_at")
  // Colección de registros relacionados; no es una columna que guarde toda la lista.
  items OrderItem[] @relation("OrderItem_order")
  // Relación que Prisma permite consultar mediante include/select. Puede estar ausente (null).
  payment Payment? @relation("Payment_order")
  // Colección de registros relacionados; no es una columna que guarde toda la lista.
  movements InventoryMovement[] @relation("InventoryMovement_order")
  // Colección de registros relacionados; no es una columna que guarde toda la lista.
  gatewayAttempts GatewayAttempt[]
  @@index([customerId, createdAt])
  @@index([channel, status, createdAt])
  @@index([cashSessionId])
  @@map("orders")
}

// cantidades, precios y costos históricos.
model OrderItem {
  // Identificador primario del registro.
  id Int @id @default(autoincrement())
  // Clave que vincula este registro con order.
  orderId Int @map("order_id")
  // Relación que Prisma permite consultar mediante include/select.
  order Order @relation("OrderItem_order", fields: [orderId], references: [id], onDelete: Restrict)
  // Clave que vincula este registro con product.
  productId Int @map("product_id")
  // Relación que Prisma permite consultar mediante include/select.
  product Product @relation("OrderItem_product", fields: [productId], references: [id], onDelete: Restrict)
  // Nombre histórico del repuesto vendido.
  productName String @db.VarChar(150) @map("product_name")
  // Cantidad de unidades de una línea.
  quantity Int 
  // Precio histórico por unidad.
  unitPrice Decimal @db.Decimal(12,2) @map("unit_price")
  // Costo histórico por unidad; permanece interno.
  unitCost Decimal @db.Decimal(12,2) @map("unit_cost")
  @@unique([orderId, productId])
  @@map("order_items")
}

// relaciones y datos del negocio.
model Payment {
  // Identificador primario del registro.
  id Int @id @default(autoincrement())
  // Clave que vincula este registro con order. No puede repetirse.
  orderId Int @unique @map("order_id")
  // Relación que Prisma permite consultar mediante include/select.
  order Order @relation("Payment_order", fields: [orderId], references: [id], onDelete: Restrict)
  // Clave que vincula este registro con recordedBy.
  recordedById Int @map("recorded_by_id")
  // Relación que Prisma permite consultar mediante include/select.
  recordedBy User @relation("Payment_recordedBy", fields: [recordedById], references: [id], onDelete: Restrict)
  // Método CASH, CARD o TRANSFER.
  method PaymentMethod 
  // Importe completo registrado en el pago.
  amount Decimal @db.Decimal(12,2)
  // Referencia opcional de dirección o pago, según el modelo. Puede estar ausente (null).
  reference String? @db.VarChar(150)
  // Momento de registro del pago.
  paidAt DateTime @default(now()) @db.Timestamptz(3) @map("paid_at")
  @@map("payments")
}

// trazabilidad de cambios en stock.
model InventoryMovement {
  // Identificador primario del registro.
  id Int @id @default(autoincrement())
  // Clave que vincula este registro con product.
  productId Int @map("product_id")
  // Relación que Prisma permite consultar mediante include/select.
  product Product @relation("InventoryMovement_product", fields: [productId], references: [id], onDelete: Restrict)
  // Clave que vincula este registro con order. Puede estar ausente (null).
  orderId Int? @map("order_id")
  // Relación que Prisma permite consultar mediante include/select. Puede estar ausente (null).
  order Order? @relation("InventoryMovement_order", fields: [orderId], references: [id], onDelete: Restrict)
  // Clave que vincula este registro con actor.
  actorId Int @map("actor_id")
  // Relación que Prisma permite consultar mediante include/select.
  actor User @relation("InventoryMovement_actor", fields: [actorId], references: [id], onDelete: Restrict)
  // Tipo de movimiento de inventario.
  type MovementType 
  // Unidades agregadas si positivo o retiradas si negativo.
  quantityDelta Int @map("quantity_delta")
  // Motivo del movimiento. Puede estar ausente (null).
  reason String? 
  // Momento de creación.
  createdAt DateTime @default(now()) @db.Timestamptz(3) @map("created_at")
  @@index([productId, createdAt])
  @@map("inventory_movements")
}

// guarda intentos y su correlación; nunca números de tarjeta ni la llave secreta.
model GatewayAttempt {
  // Identificador primario del registro.
  id String @id @default(uuid()) @db.Uuid
  // Clave que vincula este registro con order.
  orderId Int @map("order_id")
  // Relación que Prisma permite consultar mediante include/select.
  order Order @relation(fields: [orderId], references: [id], onDelete: Restrict)
  // Identificador remoto de MockPay; único cuando existe. Puede estar ausente (null). No puede repetirse.
  gatewayId String? @unique @map("gateway_id")
  // Dirección normalizada del formulario externo. Puede estar ausente (null).
  checkoutUrl String? @map("checkout_url")
  // Estado permitido del registro; las reglas de transición están en el servicio.
  status String @default("CREATING") @db.VarChar(20)
  // Momento de creación.
  createdAt DateTime @default(now()) @db.Timestamptz(3) @map("created_at")
  // Momento de última actualización.
  updatedAt DateTime @updatedAt @db.Timestamptz(3) @map("updated_at")
  @@index([orderId])
  @@map("gateway_attempts")
}
```

## prisma/seed.ts

Carga usuarios y repuestos ficticios; recorre los servicios reales para generar pedidos y caja de demostración.

| Bloque o campo | Explicación | Línea del archivo |
| --- | --- | --- |
| `seed` | Crea ejemplos faltantes con contraseña de entorno y reutiliza servicios para respetar reglas reales. | 15 |

### Código completo para leer junto a la explicación

```typescript
// Carga usuarios y repuestos ficticios; recorre los servicios reales para generar pedidos y caja de demostración.

import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { hash } from 'bcryptjs';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { SalesService } from '../src/sales/sales.service';
import { CashService } from '../src/cash/cash.module';
import { Actor } from '../src/common/security';

// agrega demostraciones sin borrar ventas o modificar claves existentes.
// Crea ejemplos faltantes con contraseña de entorno y reutiliza servicios para respetar reglas reales.
async function seed() {
  const password = process.env.SEED_PASSWORD;
  if (!password || password.length < 12 || Buffer.byteLength(password) > 72) throw new Error('Define SEED_PASSWORD con 12 caracteres como mínimo y máximo 72 bytes');
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error'] });
  try {
    const db = app.get(PrismaService);
    const sales = app.get(SalesService);
    const cash = app.get(CashService);
    const passwordHash = await hash(password, 12);
    const actors: Actor[] = [];
    for (const [name, email, role] of [
      ['Administrador Demo', 'admin@repuestos.demo', 'ADMIN'],
      ['Cajero Demo', 'cajero@repuestos.demo', 'CASHIER'],
      ['Cliente Demo', 'cliente@repuestos.demo', 'CUSTOMER'],
    ] as const) {
      actors.push(await db.user.upsert({ where: { email }, update: {}, create: { name, email, role, passwordHash } }));
    }
    const [admin, cashier, customer] = actors;
    const categories: { id: number }[] = [];
    for (const name of ['Frenos', 'Filtros', 'Sistema eléctrico', 'Lubricación']) categories.push(await db.category.upsert({ where: { name }, update: {}, create: { name } }));
    const samples = [
      ['FRE-001', 'Pastillas de freno delanteras', 0, 125, 195],
      ['FRE-002', 'Disco de freno ventilado', 0, 210, 325],
      ['FIL-001', 'Filtro de aceite', 1, 25, 45],
      ['FIL-002', 'Filtro de aire', 1, 40, 75],
      ['ELE-001', 'Bujía de encendido', 2, 18, 35],
      ['ELE-002', 'Bombilla para faro', 2, 22, 40],
      ['LUB-001', 'Aceite de motor 10W-30, un litro', 3, 38, 65],
      ['LUB-002', 'Líquido de frenos DOT 4', 3, 30, 55],
    ] as const;
    const products = [];
    for (const [sku, name, category, cost, price] of samples) {
      let product = await db.product.findUnique({ where: { sku } });
      if (!product) product = await db.$transaction(async tx => {
        const p = await tx.product.create({ data: { sku, name, description: 'Repuesto de demostración. Confirmar compatibilidad del vehículo antes de comprar.', categoryId: categories[category].id, acquisitionCost: cost, salePrice: price, stock: 40 } });
        await tx.inventoryMovement.create({ data: { productId: p.id, actorId: admin.id, type: 'INITIAL', quantityDelta: 40, reason: 'Inventario inicial de demostración' } });
        return p;
      });
      products.push(product);
    }
    let address = await db.address.findFirst({ where: { userId: customer.id } });
    if (!address) address = await db.address.create({ data: { userId: customer.id, recipientName: 'Cliente Demo', phone: '5555-0101', addressLine: 'Dirección ficticia, zona 1, Guatemala', reference: 'Datos de prueba para presentación' } });
    // Pedidos de ejemplo recorren los mismos servicios que usa la API.
    for (const status of ['PENDING', 'PAID', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'] as const) {
      const key = `seed-web-${status.toLowerCase()}`;
      if (await db.order.findUnique({ where: { idempotencyKey: key } })) continue;
      const cart = await sales.createCart({ channel: 'WEB' }, customer);
      await sales.setItem(cart.id, { productId: products[2].id, quantity: 1 }, customer);
      const order = await sales.checkout(cart.id, { idempotencyKey: key, addressId: address.id }, customer);
      if (status === 'CANCELLED') await sales.cancel(order.id, customer);
      else if (status !== 'PENDING') {
        await sales.pay(order.id, { method: 'TRANSFER', reference: 'Pago de demostración' }, admin);
        if (status === 'IN_TRANSIT' || status === 'DELIVERED') await sales.transition(order.id, 'IN_TRANSIT');
        if (status === 'DELIVERED') await sales.transition(order.id, 'DELIVERED');
      }
    }
    if (!(await db.order.findUnique({ where: { idempotencyKey: 'seed-social-001' } }))) {
      const cart = await sales.createCart({ channel: 'SOCIAL' }, admin);
      await sales.setItem(cart.id, { productId: products[4].id, quantity: 2 }, admin);
      await sales.checkout(cart.id, { idempotencyKey: 'seed-social-001', recipientName: 'Comprador de redes Demo', recipientPhone: '5555-0102', deliveryAddress: 'Dirección ficticia para entrega', deliveryReference: 'Pedido por redes sociales' }, admin);
    }
    if (!(await db.order.findUnique({ where: { idempotencyKey: 'seed-pos-cash' } }))) {
      let session = await db.cashSession.findFirst({ where: { closedAt: null } });
      const createdSession = !session;
      session ??= await cash.open({ openingAmount: 200 }, admin);
      for (const method of ['CASH', 'CARD'] as const) {
        const cart = await sales.createCart({ channel: 'POS' }, cashier);
        await sales.setItem(cart.id, { productId: products[0].id, quantity: 1 }, cashier);
        await sales.checkout(cart.id, { idempotencyKey: `seed-pos-${method.toLowerCase()}`, cashSessionId: session.id, paymentMethod: method }, cashier);
      }
      if (createdSession) await cash.close(session.id, { countedAmount: 395 }, admin);
    }
    console.log('Datos de repuestos cargados en GTQ. Usuarios: admin@repuestos.demo, cajero@repuestos.demo, cliente@repuestos.demo. Clave: valor privado de SEED_PASSWORD.');
  } finally { await app.close(); }
}
seed().catch(e => { console.error(e); process.exitCode = 1; });
```

## prisma.config.ts

Indica al CLI de Prisma dónde están el schema, las migraciones y la conexión privada.

### Código completo para leer junto a la explicación

```typescript
// Indica al CLI de Prisma dónde están el schema, las migraciones y la conexión privada.

// migraciones y generación; la URL viene del entorno.
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: env('DATABASE_URL') },
});
```

## README.md

Entrada principal: instalación, funciones, estado y enlaces del proyecto.

Lee este documento como apoyo. No ejecuta solicitudes ni cambia la base de datos. 

## requerimientos.md

Alcance, reglas de negocio y criterios del proyecto.

Lee este documento como apoyo. No ejecuta solicitudes ni cambia la base de datos. 

## scripts/conectar-github.ps1

Vincula el historial local al remoto desde la consola del usuario, conservando los archivos de trabajo.

### Código completo para leer junto a la explicación

```powershell
# Vincula el historial local al remoto desde la consola del usuario, conservando los archivos de trabajo.

# ejecuta este archivo en tu propia consola para conectar el historial local.
# La subida inicial se realizó por la API de GitHub; este entorno protege la carpeta .git.
$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
Set-Location -LiteralPath $projectRoot
& git fetch origin main
if ($LASTEXITCODE -ne 0) { throw 'No se pudo obtener el historial de GitHub. Completa la autenticación de Git si se solicita.' }
& git rev-parse --verify HEAD 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
  # crea la referencia y el índice; conserva todos los archivos del directorio de trabajo.
  & git reset --mixed FETCH_HEAD
  if ($LASTEXITCODE -ne 0) { throw 'No se pudo conectar el historial local.' }
  & git branch --set-upstream-to=origin/main main
  if ($LASTEXITCODE -ne 0) { throw 'No se pudo configurar la rama de seguimiento.' }
} else { Write-Host 'El historial local ya contiene commits. Revisa git status antes de integrar otros cambios.' }
& git status --short
```

## scripts/configure-local.cjs

Prepara configuración privada local y credenciales aleatorias sin imprimir secretos.

### Código completo para leer junto a la explicación

```javascript
// Prepara configuración privada local y credenciales aleatorias sin imprimir secretos.

// genera secretos privados y preserva las contraseñas del seed existente.
const fs = require('node:fs');
const path = require('node:path');
const { randomBytes } = require('node:crypto');
const root = path.resolve(__dirname, '..');
const local = path.join(root, '.local');
fs.mkdirSync(local, { recursive: true });
const configPath = path.join(local, 'config.json');
const config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf8').replace(/^\uFEFF/, '')) : { port: 55433, database: 'pos_ecommerce', user: 'postgres', password: randomBytes(24).toString('hex') };
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
const envPath = path.join(root, '.env');
const existing = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
const current = {};
for (const line of existing.split(/\r?\n/)) {
  const match = line.match(/^([A-Z_]+)=(.*)$/);
  if (match) current[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
}
// el ayudante local no reemplaza una conexión remota configurada manualmente.
if (current.DATABASE_URL && !['localhost', '127.0.0.1'].includes(new URL(current.DATABASE_URL).hostname)) {
  throw new Error('Tu .env apunta a una base remota. Usa npm start con esa configuración o guarda tu .env antes de preparar el entorno local.');
}
const url = `postgresql://${config.user}:${config.password}@127.0.0.1:${config.port}/${config.database}`;
const values = { ...current, DATABASE_URL: url, JWT_SECRET: current.JWT_SECRET || randomBytes(48).toString('hex'), SEED_PASSWORD: current.SEED_PASSWORD || randomBytes(18).toString('base64url'), PORT: current.PORT || '3000', NODE_ENV: 'development', CORS_ORIGINS: current.CORS_ORIGINS || 'http://localhost:3000', STORE_CURRENCY: 'GTQ' };
fs.writeFileSync(envPath, '# CONFIGURACIÓN PRIVADA: no subir a GitHub.\n' + Object.entries(values).map(([key, value]) => `${key}=${value}`).join('\n') + '\n');
// ACCESOS: el archivo se guarda dentro de .local, excluido de Git.
fs.writeFileSync(path.join(local, 'ACCESOS-DEMO.md'), `# Accesos privados de demostración\n\nSwagger: http://localhost:${values.PORT}/api/docs\n\n| Rol | Correo |\n| --- | --- |\n| Administrador | admin@repuestos.demo |\n| Cajero | cajero@repuestos.demo |\n| Cliente | cliente@repuestos.demo |\n\nContraseña para las tres cuentas: ${values.SEED_PASSWORD}\n\nEstos accesos son locales. No publiques este archivo. Cambiar SEED_PASSWORD después de crear cuentas no modifica sus contraseñas existentes.\n`);
console.log('Configuración local lista. Accesos guardados en .local/ACCESOS-DEMO.md.');
```

## scripts/detener-base.ps1

Solicita detener PostgreSQL local de forma ordenada.

### Código completo para leer junto a la explicación

```powershell
# Solicita detener PostgreSQL local de forma ordenada.

# detiene únicamente PostgreSQL de este proyecto; la API se detiene con Ctrl+C.
& (Join-Path $PSScriptRoot 'local-db.ps1') -Action Stop
```

## scripts/iniciar-local.ps1

Coordina configuración, PostgreSQL, instalación, Prisma, migraciones, build, seed y arranque.

### Código completo para leer junto a la explicación

```powershell
# Coordina configuración, PostgreSQL, instalación, Prisma, migraciones, build, seed y arranque.

# configura secretos, enciende PostgreSQL y ejecuta la API en esta consola.
param([switch]$Preparar, [switch]$EngineFallback)
$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
Set-Location -LiteralPath $projectRoot
& node (Join-Path $PSScriptRoot 'configure-local.cjs')
if ($LASTEXITCODE -ne 0) { throw 'No se pudo configurar el entorno local.' }
& (Join-Path $PSScriptRoot 'local-db.ps1') -Action Start
if (!(Test-Path -LiteralPath 'node_modules')) {
  & npm.cmd ci
  if ($LASTEXITCODE -ne 0) { throw 'No se pudieron instalar las dependencias.' }
  $Preparar = $true
}
if ($Preparar -or !(Test-Path -LiteralPath 'dist/main.js')) {
  & npm.cmd run prisma:generate
  if ($LASTEXITCODE -ne 0) { throw 'No se pudo generar el cliente Prisma.' }
  if ($EngineFallback) { & (Join-Path $PSScriptRoot 'migrate-local.ps1') }
  else {
    & npm.cmd run db:deploy
    if ($LASTEXITCODE -ne 0) { throw 'No se pudieron aplicar migraciones. Si el entorno informa spawn EPERM, usa -EngineFallback.' }
  }
  & npm.cmd run build
  if ($LASTEXITCODE -ne 0) { throw 'La compilación falló.' }
  & npm.cmd run db:seed
  if ($LASTEXITCODE -ne 0) { throw 'No se pudieron cargar los datos de demostración.' }
}
Write-Host 'Accesos: .local/ACCESOS-DEMO.md. Swagger: http://localhost:3000/api/docs'
Write-Host 'Mantén esta ventana abierta. Ctrl+C detiene la API.'
& npm.cmd start
```

## scripts/local-db.ps1

Inicializa, inicia o detiene únicamente el clúster PostgreSQL propio del proyecto.

### Código completo para leer junto a la explicación

```powershell
# Inicializa, inicia o detiene únicamente el clúster PostgreSQL propio del proyecto.

# administra únicamente el clúster de este proyecto, en .local/postgres.
param([ValidateSet('Start', 'Stop')][string]$Action = 'Start', [string]$PgBin = '')
$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$localDir = Join-Path $projectRoot '.local'
$dataDir = Join-Path $localDir 'postgres'
if (!$PgBin) {
  $candidate = Get-ChildItem -LiteralPath 'C:\Program Files\PostgreSQL' -Directory -ErrorAction SilentlyContinue | Sort-Object { [int]$_.Name } -Descending | Select-Object -First 1
  if ($candidate) { $PgBin = Join-Path $candidate.FullName 'bin' }
}
if (!(Test-Path -LiteralPath (Join-Path $PgBin 'postgres.exe'))) { throw 'Instala PostgreSQL o indica -PgBin con su carpeta bin.' }
if (!(Test-Path -LiteralPath (Join-Path $localDir 'config.json'))) { throw 'Ejecuta primero node scripts/configure-local.cjs.' }
$config = Get-Content -LiteralPath (Join-Path $localDir 'config.json') -Raw | ConvertFrom-Json
$port = [int]$config.port
if ($Action -eq 'Stop') {
  # pg_ctl recibe el directorio exacto del clúster propio.
  if (Test-Path -LiteralPath (Join-Path $dataDir 'postmaster.pid')) {
    & (Join-Path $PgBin 'pg_ctl.exe') -D $dataDir -m fast -w stop
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo detener PostgreSQL local.' }
  }
  return
}
if (!(Test-Path -LiteralPath (Join-Path $dataDir 'PG_VERSION'))) {
  $passwordFile = Join-Path $localDir 'init-password.tmp'
  [IO.File]::WriteAllText($passwordFile, [string]$config.password)
  try {
    # SCRAM con clave aleatoria y conexión limitada a loopback.
    & (Join-Path $PgBin 'initdb.exe') -D $dataDir -U $config.user -A scram-sha-256 --encoding=UTF8 --locale=C "--pwfile=$passwordFile"
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo inicializar el clúster local.' }
  } finally { Remove-Item -LiteralPath $passwordFile -ErrorAction SilentlyContinue }
}
$env:PGPASSWORD = [string]$config.password
try {
  $running = $false
  if (Test-Path -LiteralPath (Join-Path $dataDir 'postmaster.pid')) {
    $pidLines = Get-Content -LiteralPath (Join-Path $dataDir 'postmaster.pid')
    $ownProcess = Get-Process -Id ([int]$pidLines[0]) -ErrorAction SilentlyContinue
    $running = !!$ownProcess -and $ownProcess.ProcessName -eq 'postgres'
  }
  if (!$running) {
    & (Join-Path $PgBin 'pg_isready.exe') -h 127.0.0.1 -p $port *> $null
    if ($LASTEXITCODE -eq 0) { throw "El puerto $port está ocupado por otro clúster. No se modificará esa base." }
    # ventana oculta; las rutas de log permanecen dentro del proyecto.
    $process = Start-Process -FilePath (Join-Path $PgBin 'postgres.exe') -ArgumentList @('-D', ('"' + $dataDir + '"'), '-p', $port, '-h', '127.0.0.1') -WorkingDirectory $projectRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $localDir 'postgres-out.log') -RedirectStandardError (Join-Path $localDir 'postgres-error.log') -PassThru
    for ($attempt = 0; $attempt -lt 30; $attempt++) {
      & (Join-Path $PgBin 'pg_isready.exe') -h 127.0.0.1 -p $port *> $null
      if ($LASTEXITCODE -eq 0) { break }
      Start-Sleep -Milliseconds 300
    }
    if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL no inició. Revisa .local/postgres-error.log.' }
  }
  # autenticar verifica que se trata de nuestro clúster.
  $exists = & (Join-Path $PgBin 'psql.exe') -h 127.0.0.1 -p $port -U $config.user -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = 'pos_ecommerce'"
  if ($LASTEXITCODE -ne 0) { throw 'No se pudo autenticar en PostgreSQL local.' }
  if (($exists -join '').Trim() -ne '1') {
    & (Join-Path $PgBin 'createdb.exe') -h 127.0.0.1 -p $port -U $config.user pos_ecommerce
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo crear la base del proyecto.' }
  }
  Write-Host "PostgreSQL del proyecto disponible en 127.0.0.1:$port."
} finally { Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue }
```

## scripts/migrate-local.ps1

Aplica las migraciones usando el motor oficial Prisma cuando un entorno restringido no permite lanzarlo desde Node.

### Código completo para leer junto a la explicación

```powershell
# Aplica las migraciones usando el motor oficial Prisma cuando un entorno restringido no permite lanzarlo desde Node.

# usa el mismo motor Prisma cuando el entorno restringe spawn de Node.
# El flujo habitual sigue siendo npm run db:deploy; este adaptador usa la versión del lockfile.
param([string]$DatabaseUrl = '')
$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
if (!$DatabaseUrl) {
  $config = Get-Content -LiteralPath (Join-Path $projectRoot '.local/config.json') -Raw | ConvertFrom-Json
  $DatabaseUrl = "postgresql://$($config.user):$($config.password)@127.0.0.1:$($config.port)/$($config.database)"
}
$uri = [uri]$DatabaseUrl
if ($uri.Host -notin @('127.0.0.1', 'localhost')) { throw 'Este adaptador solo admite bases locales.' }
$migrationRoot = Join-Path $projectRoot 'prisma/migrations'
$directories = @(Get-ChildItem -LiteralPath $migrationRoot -Directory | Sort-Object Name | ForEach-Object {
  @{ path=$_.Name; migrationFile=@{ path='migration.sql'; content=@{ tag='ok'; value=[IO.File]::ReadAllText((Join-Path $_.FullName 'migration.sql')) } } }
})
$list = @{ baseDir=$migrationRoot; lockfile=@{ path='migration_lock.toml'; content=[IO.File]::ReadAllText((Join-Path $migrationRoot 'migration_lock.toml')) }; migrationDirectories=$directories; shadowDbInitScript='' }
$rpc = @{ id=1; jsonrpc='2.0'; method='applyMigrations'; params=@{ migrationsList=$list; filters=@{ externalTables=@(); externalEnums=@() } } } | ConvertTo-Json -Depth 15 -Compress
$source = @{url=$DatabaseUrl} | ConvertTo-Json -Compress
# el motor ejecuta SQL y registra checksums en _prisma_migrations.
# mantener stdin abierto hasta la respuesta evita cortar una migración en curso.
$engineInfo = [Diagnostics.ProcessStartInfo]::new()
$engineInfo.FileName = Join-Path $projectRoot 'node_modules/@prisma/engines/schema-engine-windows.exe'
$engineInfo.Arguments = '--datamodels "' + (Join-Path $projectRoot 'prisma/schema.prisma') + '" --datasource "' + $source.Replace('"', '\"') + '"'
$engineInfo.UseShellExecute = $false
$engineInfo.CreateNoWindow = $true

$engineInfo.StandardOutputEncoding = [Text.UTF8Encoding]::new($false)
$engineInfo.RedirectStandardInput = $true
$engineInfo.RedirectStandardOutput = $true
$engineInfo.RedirectStandardError = $true
$engine = [Diagnostics.Process]::new()
$engine.StartInfo = $engineInfo
try {
  [void]$engine.Start()
  $inputWriter = [IO.StreamWriter]::new($engine.StandardInput.BaseStream, [Text.UTF8Encoding]::new($false))
  $inputWriter.AutoFlush = $true
  $stderrTask = $engine.StandardError.ReadToEndAsync()
  $inputWriter.WriteLine($rpc)
  $response = $null
  while (!$response) {
    $lineTask = $engine.StandardOutput.ReadLineAsync()
    if (!$lineTask.Wait(30000)) { throw 'El motor tardó más de lo previsto.' }
    $line = $lineTask.Result
    if (!$line) { throw ('El motor terminó antes de responder: ' + ($stderrTask.Result.Replace($DatabaseUrl, '<URL local>'))) }
    $message = $line | ConvertFrom-Json
    if ($message.method) {
      # El motor puede solicitar impresión de progreso; confirmar su callback.
      if ($null -ne $message.id) { $inputWriter.WriteLine((@{jsonrpc='2.0';id=$message.id;result=@{}} | ConvertTo-Json -Compress)) }
    } elseif ($message.id -eq 1) { $response = $message }
  }
  if ($response.error) { throw ('Migración rechazada: ' + ($response.error.data.message.Replace($DatabaseUrl, '<URL local>'))) }
  Write-Host ('Migraciones aplicadas: ' + ($response.result.appliedMigrationNames -join ', '))
} finally {
  if ($engine.Id) {
    if ($inputWriter) { $inputWriter.Close() }
    if (!$engine.WaitForExit(3000)) { $engine.Kill() }
    $engine.Dispose()
  }
}
```

## scripts/probar-local.ps1

Prepara la base exclusiva de pruebas y ejecuta e2e sin limpiar la base de demostración.

### Código completo para leer junto a la explicación

```powershell
# Prepara la base exclusiva de pruebas y ejecuta e2e sin limpiar la base de demostración.

# usa una base exclusiva terminada en _test y preserva la demostración.
param([switch]$EngineFallback)
$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
Set-Location -LiteralPath $projectRoot
& node scripts/configure-local.cjs
if ($LASTEXITCODE -ne 0) { throw 'Configuración local inválida.' }
& (Join-Path $PSScriptRoot 'local-db.ps1') -Action Start
$config = Get-Content -LiteralPath '.local/config.json' -Raw | ConvertFrom-Json
$candidate = Get-ChildItem -LiteralPath 'C:\Program Files\PostgreSQL' -Directory | Sort-Object { [int]$_.Name } -Descending | Select-Object -First 1
$pgBin = Join-Path $candidate.FullName 'bin'
$env:PGPASSWORD = [string]$config.password
try {
  $exists = & (Join-Path $pgBin 'psql.exe') -h 127.0.0.1 -p $config.port -U $config.user -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = 'pos_ecommerce_test'"
  if ($LASTEXITCODE -ne 0) { throw 'No se pudo consultar la base de pruebas.' }
  if (($exists -join '').Trim() -ne '1') {
    & (Join-Path $pgBin 'createdb.exe') -h 127.0.0.1 -p $config.port -U $config.user pos_ecommerce_test
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo crear la base de pruebas.' }
  }
} finally { Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue }
$previousDatabase = $env:DATABASE_URL
$previousTest = $env:TEST_DATABASE_URL
try {
  $env:TEST_DATABASE_URL = "postgresql://$($config.user):$($config.password)@127.0.0.1:$($config.port)/pos_ecommerce_test"
  $env:DATABASE_URL = $env:TEST_DATABASE_URL
  if ($EngineFallback) { & (Join-Path $PSScriptRoot 'migrate-local.ps1') -DatabaseUrl $env:TEST_DATABASE_URL }
  else { & npm.cmd run db:deploy; if ($LASTEXITCODE -ne 0) { throw 'Falló la migración de pruebas.' } }
  & npm.cmd run build
  if ($LASTEXITCODE -ne 0) { throw 'Falló la compilación.' }
  # el mismo proceso evita restricciones de procesos hijos.
  & node test/e2e.cjs
  if ($LASTEXITCODE -ne 0) { throw 'Las pruebas fallaron.' }
} finally { $env:DATABASE_URL = $previousDatabase; $env:TEST_DATABASE_URL = $previousTest }
```

## src/addresses/addresses.controller.ts

Recibe solicitudes HTTP, valida parámetros con DTO/Pipes y delega reglas en servicios.

| Bloque o campo | Explicación | Línea del archivo |
| --- | --- | --- |
| `Clase AddressesController` | Recibe solicitudes HTTP, valida parámetros con DTO/Pipes y delega reglas en servicios. | 10 |
| `constructor` | Inyecta las dependencias necesarias; NestJS proporciona estas instancias al construir la clase. | 13 |
| `list` | Recibe datos de la ruta y delega list al servicio; los decoradores definen HTTP, documentación y permisos. | 15 |
| `create` | Recibe datos de la ruta y delega create al servicio; los decoradores definen HTTP, documentación y permisos. | 18 |
| `update` | Recibe datos de la ruta y delega update al servicio; los decoradores definen HTTP, documentación y permisos. | 21 |
| `remove` | Recibe datos de la ruta y delega remove al servicio; los decoradores definen HTTP, documentación y permisos. | 24 |

### Código completo para leer junto a la explicación

```typescript
// Recibe solicitudes HTTP, valida parámetros con DTO/Pipes y delega reglas en servicios.

import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Actor, CurrentUser, Roles } from '../common/security';
import { AddressDto, UpdateAddressDto } from './addresses.dto';
import { AddressesService } from './addresses.service';
// reciben DTOs validados y delegan la autorización de propiedad al servicio.

@ApiTags('Direcciones') @ApiBearerAuth() @Roles('CUSTOMER') @Controller('addresses')
export class AddressesController {
  
  constructor(private readonly service: AddressesService) {}
  // Pasa los datos de esta ruta al método list del servicio.
  @Get() @ApiOperation({ summary: 'Mis direcciones' })
  list(@CurrentUser() u: Actor) { return this.service.list(u.id); }
  // Pasa los datos de esta ruta al método create del servicio.
  @Post() @ApiOperation({ summary: 'Guardar dirección personal' })
  create(@Body() dto: AddressDto, @CurrentUser() u: Actor) { return this.service.create(dto, u.id); }
  // Pasa los datos de esta ruta al método update del servicio.
  @Patch(':id') @ApiOperation({ summary: 'Editar dirección sin alterar pedidos históricos' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAddressDto, @CurrentUser() u: Actor) { return this.service.update(id, dto, u.id); }
  // Pasa los datos de esta ruta al método remove del servicio.
  @Delete(':id') @ApiOperation({ summary: 'Eliminar dirección guardada' })
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() u: Actor) { return this.service.remove(id, u.id); }
}
```

## src/addresses/addresses.dto.ts

Declara contratos de entrada, validadores y ejemplos Swagger. Un tipo TypeScript solo no valida un JSON recibido.

| Bloque o campo | Explicación | Línea del archivo |
| --- | --- | --- |
| `Clase AddressDto` | DTO con validación de entradas. | 7 |
| `recipientName` | Tipo string. Validaciones: @ApiProperty({ example: 'Ana López' }), @IsString(), @MinLength(2), @MaxLength(150) | 9 |
| `phone` | Tipo string. Validaciones: @ApiProperty({ example: '5555-0101' }), @IsString(), @MinLength(5), @MaxLength(30) | 11 |
| `addressLine` | Tipo string. Validaciones: @ApiProperty({ example: 'Zona 1, Ciudad de Guatemala' }), @IsString(), @MinLength(5), @MaxLength(500) | 13 |
| `reference` | Tipo string. Validaciones: @ApiPropertyOptional({ example: 'Portón azul' }), @IsOptional(), @IsString(), @MaxLength(500) | 15 |
| `Clase UpdateAddressDto` | DTO con validación de entradas. | 18 |

### Código completo para leer junto a la explicación

```typescript
// Declara contratos de entrada, validadores y ejemplos Swagger. Un tipo TypeScript solo no valida un JSON recibido.

import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
// únicamente el dueño puede consultarla o modificarla.

export class AddressDto {
  // Nombre de quien recibirá el pedido.
  @ApiProperty({ example: 'Ana López' }) @IsString() @MinLength(2) @MaxLength(150) recipientName: string;
  // Teléfono de contacto.
  @ApiProperty({ example: '5555-0101' }) @IsString() @MinLength(5) @MaxLength(30) phone: string;
  // Dirección guardada por el cliente.
  @ApiProperty({ example: 'Zona 1, Ciudad de Guatemala' }) @IsString() @MinLength(5) @MaxLength(500) addressLine: string;
  // Referencia opcional para identificar la dirección o el pago.
  @ApiPropertyOptional({ example: 'Portón azul' }) @IsOptional() @IsString() @MaxLength(500) reference?: string;
}

export class UpdateAddressDto extends PartialType(AddressDto) {}
```

## src/addresses/addresses.module.ts

Registra controladores y servicios para que NestJS pueda construir sus dependencias.

| Bloque o campo | Explicación | Línea del archivo |
| --- | --- | --- |
| `Clase AddressesModule` | Registra controladores y servicios para que NestJS pueda construir sus dependencias. | 8 |

### Código completo para leer junto a la explicación

```typescript
// Registra controladores y servicios para que NestJS pueda construir sus dependencias.

import { Module } from '@nestjs/common';
import { AddressesController } from './addresses.controller';
import { AddressesService } from './addresses.service';
// registra las dependencias de las direcciones personales.

@Module({ controllers: [AddressesController], providers: [AddressesService] })
export class AddressesModule {}
```

## src/addresses/addresses.service.ts

Guarda y modifica direcciones del usuario autenticado, comprobando propiedad.

| Bloque o campo | Explicación | Línea del archivo |
| --- | --- | --- |
| `Clase AddressesService` | Guarda y modifica direcciones del usuario autenticado, comprobando propiedad. | 8 |
| `constructor` | Inyecta las dependencias necesarias; NestJS proporciona estas instancias al construir la clase. | 11 |
| `own` | Busca una dirección y rechaza su uso si pertenece a otra persona. | 13 |
| `list` | Consulta el listado correspondiente, filtrado o limitado según las reglas del servicio. | 19 |
| `create` | Guarda una dirección con userId obtenido del token. | 21 |
| `update` | Aplica cambios permitidos por el DTO; comprueba propiedad o categoría según este servicio. | 23 |
| `remove` | Retira el registro autorizado según las reglas de este servicio. | 28 |

### Código completo para leer junto a la explicación

```typescript
// Guarda y modifica direcciones del usuario autenticado, comprobando propiedad.

import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddressDto, UpdateAddressDto } from './addresses.dto';
// el token determina el dueño; nunca se acepta userId desde el cliente.

@Injectable()
export class AddressesService {
  
  constructor(private readonly prisma: PrismaService) {}
  // Busca una dirección y rechaza su uso si pertenece a otra persona.
  private async own(id: number, userId: number) {
    const address = await this.prisma.address.findUnique({ where: { id } });
    if (!address) throw new NotFoundException('Dirección no encontrada');
    if (address.userId !== userId) throw new ForbiddenException('Dirección ajena');
  }
  // Consulta los registros que permite este servicio.
  list(userId: number) { return this.prisma.address.findMany({ where: { userId } }); }
  // Guarda una dirección con userId obtenido del token.
  create(dto: AddressDto, userId: number) { return this.prisma.address.create({ data: { ...dto, userId } }); }
  // Aplica cambios permitidos por el DTO; comprueba propiedad o categoría según este servicio.
  async update(id: number, dto: UpdateAddressDto, userId: number) {
    await this.own(id, userId);
    return this.prisma.address.update({ where: { id }, data: dto });
  }
  // Retira el registro autorizado según las reglas de este servicio.
  async remove(id: number, userId: number) {
    await this.own(id, userId);
    return this.prisma.address.delete({ where: { id } });
  }
}
```

## src/app.module.ts

Reúne los módulos, valida variables con Joi y registra Guards globales. Incluye la ruta de salud que consulta PostgreSQL.

| Bloque o campo | Explicación | Línea del archivo |
| --- | --- | --- |
| `Clase HealthController` | Reúne los módulos, valida variables con Joi y registra Guards globales. Incluye la ruta de salud que consulta PostgreSQL. | 19 |
| `constructor` | Inyecta las dependencias necesarias; NestJS proporciona estas instancias al construir la clase. | 22 |
| `health` | Ejecuta SELECT 1 para comprobar la conexión y devuelve estado, tienda y moneda. | 24 |
| `Clase AppModule` | Reúne los módulos, valida variables con Joi y registra Guards globales. Incluye la ruta de salud que consulta PostgreSQL. | 30 |

### Código completo para leer junto a la explicación

```typescript
// Reúne los módulos, valida variables con Joi y registra Guards globales. Incluye la ruta de salud que consulta PostgreSQL.

import { Controller, Get, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import Joi from 'joi';
import { PrismaModule, PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { JwtGuard, Public, RolesGuard } from './common/security';
import { CatalogModule } from './catalog/catalog.module';
import { AddressesModule } from './addresses/addresses.module';
import { SalesModule } from './sales/sales.module';
import { CashModule } from './cash/cash.module';
import { MockPayModule } from './mockpay/mockpay.module';


@ApiTags('Estado') @Controller('health')
class HealthController {
  
  constructor(private readonly prisma: PrismaService, private readonly config: ConfigService) {}
  // Ejecuta SELECT 1 para comprobar la conexión y devuelve estado, tienda y moneda.
  @Public() @Get() @ApiOperation({ summary: 'Comprobar disponibilidad del backend y PostgreSQL' })
  async health() { await this.prisma.$queryRaw`SELECT 1`; return { status: 'ok', store: 'Repuestos', currency: this.config.get('STORE_CURRENCY') }; }
}

// valida configuración al iniciar; protege todas las rutas por defecto.

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, validationSchema: Joi.object({
    DATABASE_URL: Joi.string().required(), JWT_SECRET: Joi.string().min(32).required(),
    PORT: Joi.number().port().default(3000), NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    CORS_ORIGINS: Joi.string().allow('').default(''), STORE_CURRENCY: Joi.string().valid('GTQ').default('GTQ'),
    MOCKPAY_API_URL: Joi.string().uri().default('https://mockpay-backend.onrender.com'), MOCKPAY_SECRET_KEY: Joi.string().allow('').optional(),
  }) }), ThrottlerModule.forRoot([{ ttl: 60000, limit: 300 }]), PrismaModule, AuthModule, CatalogModule, AddressesModule, SalesModule, CashModule, MockPayModule],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }, { provide: APP_GUARD, useClass: JwtGuard }, { provide: APP_GUARD, useClass: RolesGuard }],
})
export class AppModule {}
```

## src/auth/auth.controller.ts

Recibe solicitudes HTTP, valida parámetros con DTO/Pipes y delega reglas en servicios.

| Bloque o campo | Explicación | Línea del archivo |
| --- | --- | --- |
| `Clase AuthController` | Recibe solicitudes HTTP, valida parámetros con DTO/Pipes y delega reglas en servicios. | 12 |
| `constructor` | Inyecta las dependencias necesarias; NestJS proporciona estas instancias al construir la clase. | 15 |
| `register` | Recibe datos de la ruta y delega register al servicio; los decoradores definen HTTP, documentación y permisos. | 17 |
| `login` | Recibe datos de la ruta y delega login al servicio; los decoradores definen HTTP, documentación y permisos. | 21 |
| `me` | Recibe datos de la ruta y delega me al servicio; los decoradores definen HTTP, documentación y permisos. | 25 |
| `Clase UsersController` | Recibe solicitudes HTTP, valida parámetros con DTO/Pipes y delega reglas en servicios. | 30 |
| `constructor` | Inyecta las dependencias necesarias; NestJS proporciona estas instancias al construir la clase. | 33 |
| `create` | Recibe datos de la ruta y delega register al servicio; los decoradores definen HTTP, documentación y permisos. | 35 |
| `list` | Recibe datos de la ruta y delega listUsers al servicio; los decoradores definen HTTP, documentación y permisos. | 38 |
| `active` | Recibe datos de la ruta y delega setActive al servicio; los decoradores definen HTTP, documentación y permisos. | 41 |

### Código completo para leer junto a la explicación

```typescript
// Recibe solicitudes HTTP, valida parámetros con DTO/Pipes y delega reglas en servicios.

import { Body, Controller, Get, HttpCode, Post, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { ActiveDto, CreateStaffDto, LoginDto, RegisterDto } from './auth.dto';
import { Actor, CurrentUser, Public, Roles } from '../common/security';

// los servicios ejecutan hashing y emisión de tokens.

@ApiTags('Autenticación') @Controller('auth')
export class AuthController {
  
  constructor(private readonly auth: AuthService) {}
  // Pasa los datos de esta ruta al método register del servicio.
  @Public() @Post('register') @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Registrar cliente; nunca crea cuentas internas' })
  register(@Body() dto: RegisterDto) { return this.auth.register(dto); }
  // Pasa los datos de esta ruta al método login del servicio.
  @Public() @Post('login') @HttpCode(200) @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Obtener JWT válido durante una hora' })
  login(@Body() dto: LoginDto) { return this.auth.login(dto); }
  // Pasa los datos de esta ruta al método me del servicio.
  @Get('me') @ApiBearerAuth() @ApiOperation({ summary: 'Consultar identidad del token actual' })
  me(@CurrentUser() user: Actor) { return user; }
}


@ApiTags('Usuarios internos') @ApiBearerAuth() @Roles('ADMIN') @Controller('users')
export class UsersController {
  
  constructor(private readonly auth: AuthService) {}
  // Pasa los datos de esta ruta al método register del servicio.
  @Post() @ApiOperation({ summary: 'Crear usuario por decisión del administrador' })
  create(@Body() dto: CreateStaffDto) { return this.auth.register(dto, dto.role); }
  // Pasa los datos de esta ruta al método listUsers del servicio.
  @Get() @ApiOperation({ summary: 'Listar cuentas sin hashes (máximo 100)' })
  list() { return this.auth.listUsers(); }
  // Pasa los datos de esta ruta al método setActive del servicio.
  @Patch(':id/active') @ApiOperation({ summary: 'Activar o desactivar una cuenta' })
  active(@Param('id', ParseIntPipe) id: number, @Body() dto: ActiveDto, @CurrentUser() user: Actor) {
    return this.auth.setActive(id, dto.active, user);
  }
}
```

## src/auth/auth.dto.ts

Declara contratos de entrada, validadores y ejemplos Swagger. Un tipo TypeScript solo no valida un JSON recibido.

| Bloque o campo | Explicación | Línea del archivo |
| --- | --- | --- |
| `Clase LoginDto` | DTO con validación de entradas. | 10 |
| `email` | Tipo string. Validaciones: @ApiProperty({ example: 'cliente@demo.local' }), @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value), @IsEmail(), @MaxLength(254) | 12 |
| `password` | Tipo string. Validaciones: @ApiProperty({ minLength: 10, example: 'TuClaveDeDemo123!' }), @IsString(), @MinLength(10), @MaxLength(64) | 15 |
| `Clase RegisterDto` | DTO con validación de entradas. | 19 |
| `name` | Tipo string. Validaciones: @ApiProperty({ example: 'Ana López' }), @IsString(), @MinLength(2), @MaxLength(150) | 21 |
| `phone` | Tipo string. Validaciones: @ApiPropertyOptional({ example: '5555-0101' }), @IsOptional(), @IsString(), @MaxLength(30) | 24 |
| `Clase CreateStaffDto` | DTO con validación de entradas. | 28 |
| `role` | Tipo UserRole. Validaciones: @ApiProperty({ enum: UserRole }), @IsEnum(UserRole) | 30 |
| `Clase ActiveDto` | DTO con validación de entradas. | 34 |
| `active` | Tipo boolean. Validaciones: @ApiProperty(), @IsBoolean() | 36 |

### Código completo para leer junto a la explicación

```typescript
// Declara contratos de entrada, validadores y ejemplos Swagger. Un tipo TypeScript solo no valida un JSON recibido.

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength, IsBoolean } from 'class-validator';
import { UserRole } from '../generated/prisma/enums';

// el registro público no contiene un campo role.

export class LoginDto {
  // Correo que usamos para iniciar sesión.
  @ApiProperty({ example: 'cliente@demo.local' }) @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value) @IsEmail() @MaxLength(254)
  email: string;
  // Contraseña que llega en la petición; después se compara o se guarda como hash.
  @ApiProperty({ minLength: 10, example: 'TuClaveDeDemo123!' }) @IsString() @MinLength(10) @MaxLength(64)
  password: string;
}

export class RegisterDto extends LoginDto {
  // Nombre del usuario o del registro.
  @ApiProperty({ example: 'Ana López' }) @IsString() @MinLength(2) @MaxLength(150)
  name: string;
  // Teléfono de contacto.
  @ApiPropertyOptional({ example: '5555-0101' }) @IsOptional() @IsString() @MaxLength(30)
  phone?: string;
}

export class CreateStaffDto extends RegisterDto {
  // Rol que determina los permisos del usuario.
  @ApiProperty({ enum: UserRole }) @IsEnum(UserRole)
  role: UserRole;
}

export class ActiveDto {
  // Indica si la cuenta o el registro sigue disponible.
  @ApiProperty() @IsBoolean()
  active: boolean;
}
```

## src/auth/auth.module.ts

Registra controladores y servicios para que NestJS pueda construir sus dependencias.

| Bloque o campo | Explicación | Línea del archivo |
| --- | --- | --- |
| `Clase AuthModule` | Registra controladores y servicios para que NestJS pueda construir sus dependencias. | 12 |

### Código completo para leer junto a la explicación

```typescript
// Registra controladores y servicios para que NestJS pueda construir sus dependencias.

import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { AuthController, UsersController } from './auth.controller';
// conecta Passport, JWT y las rutas de identidad.

@Module({ imports: [PassportModule, JwtModule.registerAsync({ inject: [ConfigService], useFactory: (config: ConfigService) => ({ secret: config.getOrThrow<string>('JWT_SECRET'), signOptions: { expiresIn: '1h', algorithm: 'HS256' } }) })], providers: [AuthService, JwtStrategy], controllers: [AuthController, UsersController] })
export class AuthModule {}
```

## src/auth/auth.service.ts

Registra cuentas con bcrypt, valida el login, emite JWT y administra activación de usuarios.

| Bloque o campo | Explicación | Línea del archivo |
| --- | --- | --- |
| `Clase AuthService` | Registra cuentas con bcrypt, valida el login, emite JWT y administra activación de usuarios. | 13 |
| `constructor` | Inyecta las dependencias necesarias; NestJS proporciona estas instancias al construir la clase. | 16 |
| `listUsers` | Devuelve hasta cien usuarios con select seguro, sin passwordHash. | 19 |
| `setActive` | Cambia la disponibilidad de una cuenta y evita que el administrador se desactive a sí mismo. | 21 |
| `register` | Valida el límite de bytes de bcrypt, calcula un hash con costo 12 y crea el usuario con rol controlado por el servidor. | 27 |
| `login` | Busca la cuenta, verifica active y compara bcrypt; devuelve JWT con sub y vigencia de una hora. | 33 |

### Código completo para leer junto a la explicación

```typescript
// Registra cuentas con bcrypt, valida el login, emite JWT y administra activación de usuarios.

import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, compare } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './auth.dto';
import { Actor } from '../common/security';
import { UserRole } from '../generated/prisma/enums';
export const safeUser = { id: true, name: true, email: true, phone: true, role: true, active: true } as const;


@Injectable()
export class AuthService {
  
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}
  // las respuestas excluyen siempre el hash de contraseña.
  // Devuelve hasta cien usuarios con select seguro, sin passwordHash.
  listUsers() { return this.prisma.user.findMany({ select: safeUser, take: 100, orderBy: { id: 'asc' } }); }
  // Cambia la disponibilidad de una cuenta y evita que el administrador se desactive a sí mismo.
  setActive(id: number, active: boolean, actor: Actor) {
    if (id === actor.id && !active) throw new BadRequestException('No puedes desactivar tu propia cuenta');
    return this.prisma.user.update({ where: { id }, data: { active }, select: safeUser });
  }
  // bcrypt tiene límite de 72 bytes; validar bytes evita truncar contraseñas Unicode.
  // Valida el límite de bytes de bcrypt, calcula un hash con costo 12 y crea el usuario con rol controlado por el servidor.
  async register(dto: RegisterDto, role: UserRole = UserRole.CUSTOMER) {
    if (Buffer.byteLength(dto.password, 'utf8') > 72) throw new BadRequestException('Contraseña demasiado larga en bytes');
    const passwordHash = await hash(dto.password, 12);
    return this.prisma.user.create({ data: { email: dto.email, name: dto.name, phone: dto.phone, passwordHash, role }, select: safeUser });
  }
  // Busca la cuenta, verifica active y compara bcrypt; devuelve JWT con sub y vigencia de una hora.
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.active || !(await compare(dto.password, user.passwordHash))) throw new UnauthorizedException('Credenciales inválidas');
    return { accessToken: await this.jwt.signAsync({ sub: user.id }), tokenType: 'Bearer', expiresIn: 3600 };
  }
}
```

## src/auth/jwt.strategy.ts

Passport obtiene el Bearer token, verifica firma/expiración y consulta el estado actual del usuario.

| Bloque o campo | Explicación | Línea del archivo |
| --- | --- | --- |
| `Clase JwtStrategy` | Passport obtiene el Bearer token, verifica firma/expiración y consulta el estado actual del usuario. | 12 |
| `constructor` | Inyecta las dependencias necesarias; NestJS proporciona estas instancias al construir la clase. | 15 |
| `validate` | Consulta el usuario del sub del JWT y rechaza cuentas que ya no estén activas. | 20 |

### Código completo para leer junto a la explicación

```typescript
// Passport obtiene el Bearer token, verifica firma/expiración y consulta el estado actual del usuario.

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
import { safeUser } from './auth.service';

// verifica firma y expiración; consulta rol/estado actual en cada petición.

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  
  constructor(config: ConfigService, private readonly prisma: PrismaService) {
    super({ jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'), algorithms: ['HS256'] });
  }
  // Consulta el usuario del sub del JWT y rechaza cuentas que ya no estén activas.
  async validate(payload: { sub?: unknown }) {
    if (!Number.isInteger(payload.sub)) throw new UnauthorizedException();
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub as number }, select: safeUser });
    if (!user?.active) throw new UnauthorizedException('Cuenta no disponible');
    return user;
  }
}
```

## src/cash/cash.controller.ts

Recibe solicitudes HTTP, valida parámetros con DTO/Pipes y delega reglas en servicios.

| Bloque o campo | Explicación | Línea del archivo |
| --- | --- | --- |
| `Clase CashController` | Recibe solicitudes HTTP, valida parámetros con DTO/Pipes y delega reglas en servicios. | 10 |
| `constructor` | Inyecta las dependencias necesarias; NestJS proporciona estas instancias al construir la clase. | 13 |
| `list` | Recibe datos de la ruta y delega list al servicio; los decoradores definen HTTP, documentación y permisos. | 15 |
| `open` | Recibe datos de la ruta y delega open al servicio; los decoradores definen HTTP, documentación y permisos. | 18 |
| `get` | Recibe datos de la ruta y delega get al servicio; los decoradores definen HTTP, documentación y permisos. | 21 |
| `close` | Recibe datos de la ruta y delega close al servicio; los decoradores definen HTTP, documentación y permisos. | 24 |

### Código completo para leer junto a la explicación

```typescript
// Recibe solicitudes HTTP, valida parámetros con DTO/Pipes y delega reglas en servicios.

import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Actor, CurrentUser, Roles } from '../common/security';
import { CashService } from './cash.service';
import { OpenCashDto, CloseCashDto } from './cash.dto';
// el administrador abre y cierra caja; el cajero puede consultar el listado.

@ApiTags('Caja') @ApiBearerAuth() @Controller('cash-sessions')
export class CashController {
  
  constructor(private readonly service: CashService) {}
  // Pasa los datos de esta ruta al método list del servicio.
  @Get() @Roles('ADMIN', 'CASHIER') @ApiOperation({ summary: 'Listar últimas 100 sesiones para seleccionar caja abierta' })
  list() { return this.service.list(); }
  // Pasa los datos de esta ruta al método open del servicio.
  @Post() @Roles('ADMIN') @ApiOperation({ summary: 'Abrir caja física única' })
  open(@Body() dto: OpenCashDto, @CurrentUser() actor: Actor) { return this.service.open(dto, actor); }
  // Pasa los datos de esta ruta al método get del servicio.
  @Get(':id') @Roles('ADMIN') @ApiOperation({ summary: 'Conciliar efectivo y consultar ventas por método de pago' })
  get(@Param('id', ParseIntPipe) id: number) { return this.service.get(id); }
  // Pasa los datos de esta ruta al método close del servicio.
  @Post(':id/close') @Roles('ADMIN') @ApiOperation({ summary: 'Cerrar caja con el efectivo contado y calcular diferencia' })
  close(@Param('id', ParseIntPipe) id: number, @Body() dto: CloseCashDto, @CurrentUser() actor: Actor) { return this.service.close(id, dto, actor); }
}
```

## src/cash/cash.dto.ts

Declara contratos de entrada, validadores y ejemplos Swagger. Un tipo TypeScript solo no valida un JSON recibido.

| Bloque o campo | Explicación | Línea del archivo |
| --- | --- | --- |
| `Clase OpenCashDto` | DTO con validación de entradas. | 7 |
| `openingAmount` | Tipo number. Validaciones: @ApiProperty({ example: 200 }), @IsNumber({ maxDecimalPlaces: 2 }), @Min(0), @Max(99999999) | 9 |
| `Clase CloseCashDto` | DTO con validación de entradas. | 12 |
| `countedAmount` | Tipo number. Validaciones: @ApiProperty({ example: 395 }), @IsNumber({ maxDecimalPlaces: 2 }), @Min(0), @Max(99999999) | 14 |

### Código completo para leer junto a la explicación

```typescript
// Declara contratos de entrada, validadores y ejemplos Swagger. Un tipo TypeScript solo no valida un JSON recibido.

import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min } from 'class-validator';
// apertura es fondo inicial; cierre es el efectivo contado físicamente.

export class OpenCashDto {
  // Efectivo con el que se abre la caja.
  @ApiProperty({ example: 200 }) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(99999999) openingAmount: number;
}

export class CloseCashDto {
  // Efectivo contado al cerrar la caja.
  @ApiProperty({ example: 395 }) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(99999999) countedAmount: number;
}
```

## src/cash/cash.module.ts

Registra controladores y servicios para que NestJS pueda construir sus dependencias.

| Bloque o campo | Explicación | Línea del archivo |
| --- | --- | --- |
| `Clase CashModule` | Registra controladores y servicios para que NestJS pueda construir sus dependencias. | 9 |

### Código completo para leer junto a la explicación

```typescript
// Registra controladores y servicios para que NestJS pueda construir sus dependencias.

import { Module } from '@nestjs/common';
import { CashController } from './cash.controller';
import { CashService } from './cash.service';
// registra caja y permite al seed reutilizar las reglas del servicio.
export { CashService } from './cash.service';

@Module({ providers: [CashService], controllers: [CashController] })
export class CashModule {}
```

## src/cash/cash.service.ts

Abre caja, agrupa pagos POS, calcula efectivo esperado y coordina el cierre con ventas concurrentes.

| Bloque o campo | Explicación | Línea del archivo |
| --- | --- | --- |
| `Clase CashService` | Abre caja, agrupa pagos POS, calcula efectivo esperado y coordina el cierre con ventas concurrentes. | 10 |
| `constructor` | Inyecta las dependencias necesarias; NestJS proporciona estas instancias al construir la clase. | 13 |
| `list` | Consulta el listado correspondiente, filtrado o limitado según las reglas del servicio. | 16 |
| `open` | Crea una sesión con fondo inicial; el índice parcial de PostgreSQL rechaza una segunda caja abierta. | 18 |
| `report` | Agrupa pagos POS por método; suma solamente CASH al fondo inicial y compara contra el efectivo contado. | 23 |
| `get` | Obtiene el informe de caja con una lectura consistente RepeatableRead. | 32 |
| `close` | Bloquea la caja, rechaza cierre repetido, calcula el saldo esperado y guarda quién/cuándo cerró. | 34 |

### Código completo para leer junto a la explicación

```typescript
// Abre caja, agrupa pagos POS, calcula efectivo esperado y coordina el cierre con ventas concurrentes.

import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Actor } from '../common/security';
import { Prisma } from '../generated/prisma/client';
import { OpenCashDto, CloseCashDto } from './cash.dto';
// apertura, conciliación y cierre junto con las ventas de mostrador.

@Injectable()
export class CashService {
  
  constructor(private readonly prisma: PrismaService) {}
  // permite elegir caja sin transferir consultas al controlador.
  // Consulta los registros que permite este servicio.
  list() { return this.prisma.cashSession.findMany({ orderBy: { id: 'desc' }, take: 100 }); }
  // Crea una sesión con fondo inicial; el índice parcial de PostgreSQL rechaza una segunda caja abierta.
  open(dto: OpenCashDto, actor: Actor) {
    // Un índice único parcial en PostgreSQL impide dos cajas abiertas simultáneas.
    return this.prisma.cashSession.create({ data: { ...dto, openedById: actor.id } });
  }
  // Agrupa pagos POS por método; suma solamente CASH al fondo inicial y compara contra el efectivo contado.
  async report(tx: Prisma.TransactionClient, id: number) {
    const session = await tx.cashSession.findUnique({ where: { id } });
    if (!session) throw new NotFoundException('Caja no encontrada');
    const totals = await tx.payment.groupBy({ by: ['method'], where: { order: { cashSessionId: id, channel: 'POS', status: 'COMPLETED' } }, _sum: { amount: true }, _count: { _all: true } });
    const cash = totals.find(row => row.method === 'CASH')?._sum.amount ?? new Prisma.Decimal(0);
    const expected = session.expectedAmount ?? session.openingAmount.plus(cash);
    return { ...session, totalsByMethod: totals, expectedAmount: expected, difference: session.countedAmount?.minus(expected) ?? null };
  }
  // Obtiene el informe de caja con una lectura consistente RepeatableRead.
  async get(id: number) { return this.prisma.$transaction(tx => this.report(tx, id), { isolationLevel: 'RepeatableRead' }); }
  // Bloquea la caja, rechaza cierre repetido, calcula el saldo esperado y guarda quién/cuándo cerró.
  async close(id: number, dto: CloseCashDto, actor: Actor) {
    return this.prisma.$transaction(async tx => {
      // el corte no puede adelantarse a un cobro en curso.
      await tx.$queryRaw`SELECT id FROM cash_sessions WHERE id = ${id} FOR UPDATE`;
      const session = await tx.cashSession.findUnique({ where: { id } });
      if (!session) throw new NotFoundException();
      if (session.closedAt) throw new ConflictException('Caja ya cerrada');
      const report = await this.report(tx, id);
      await tx.cashSession.update({ where: { id }, data: { closedAt: new Date(), closedById: actor.id, countedAmount: dto.countedAmount, expectedAmount: report.expectedAmount } });
      return this.report(tx, id);
    });
  }
}
```

## src/catalog/catalog.controller.ts

Recibe solicitudes HTTP, valida parámetros con DTO/Pipes y delega reglas en servicios.

| Bloque o campo | Explicación | Línea del archivo |
| --- | --- | --- |
| `Clase ProductsController` | Recibe solicitudes HTTP, valida parámetros con DTO/Pipes y delega reglas en servicios. | 12 |
| `constructor` | Inyecta las dependencias necesarias; NestJS proporciona estas instancias al construir la clase. | 15 |
| `list` | Recibe datos de la ruta y delega list al servicio; los decoradores definen HTTP, documentación y permisos. | 17 |
| `internal` | Recibe datos de la ruta y delega list al servicio; los decoradores definen HTTP, documentación y permisos. | 20 |
| `get` | Recibe datos de la ruta y delega get al servicio; los decoradores definen HTTP, documentación y permisos. | 23 |
| `create` | Recibe datos de la ruta y delega create al servicio; los decoradores definen HTTP, documentación y permisos. | 26 |
| `update` | Recibe datos de la ruta y delega update al servicio; los decoradores definen HTTP, documentación y permisos. | 29 |
| `remove` | Recibe datos de la ruta y delega update al servicio; los decoradores definen HTTP, documentación y permisos. | 32 |
| `stock` | Recibe datos de la ruta y delega adjust al servicio; los decoradores definen HTTP, documentación y permisos. | 35 |
| `Clase CategoriesController` | Recibe solicitudes HTTP, valida parámetros con DTO/Pipes y delega reglas en servicios. | 39 |
| `constructor` | Inyecta las dependencias necesarias; NestJS proporciona estas instancias al construir la clase. | 42 |
| `list` | Recibe datos de la ruta y delega list al servicio; los decoradores definen HTTP, documentación y permisos. | 44 |
| `create` | Recibe datos de la ruta y delega create al servicio; los decoradores definen HTTP, documentación y permisos. | 47 |
| `update` | Recibe datos de la ruta y delega update al servicio; los decoradores definen HTTP, documentación y permisos. | 50 |
| `remove` | Recibe datos de la ruta y delega remove al servicio; los decoradores definen HTTP, documentación y permisos. | 53 |

### Código completo para leer junto a la explicación

```typescript
// Recibe solicitudes HTTP, valida parámetros con DTO/Pipes y delega reglas en servicios.

import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Actor, CurrentUser, Public, Roles } from '../common/security';
import { CategoriesService } from './categories.service';
import { CatalogService } from './catalog.service';
import { CatalogQuery, CategoryDto, ProductDto, StockDto, UpdateProductDto } from './catalog.dto';

// declaran rutas, permisos y DTOs; delegan reglas en el servicio.

@ApiTags('Catálogo') @Controller('products')
export class ProductsController {
  
  constructor(private readonly service: CatalogService) {}
  // Pasa los datos de esta ruta al método list del servicio.
  @Public() @Get() @ApiOperation({ summary: 'Catálogo público paginado, sin costos internos' })
  list(@Query() q: CatalogQuery) { return this.service.list(q); }
  // Pasa los datos de esta ruta al método list del servicio.
  @Get('internal') @Roles('ADMIN') @ApiBearerAuth() @ApiOperation({ summary: 'Catálogo administrativo con costos y productos inactivos' })
  internal(@Query() q: CatalogQuery) { return this.service.list(q, true); }
  // Pasa los datos de esta ruta al método get del servicio.
  @Public() @Get(':id') @ApiOperation({ summary: 'Consultar producto disponible en catálogo' })
  get(@Param('id', ParseIntPipe) id: number) { return this.service.get(id); }
  // Pasa los datos de esta ruta al método create del servicio.
  @Post() @Roles('ADMIN') @ApiBearerAuth() @ApiOperation({ summary: 'Crear repuesto con stock inicial cero' })
  create(@Body() dto: ProductDto) { return this.service.create(dto); }
  // Pasa los datos de esta ruta al método update del servicio.
  @Patch(':id') @Roles('ADMIN') @ApiBearerAuth() @ApiOperation({ summary: 'Editar repuesto; no modifica ventas anteriores' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) { return this.service.update(id, dto); }
  // Pasa los datos de esta ruta al método update del servicio.
  @Delete(':id') @Roles('ADMIN') @ApiBearerAuth() @ApiOperation({ summary: 'Retirar del catálogo preservando su historial' })
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.update(id, { active: false }); }
  // Pasa los datos de esta ruta al método adjust del servicio.
  @Post(':id/stock') @Roles('ADMIN') @ApiBearerAuth() @ApiOperation({ summary: 'Ajustar inventario con motivo y trazabilidad' })
  stock(@Param('id', ParseIntPipe) id: number, @Body() dto: StockDto, @CurrentUser() actor: Actor) { return this.service.adjust(id, dto, actor.id); }
}

@ApiTags('Categorías') @Controller('categories')
export class CategoriesController {
  
  constructor(private readonly service: CategoriesService) {}
  // Pasa los datos de esta ruta al método list del servicio.
  @Public() @Get() @ApiOperation({ summary: 'Listar categorías activas' })
  list() { return this.service.list(); }
  // Pasa los datos de esta ruta al método create del servicio.
  @Post() @Roles('ADMIN') @ApiBearerAuth() @ApiOperation({ summary: 'Crear categoría' })
  create(@Body() dto: CategoryDto) { return this.service.create(dto); }
  // Pasa los datos de esta ruta al método update del servicio.
  @Patch(':id') @Roles('ADMIN') @ApiBearerAuth() @ApiOperation({ summary: 'Renombrar categoría' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: CategoryDto) { return this.service.update(id, dto); }
  // Pasa los datos de esta ruta al método remove del servicio.
  @Delete(':id') @Roles('ADMIN') @ApiBearerAuth() @ApiOperation({ summary: 'Desactivar categoría y ocultarla del catálogo público' })
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
```

## src/catalog/catalog.dto.ts

Declara contratos de entrada, validadores y ejemplos Swagger. Un tipo TypeScript solo no valida un JSON recibido.

| Bloque o campo | Explicación | Línea del archivo |
| --- | --- | --- |
| `Clase CategoryDto` | DTO con validación de entradas. | 9 |
| `name` | Tipo string. Validaciones: @ApiProperty({ example: 'Frenos' }), @IsString(), @MinLength(2), @MaxLength(100) | 11 |
| `Clase ProductDto` | DTO con validación de entradas. | 14 |
| `categoryId` | Tipo number. Validaciones: @ApiProperty({ example: 1 }), @IsInt(), @Min(1) | 16 |
| `sku` | Tipo string. Validaciones: @ApiProperty({ example: 'FRE-001' }), @IsString(), @MinLength(1), @MaxLength(60) | 18 |
| `name` | Tipo string. Validaciones: @ApiProperty({ example: 'Pastillas de freno delanteras' }), @IsString(), @MinLength(2), @MaxLength(150) | 20 |
| `description` | Tipo string. Validaciones: @ApiPropertyOptional({ example: 'Juego de pastillas; verificar compatibilidad del vehículo' }), @IsOptional(), @IsString(), @MaxLength(2000) | 22 |
| `acquisitionCost` | Tipo number. Validaciones: @ApiProperty({ example: 125 }), @IsNumber({ maxDecimalPlaces: 2 }), @Min(0), @Max(99999999) | 24 |
| `salePrice` | Tipo number. Validaciones: @ApiProperty({ example: 195 }), @IsNumber({ maxDecimalPlaces: 2 }), @Min(0.01), @Max(99999999) | 26 |
| `Clase UpdateProductDto` | DTO con validación de entradas. | 29 |
| `active` | Tipo boolean. Validaciones: @ApiPropertyOptional(), @IsOptional(), @IsBoolean() | 31 |
| `Clase StockDto` | DTO con validación de entradas. | 34 |
| `delta` | Tipo number. Validaciones: @ApiProperty({ example: 10, description: 'Positivo agrega; negativo retira existencias' }), @IsInt(), @Min(-1000000), @Max(1000000), @NotEquals(0) | 36 |
| `reason` | Tipo string. Validaciones: @ApiProperty({ example: 'Ingreso por compra a proveedor' }), @IsString(), @MinLength(5), @MaxLength(500) | 38 |
| `Clase CatalogQuery` | DTO con validación de entradas. | 41 |
| `categoryId` | Tipo number. Validaciones: @ApiPropertyOptional(), @IsOptional(), @Type(() => Number), @IsInt(), @Min(1) | 43 |
| `search` | Tipo string. Validaciones: @ApiPropertyOptional(), @IsOptional(), @IsString(), @MaxLength(100) | 45 |

### Código completo para leer junto a la explicación

```typescript
// Declara contratos de entrada, validadores y ejemplos Swagger. Un tipo TypeScript solo no valida un JSON recibido.

import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength, NotEquals } from 'class-validator';
import { Type } from 'class-transformer';
import { PageDto } from '../common/dto';
// DTOs: los precios tienen dos decimales y las unidades son enteras.

export class CategoryDto {
  // Nombre del usuario o del registro.
  @ApiProperty({ example: 'Frenos' }) @IsString() @MinLength(2) @MaxLength(100) name: string;
}

export class ProductDto {
  // Categoría a la que pertenece el repuesto.
  @ApiProperty({ example: 1 }) @IsInt() @Min(1) categoryId: number;
  // Código único del repuesto.
  @ApiProperty({ example: 'FRE-001' }) @IsString() @MinLength(1) @MaxLength(60) sku: string;
  // Nombre del usuario o del registro.
  @ApiProperty({ example: 'Pastillas de freno delanteras' }) @IsString() @MinLength(2) @MaxLength(150) name: string;
  // Descripción opcional del repuesto.
  @ApiPropertyOptional({ example: 'Juego de pastillas; verificar compatibilidad del vehículo' }) @IsOptional() @IsString() @MaxLength(2000) description?: string;
  // Costo de compra; solo debe verlo el administrador.
  @ApiProperty({ example: 125 }) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(99999999) acquisitionCost: number;
  // Precio de venta usado para calcular el total.
  @ApiProperty({ example: 195 }) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0.01) @Max(99999999) salePrice: number;
}

export class UpdateProductDto extends PartialType(ProductDto) {
  // Indica si la cuenta o el registro sigue disponible.
  @ApiPropertyOptional() @IsOptional() @IsBoolean() active?: boolean;
}

export class StockDto {
  // Un número positivo agrega stock y uno negativo lo retira.
  @ApiProperty({ example: 10, description: 'Positivo agrega; negativo retira existencias' }) @IsInt() @Min(-1000000) @Max(1000000) @NotEquals(0) delta: number;
  // Motivo del ajuste de inventario.
  @ApiProperty({ example: 'Ingreso por compra a proveedor' }) @IsString() @MinLength(5) @MaxLength(500) reason: string;
}

export class CatalogQuery extends PageDto {
  // Categoría a la que pertenece el repuesto.
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) categoryId?: number;
  // Texto para buscar por nombre o código.
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) search?: string;
}
```

## src/catalog/catalog.module.ts

Registra controladores y servicios para que NestJS pueda construir sus dependencias.

| Bloque o campo | Explicación | Línea del archivo |
| --- | --- | --- |
| `Clase CatalogModule` | Registra controladores y servicios para que NestJS pueda construir sus dependencias. | 9 |

### Código completo para leer junto a la explicación

```typescript
// Registra controladores y servicios para que NestJS pueda construir sus dependencias.

import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CatalogService } from './catalog.service';
import { ProductsController, CategoriesController } from './catalog.controller';
// agrupa productos y sus categorías.

@Module({ providers: [CatalogService, CategoriesService], controllers: [ProductsController, CategoriesController] })
export class CatalogModule {}
```

## src/catalog/catalog.service.ts

Busca repuestos, oculta costos públicos, comprueba categorías y ajusta stock con su movimiento contable.

| Bloque o campo | Explicación | Línea del archivo |
| --- | --- | --- |
| `Clase CatalogService` | Busca repuestos, oculta costos públicos, comprueba categorías y ajusta stock con su movimiento contable. | 11 |
| `constructor` | Inyecta las dependencias necesarias; NestJS proporciona estas instancias al construir la clase. | 14 |
| `list` | Aplica filtros y paginación; la versión pública oculta costos y registros inactivos. | 16 |
| `get` | Busca el registro solicitado y responde con los campos permitidos. | 26 |
| `create` | Crea el registro usando el DTO validado y sus comprobaciones de negocio. | 32 |
| `update` | Aplica cambios permitidos por el DTO; comprueba propiedad o categoría según este servicio. | 37 |
| `category` | Comprueba que la categoría exista y esté activa antes de asociar un repuesto. | 42 |
| `adjust` | Actualiza stock de forma condicional y guarda el movimiento de auditoría dentro de la misma transacción. | 47 |

### Código completo para leer junto a la explicación

```typescript
// Busca repuestos, oculta costos públicos, comprueba categorías y ajusta stock con su movimiento contable.

import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CatalogQuery, ProductDto, StockDto, UpdateProductDto } from './catalog.dto';
import { Prisma } from '../generated/prisma/client';

// la selección explícita evita mostrar costos internos.
export const publicProduct = { id: true, sku: true, name: true, description: true, salePrice: true, stock: true, active: true, category: { select: { id: true, name: true } } } as const;

@Injectable()
export class CatalogService {
  
  constructor(private readonly prisma: PrismaService) {}
  // Aplica filtros y paginación; la versión pública oculta costos y registros inactivos.
  async list(q: CatalogQuery, internal = false) {
    const where: Prisma.ProductWhereInput = { ...(internal ? {} : { active: true, category: { active: true } }), categoryId: q.categoryId,
      ...(q.search ? { OR: [{ name: { contains: q.search, mode: 'insensitive' } }, { sku: { contains: q.search, mode: 'insensitive' } }] } : {}) };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({ where, select: { ...publicProduct, ...(internal ? { acquisitionCost: true } : {}) }, orderBy: { id: 'asc' }, skip: (q.page - 1) * q.limit, take: q.limit }),
      this.prisma.product.count({ where }),
    ]);
    return { data, total, page: q.page, limit: q.limit };
  }
  // Busca el registro solicitado y responde con los campos permitidos.
  async get(id: number) {
    const product = await this.prisma.product.findFirst({ where: { id, active: true, category: { active: true } }, select: publicProduct });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }
  // Crea el registro usando el DTO validado y sus comprobaciones de negocio.
  async create(dto: ProductDto) {
    await this.category(dto.categoryId);
    return this.prisma.product.create({ data: dto });
  }
  // Aplica cambios permitidos por el DTO; comprueba propiedad o categoría según este servicio.
  async update(id: number, dto: UpdateProductDto) {
    if (dto.categoryId) await this.category(dto.categoryId);
    return this.prisma.product.update({ where: { id }, data: dto });
  }
  // Comprueba que la categoría exista y esté activa antes de asociar un repuesto.
  private async category(id: number) {
    if (!(await this.prisma.category.findFirst({ where: { id, active: true } }))) throw new NotFoundException('Categoría no disponible');
  }
  // el stock y su movimiento de auditoría cambian juntos.
  // Actualiza stock de forma condicional y guarda el movimiento de auditoría dentro de la misma transacción.
  async adjust(id: number, dto: StockDto, actorId: number) {
    return this.prisma.$transaction(async tx => {
      const changed = await tx.product.updateMany({ where: { id, ...(dto.delta < 0 ? { stock: { gte: -dto.delta } } : {}) }, data: { stock: { increment: dto.delta } } });
      if (!changed.count) throw new ConflictException('Producto inexistente o stock insuficiente');
      await tx.inventoryMovement.create({ data: { productId: id, actorId, type: 'ADJUSTMENT', quantityDelta: dto.delta, reason: dto.reason } });
      return tx.product.findUniqueOrThrow({ where: { id } });
    });
  }
}
```

## src/catalog/categories.service.ts

Gestiona categorías y su desactivación sin eliminar el historial de productos.

| Bloque o campo | Explicación | Línea del archivo |
| --- | --- | --- |
| `Clase CategoriesService` | Gestiona categorías y su desactivación sin eliminar el historial de productos. | 8 |
| `constructor` | Inyecta las dependencias necesarias; NestJS proporciona estas instancias al construir la clase. | 11 |
| `list` | Aplica filtros y paginación; la versión pública oculta costos y registros inactivos. | 13 |
| `create` | Crea el registro usando el DTO validado y sus comprobaciones de negocio. | 15 |
| `update` | Aplica cambios permitidos por el DTO; comprueba propiedad o categoría según este servicio. | 17 |
| `remove` | Desactiva la categoría conservando sus relaciones e historial. | 19 |

### Código completo para leer junto a la explicación

```typescript
// Gestiona categorías y su desactivación sin eliminar el historial de productos.

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CategoryDto } from './catalog.dto';
// concentra consultas y bajas lógicas para conservar el historial.

@Injectable()
export class CategoriesService {
  
  constructor(private readonly prisma: PrismaService) {}
  // Aplica filtros y paginación; la versión pública oculta costos y registros inactivos.
  list() { return this.prisma.category.findMany({ where: { active: true }, orderBy: { name: 'asc' } }); }
  // Crea el registro usando el DTO validado y sus comprobaciones de negocio.
  create(dto: CategoryDto) { return this.prisma.category.create({ data: dto }); }
  // Aplica cambios permitidos por el DTO; comprueba propiedad o categoría según este servicio.
  update(id: number, dto: CategoryDto) { return this.prisma.category.update({ where: { id }, data: dto }); }
  // Desactiva la categoría conservando sus relaciones e historial.
  remove(id: number) { return this.prisma.category.update({ where: { id }, data: { active: false } }); }
}
```

## src/common/dto.ts

Valida page y limit para compartir paginación entre catálogo y pedidos.

| Bloque o campo | Explicación | Línea del archivo |
| --- | --- | --- |
| `Clase PageDto` | Valida page y limit para compartir paginación entre catálogo y pedidos. | 8 |

### Código completo para leer junto a la explicación

```typescript
// Valida page y limit para compartir paginación entre catálogo y pedidos.

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
// limita lecturas para evitar descargar todo el catálogo por accidente.

export class PageDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 }) @Type(() => Number) @IsInt() @Min(1)
  page = 1;
  @ApiPropertyOptional({ default: 20, maximum: 100 }) @Type(() => Number) @IsInt() @Min(1) @Max(100)
  limit = 20;
}
```

## src/common/http.ts

Convierte excepciones a respuestas JSON seguras y registra la duración de las solicitudes.

| Bloque o campo | Explicación | Línea del archivo |
| --- | --- | --- |
| `Clase HttpErrorFilter` | Convierte excepciones a respuestas JSON seguras y registra la duración de las solicitudes. | 10 |
| `catch` | Transforma errores de NestJS/Prisma a statusCode, message, path y timestamp; evita exponer detalles internos al cliente. | 14 |
| `Clase HttpLoggingInterceptor` | Convierte excepciones a respuestas JSON seguras y registra la duración de las solicitudes. | 37 |
| `intercept` | Mide el tiempo de la petición y registra método/ruta al finalizar, incluso cuando ocurre un error. | 41 |

### Código completo para leer junto a la explicación

```typescript
// Convierte excepciones a respuestas JSON seguras y registra la duración de las solicitudes.

import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Injectable, Logger, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Request, Response } from 'express';
import { finalize } from 'rxjs/operators';
import { Prisma } from '../generated/prisma/client';

// transforma conflictos conocidos y evita exponer SQL o secretos.

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger('Errores');
  // Transforma errores de NestJS/Prisma a statusCode, message, path y timestamp; evita exponer detalles internos al cliente.
  catch(error: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    let status = 500;
    let message: string | string[] = 'Error interno del servidor';
    if (error instanceof HttpException) {
      status = error.getStatus();
      const body = error.getResponse();
      message = typeof body === 'string' ? body : (body as { message?: string | string[] }).message ?? error.message;
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') { status = 409; message = 'Ya existe un registro con esos datos únicos'; }
      if (error.code === 'P2025') { status = 404; message = 'Registro no encontrado'; }
      if (error.code === 'P2003') { status = 409; message = 'La operación afecta una relación existente o inválida'; }
      if (error.code === 'P2034') { status = 409; message = 'Operación concurrente: vuelve a intentarlo'; }
    }
    if (status === 500) this.logger.error(error instanceof Error ? error.message : 'Error desconocido');
    res.status(status).json({ statusCode: status, message, path: req.path, timestamp: new Date().toISOString() });
  }
}

// registra también solicitudes fallidas, sin imprimir cuerpos ni tokens.

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');
  // Mide el tiempo de la petición y registra método/ruta al finalizar, incluso cuando ocurre un error.
  intercept(ctx: ExecutionContext, next: CallHandler) {
    const req = ctx.switchToHttp().getRequest<Request>();
    const start = Date.now();
    return next.handle().pipe(finalize(() => this.logger.log(`${req.method} ${req.path} ${Date.now() - start}ms`)));
  }
}
```

## src/common/openapi.ts

Describe respuestas OpenAPI: tipos, listas, importes y errores. Documentar una respuesta no ejecuta la operación.

| Bloque o campo | Explicación | Línea del archivo |
| --- | --- | --- |
| `documentResponses` | Agrega schemas, respuestas y errores a las operaciones Swagger; no modifica el comportamiento del servidor. | 20 |

### Código completo para leer junto a la explicación

```typescript
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
```

## src/common/security.ts

Define la identidad Actor, los decoradores propios y los Guards de autenticación y autorización.

| Bloque o campo | Explicación | Línea del archivo |
| --- | --- | --- |
| `Clase JwtGuard` | Define la identidad Actor, los decoradores propios y los Guards de autenticación y autorización. | 16 |
| `constructor` | Inyecta las dependencias necesarias; NestJS proporciona estas instancias al construir la clase. | 19 |
| `canActivate` | Decide si una solicitud puede continuar; lee metadata y, según el Guard, requiere JWT o un rol permitido. | 21 |
| `Clase RolesGuard` | Define la identidad Actor, los decoradores propios y los Guards de autenticación y autorización. | 29 |
| `constructor` | Inyecta las dependencias necesarias; NestJS proporciona estas instancias al construir la clase. | 32 |
| `canActivate` | Decide si una solicitud puede continuar; lee metadata y, según el Guard, requiere JWT o un rol permitido. | 34 |

### Código completo para leer junto a la explicación

```typescript
// Define la identidad Actor, los decoradores propios y los Guards de autenticación y autorización.

import { CanActivate, createParamDecorator, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '../generated/prisma/enums';

// identidad mínima adjuntada al request por Passport.
export interface Actor { id: number; name: string; email: string; role: UserRole }
export const Public = () => SetMetadata('public', true);
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): Actor => ctx.switchToHttp().getRequest().user);

// únicamente @Public permite omitir el token.

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  
  constructor(private readonly reflector: Reflector) { super(); }
  // Decide si una solicitud puede continuar; lee metadata y, según el Guard, requiere JWT o un rol permitido.
  canActivate(ctx: ExecutionContext) {
    if (this.reflector.getAllAndOverride<boolean>('public', [ctx.getHandler(), ctx.getClass()])) return true;
    return super.canActivate(ctx);
  }
}

// lee metadata del método y de la clase, en ese orden.

@Injectable()
export class RolesGuard implements CanActivate {
  
  constructor(private readonly reflector: Reflector) {}
  // Decide si una solicitud puede continuar; lee metadata y, según el Guard, requiere JWT o un rol permitido.
  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<UserRole[]>('roles', [ctx.getHandler(), ctx.getClass()]);
    if (!roles) return true;
    const user: Actor | undefined = ctx.switchToHttp().getRequest().user;
    return !!user && roles.includes(user.role);
  }
}
```

## src/main.ts

Punto de entrada: crea la aplicación NestJS, aplica la configuración común y escucha el puerto del servidor.

| Bloque o campo | Explicación | Línea del archivo |
| --- | --- | --- |
| `bootstrap` | Crea AppModule, configura la API y escucha PORT en todas las interfaces del servidor. | 10 |

### Código completo para leer junto a la explicación

```typescript
// Punto de entrada: crea la aplicación NestJS, aplica la configuración común y escucha el puerto del servidor.

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { configureApp } from './setup';
// escucha el puerto de Render o el configurado en .env local.
// Crea AppModule, configura la API y escucha PORT en todas las interfaces del servidor.
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  await app.listen(app.get(ConfigService).getOrThrow<number>('PORT'), '0.0.0.0');
}
bootstrap().catch(error => { console.error('No se pudo iniciar la API:', error.message); process.exitCode = 1; });
```

## src/mockpay/mockpay.client.ts

Envía solicitudes a la pasarela del curso con la clave privada; normaliza barras y limita el tiempo de espera.

| Bloque o campo | Explicación | Línea del archivo |
| --- | --- | --- |
| `singleSlash` | Usa URL y normaliza únicamente pathname; conserva https:// y evita el doble slash del proveedor. | 8 |
| `Clase MockPayClient` | Envía solicitudes a la pasarela del curso con la clave privada; normaliza barras y limita el tiempo de espera. | 14 |
| `constructor` | Inyecta las dependencias necesarias; NestJS proporciona estas instancias al construir la clase. | 17 |
| `request` | Construye la URL, agrega Bearer privado, llama fetch con timeout y convierte fallos externos a un error seguro. | 19 |
| `create` | Crea o recupera un intento sin duplicarlo; llama MockPay fuera de la transacción y guarda su URL normalizada. | 32 |
| `get` | Busca el registro solicitado y responde con los campos permitidos. | 34 |
| `processDemo` | Envía una tarjeta fija de prueba según el escenario; sus números se envían sin espacios. | 37 |

### Código completo para leer junto a la explicación

```typescript
// Envía solicitudes a la pasarela del curso con la clave privada; normaliza barras y limita el tiempo de espera.

import { BadGatewayException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// normaliza únicamente el path, conservando https://.
// Usa URL y normaliza únicamente pathname; conserva https:// y evita el doble slash del proveedor.
export function singleSlash(value: string): string {
  const url = new URL(value);
  url.pathname = url.pathname.replace(/\/{2,}/g, '/');
  return url.toString();
}

@Injectable()
export class MockPayClient {
  
  constructor(private readonly config: ConfigService) {}
  // Construye la URL, agrega Bearer privado, llama fetch con timeout y convierte fallos externos a un error seguro.
  async request(path: string, body?: unknown): Promise<any> {
    const key = this.config.get<string>('MOCKPAY_SECRET_KEY');
    if (!key) throw new ServiceUnavailableException('Configura MOCKPAY_SECRET_KEY en el backend');
    const base = this.config.get<string>('MOCKPAY_API_URL', 'https://mockpay-backend.onrender.com');
    const url = singleSlash(base.replace(/\/+$/, '') + '/api/v1/' + path.replace(/^\/+/, ''));
    try {
      // el secreto no aparece en respuestas ni en logs.
      const response = await fetch(url, { method: body ? 'POST' : 'GET', headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error('Respuesta externa inválida');
      return await response.json();
    } catch { throw new BadGatewayException('No se pudo confirmar la respuesta de MockPay; sincroniza antes de reintentar un cobro'); }
  }
  // Crea o recupera un intento sin duplicarlo; llama MockPay fuera de la transacción y guarda su URL normalizada.
  create(amount: number, metadata: Record<string, string>) { return this.request('payments', { amount, currency: 'GTQ', metadata }); }
  // Busca el registro solicitado y responde con los campos permitidos.
  get(id: string) { return this.request('payments/' + encodeURIComponent(id)); }
  // solo tarjetas ficticias del curso, normalizadas sin espacios.
  // Envía una tarjeta fija de prueba según el escenario; sus números se envían sin espacios.
  processDemo(id: string, scenario: 'SUCCESS' | 'INSUFFICIENT_FUNDS' | 'DECLINED') {
    const numbers = { SUCCESS: '4242424242424242', INSUFFICIENT_FUNDS: '4000000000000002', DECLINED: '5555555555554444' };
    return this.request('payments/' + encodeURIComponent(id) + '/process', { cardNumber: numbers[scenario], expiry: '12/30', cvc: '123', cardholderName: 'Cliente Demo', phone: '5555-0101', address: 'Dirección ficticia de prueba', zip: '01001' });
  }
}
```

## src/mockpay/mockpay.controller.ts

Publica las rutas de intención, consulta, sincronización, simulación local, webhook y redirecciones.

| Bloque o campo | Explicación | Línea del archivo |
| --- | --- | --- |
| `Clase WebhookDto` | Publica las rutas de intención, consulta, sincronización, simulación local, webhook y redirecciones. | 11 |
| `Clase DemoPaymentDto` | Publica las rutas de intención, consulta, sincronización, simulación local, webhook y redirecciones. | 25 |
| `Clase MockPayOrdersController` | Publica las rutas de intención, consulta, sincronización, simulación local, webhook y redirecciones. | 30 |
| `constructor` | Inyecta las dependencias necesarias; NestJS proporciona estas instancias al construir la clase. | 33 |
| `create` | Recibe datos de la ruta y delega create al servicio; los decoradores definen HTTP, documentación y permisos. | 35 |
| `latest` | Recibe datos de la ruta y delega latest al servicio; los decoradores definen HTTP, documentación y permisos. | 38 |
| `sync` | Recibe datos de la ruta y delega sync al servicio; los decoradores definen HTTP, documentación y permisos. | 41 |
| `demo` | Recibe datos de la ruta y delega demo al servicio; los decoradores definen HTTP, documentación y permisos. | 44 |
| `Clase MockPayWebhookController` | Publica las rutas de intención, consulta, sincronización, simulación local, webhook y redirecciones. | 48 |
| `constructor` | Inyecta las dependencias necesarias; NestJS proporciona estas instancias al construir la clase. | 51 |
| `webhook` | Recibe datos de la ruta y delega verify al servicio; los decoradores definen HTTP, documentación y permisos. | 53 |
| `returned` | Recibe datos de la ruta y delega returned al servicio; los decoradores definen HTTP, documentación y permisos. | 57 |
| `cancelled` | Recibe datos de la ruta y delega cancelled al servicio; los decoradores definen HTTP, documentación y permisos. | 60 |

### Código completo para leer junto a la explicación

```typescript
// Publica las rutas de intención, consulta, sincronización, simulación local, webhook y redirecciones.

import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Allow, IsIn, IsUUID } from 'class-validator';
import { Actor, CurrentUser, Public, Roles } from '../common/security';
import { MockPayService } from './mockpay.service';

// aceptar el contrato del proveedor; únicamente el ID inicia una consulta verificada.

class WebhookDto {
  @ApiProperty() @IsUUID() id: string;
  @Allow() event?: string; @Allow() amount?: number; @Allow() currency?: string;
  @Allow() status?: string; @Allow() failure_reason?: string | null;
  @Allow() metadata?: Record<string, unknown>; @Allow() created_at?: string;
}
const attemptSchema: any = { type: 'object', properties: {
  id: { type: 'string', format: 'uuid' }, orderId: { type: 'integer' }, gatewayId: { type: 'string', nullable: true },
  checkoutUrl: { type: 'string', nullable: true }, status: { type: 'string', enum: ['CREATING','PENDING','UNKNOWN','FAILED','SUCCEEDED'] },
  createdAt: { type: 'string', format: 'date-time' }, updatedAt: { type: 'string', format: 'date-time' },
  orderStatus: { type: 'string', description: 'Presente al sincronizar' }
} };
// el cliente elige una prueba, nunca envía datos de tarjetas reales.

class DemoPaymentDto {
  @ApiProperty({ enum: ['SUCCESS','INSUFFICIENT_FUNDS','DECLINED'], example: 'SUCCESS' })
  @IsIn(['SUCCESS','INSUFFICIENT_FUNDS','DECLINED']) scenario: 'SUCCESS' | 'INSUFFICIENT_FUNDS' | 'DECLINED';
}

@ApiTags('Pasarela MockPay') @ApiBearerAuth() @Roles('ADMIN', 'CUSTOMER') @Controller('orders')
export class MockPayOrdersController {
  
  constructor(private readonly service: MockPayService) {}
  // Pasa los datos de esta ruta al método create del servicio.
  @Post(':id/mockpay') @ApiOperation({ summary: 'Crear o recuperar checkout MockPay; cliente dueño o administrador' }) @ApiResponse({ status: 201, schema: attemptSchema })
  create(@Param('id', ParseIntPipe) id: number, @CurrentUser() actor: Actor) { return this.service.create(id, actor); }
  // Pasa los datos de esta ruta al método latest del servicio.
  @Get(':id/mockpay') @ApiOperation({ summary: 'Consultar último intento y enlace de cobro' }) @ApiResponse({ status: 200, schema: attemptSchema })
  latest(@Param('id', ParseIntPipe) id: number, @CurrentUser() actor: Actor) { return this.service.latest(id, actor); }
  // Pasa los datos de esta ruta al método sync del servicio.
  @Post(':id/mockpay/sync') @ApiOperation({ summary: 'Consultar resultado verificado; útil en localhost sin webhook público' }) @ApiResponse({ status: 201, schema: attemptSchema })
  sync(@Param('id', ParseIntPipe) id: number, @CurrentUser() actor: Actor) { return this.service.sync(id, actor); }
  // Pasa los datos de esta ruta al método demo del servicio.
  @Post(':id/mockpay/demo') @ApiOperation({ summary: 'Probar tarjeta ficticia del curso desde Swagger; solo desarrollo/pruebas' }) @ApiResponse({ status: 201, schema: attemptSchema })
  demo(@Param('id', ParseIntPipe) id: number, @Body() dto: DemoPaymentDto, @CurrentUser() actor: Actor) { return this.service.demo(id, dto.scenario, actor); }
}

@ApiTags('Pasarela MockPay') @Controller('mockpay')
export class MockPayWebhookController {
  
  constructor(private readonly service: MockPayService) {}
  // Pasa los datos de esta ruta al método verify del servicio.
  @Public() @Post('webhook') @ApiOperation({ summary: 'Notificación MockPay: reconsulta proveedor antes de aplicar pago' }) @ApiResponse({ status: 201, schema: attemptSchema })
  webhook(@Body() body: WebhookDto) { return this.service.verify(body.id); }
  // informar cómo consultar; nunca marcar pagado desde un query string.
  // Pasa los datos de esta ruta al método returned del servicio.
  @Public() @Get('return') @ApiOperation({ summary: 'Retorno del navegador; no confirma pagos' }) @ApiResponse({ status: 200, schema: { type: 'object', properties: { message: { type: 'string' }, transactionId: { type: 'string' } } } })
  returned(@Query('transaction_id') id: string) { return { message: 'Regresa a Swagger y sincroniza tu pedido para comprobar el pago.', transactionId: id }; }
  // Pasa los datos de esta ruta al método cancelled del servicio.
  @Public() @Get('cancel') @ApiOperation({ summary: 'Retorno por cancelación; el pedido conserva su estado' }) @ApiResponse({ status: 200, schema: { type: 'object', properties: { message: { type: 'string' } } } })
  cancelled() { return { message: 'Se cerró el checkout. Consulta el resultado del intento antes de cancelar el pedido.' }; }
}
```

## src/mockpay/mockpay.module.ts

Registra controladores y servicios para que NestJS pueda construir sus dependencias.

| Bloque o campo | Explicación | Línea del archivo |
| --- | --- | --- |
| `Clase MockPayModule` | Registra controladores y servicios para que NestJS pueda construir sus dependencias. | 10 |

### Código completo para leer junto a la explicación

```typescript
// Registra controladores y servicios para que NestJS pueda construir sus dependencias.

import { Module } from '@nestjs/common';
import { SalesModule } from '../sales/sales.module';
import { MockPayClient } from './mockpay.client';
import { MockPayService } from './mockpay.service';
import { MockPayOrdersController, MockPayWebhookController } from './mockpay.controller';
// separa comunicación externa, reglas de cobro y rutas de NestJS.

@Module({ imports: [SalesModule], providers: [MockPayClient, MockPayService], controllers: [MockPayOrdersController, MockPayWebhookController] })
export class MockPayModule {}
```

## src/mockpay/mockpay.service.ts

Correlaciona intentos y pedidos, confirma importe/moneda/metadata y registra un pago verificado una sola vez.

| Bloque o campo | Explicación | Línea del archivo |
| --- | --- | --- |
| `Clase MockPayService` | Correlaciona intentos y pedidos, confirma importe/moneda/metadata y registra un pago verificado una sola vez. | 14 |
| `constructor` | Inyecta las dependencias necesarias; NestJS proporciona estas instancias al construir la clase. | 17 |
| `create` | Crea o recupera un intento sin duplicarlo; llama MockPay fuera de la transacción y guarda su URL normalizada. | 19 |
| `latest` | Comprueba propiedad del pedido y devuelve el intento de pago más reciente. | 49 |
| `sync` | Consulta al proveedor usando el identificador guardado; no acepta el estado enviado por el cliente. | 56 |
| `demo` | Permite tarjetas ficticias solo en development/test; en production devuelve 403. | 62 |
| `verify` | Contrasta id, GTQ, importe y metadata con el pedido; registra pago CARD/PAID de forma idempotente. | 72 |

### Código completo para leer junto a la explicación

```typescript
// Relaciona intentos y pedidos, confirma importe/moneda/metadata y registra un pago verificado una sola vez.

import { BadGatewayException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { SalesService } from '../sales/sales.service';
import { Actor } from '../common/security';
import { Prisma } from '../generated/prisma/client';
import { MockPayClient, singleSlash } from './mockpay.client';

const active = ['CREATING', 'PENDING', 'UNKNOWN'];

@Injectable()
export class MockPayService {
  
  constructor(private readonly db: PrismaService, private readonly sales: SalesService, private readonly client: MockPayClient, private readonly config: ConfigService) {}
  // Crea o recupera un intento sin duplicarlo; llama MockPay fuera de la transacción y guarda su URL normalizada.
  async create(orderId: number, actor: Actor) {
    await this.sales.get(orderId, actor);
    const attempt = await this.db.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM orders WHERE id = ${orderId} FOR UPDATE`;
      const order = await tx.order.findUniqueOrThrow({ where: { id: orderId } });
      if (order.channel === 'POS' || order.status !== 'PENDING') throw new ConflictException('MockPay solo admite pedidos WEB/SOCIAL pendientes');
      const previous = await tx.gatewayAttempt.findFirst({ where: { orderId, status: { in: active } } });
      if (previous) return { ...previous, amount: order.total, fresh: false };
      const created = await tx.gatewayAttempt.create({ data: { id: randomUUID(), orderId } });
      return { ...created, amount: order.total, fresh: true };
    });
    if (!attempt.fresh) {
      if (!attempt.gatewayId) throw new ConflictException('Intención en creación o resultado incierto; no se genera otro cobro');
      return attempt;
    }
    try {
      // HTTP FUERA DE TRANSACCIÓN: no mantener bloqueadas filas mientras responde la pasarela.
      const remote = await this.client.create(attempt.amount.toNumber(), { order_id: String(orderId), attempt_id: attempt.id });
      if (typeof remote.id_transaccion !== 'string' || typeof remote.checkout_url !== 'string') throw new BadGatewayException('Contrato de MockPay inválido');
      const checkoutUrl = singleSlash(remote.checkout_url);
      const url = new URL(checkoutUrl);
      if (url.origin !== 'https://mockpay-frontend.vercel.app' || url.pathname !== '/checkout/' + remote.id_transaccion) throw new BadGatewayException('URL de checkout inesperada');
      return await this.db.gatewayAttempt.update({ where: { id: attempt.id }, data: { gatewayId: remote.id_transaccion, checkoutUrl, status: 'PENDING' } });
    } catch (error) {
      // INCERTIDUMBRE: un timeout no significa que la pasarela no creó la intención.
      await this.db.gatewayAttempt.update({ where: { id: attempt.id }, data: { status: 'UNKNOWN' } });
      throw error;
    }
  }
  // BLOQUE latest: Comprueba propiedad del pedido y devuelve el intento de pago más reciente.
  async latest(orderId: number, actor: Actor) {
    await this.sales.get(orderId, actor);
    const attempt = await this.db.gatewayAttempt.findFirst({ where: { orderId }, orderBy: { createdAt: 'desc' } });
    if (!attempt) throw new NotFoundException('Este pedido aún no tiene intento MockPay');
    return attempt;
  }
  // BLOQUE sync: Consulta al proveedor usando el identificador guardado; no acepta el estado enviado por el cliente.
  async sync(orderId: number, actor: Actor) {
    const attempt = await this.latest(orderId, actor);
    if (!attempt.gatewayId) throw new ConflictException('No hay identificador remoto confirmado; requiere revisión');
    return this.verify(attempt.gatewayId);
  }
  // BLOQUE demo: Permite tarjetas ficticias solo en development/test; en production devuelve 403.
  async demo(orderId: number, scenario: 'SUCCESS' | 'INSUFFICIENT_FUNDS' | 'DECLINED', actor: Actor) {
    if (!['development', 'test'].includes(this.config.get<string>('NODE_ENV', 'production'))) throw new ForbiddenException('La simulación desde Swagger está habilitada únicamente en desarrollo y pruebas');
    const attempt = await this.latest(orderId, actor);
    if (!attempt.gatewayId || attempt.status !== 'PENDING') throw new ConflictException('La simulación requiere un intento pendiente');
    // CONSULTA PREVIA: no procesar de nuevo si la pasarela ya terminó el cobro.
    const remote = await this.client.get(attempt.gatewayId);
    if (remote.status === 'PENDING') await this.client.processDemo(attempt.gatewayId, scenario);
    return this.verify(attempt.gatewayId);
  }
  // BLOQUE verify: Contrasta id, GTQ, importe y metadata con el pedido; registra pago CARD/PAID de forma idempotente.
  async verify(gatewayId: string) {
    const attempt = await this.db.gatewayAttempt.findUnique({ where: { gatewayId } });
    if (!attempt) throw new NotFoundException('Transacción no vinculada a esta tienda');
    const remote = await this.client.get(gatewayId);
    const order = await this.db.order.findUniqueOrThrow({ where: { id: attempt.orderId } });
    // VERIFICACIÓN: el webhook y la redirección nunca deciden importe, pedido ni estado.
    if (remote.id !== gatewayId || remote.currency !== 'GTQ' || remote.metadata?.order_id !== String(order.id) || remote.metadata?.attempt_id !== attempt.id ||
      !Number.isFinite(Number(remote.amount)) || !new Prisma.Decimal(String(remote.amount)).equals(order.total) ||
      !['PENDING', 'SUCCEEDED', 'FAILED'].includes(remote.status)) throw new BadGatewayException('Los datos verificados de MockPay no coinciden con el pedido');
    return this.db.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM orders WHERE id = ${order.id} FOR UPDATE`;
      const current = await tx.order.findUniqueOrThrow({ where: { id: order.id }, include: { payment: true } });
      if (remote.status === 'SUCCEEDED') {
        const reference = 'mockpay:' + gatewayId;
        if (current.payment && current.payment.reference !== reference) throw new ConflictException('Pedido ya cobrado por otra operación');
        if (!current.payment) {
          if (current.status !== 'PENDING') throw new ConflictException('Pedido no disponible para aplicar pago');
          // ATÓMICO: un webhook repetido no crea otro pago ni descuenta stock nuevamente.
          await tx.payment.create({ data: { orderId: order.id, recordedById: current.createdById, method: 'CARD', amount: current.total, reference } });
          await tx.order.update({ where: { id: order.id }, data: { status: 'PAID' } });
        }
      }
      const local = await tx.gatewayAttempt.findUniqueOrThrow({ where: { id: attempt.id } });
      // MONOTONÍA: una notificación atrasada no revierte un resultado exitoso.
      const status = local.status === 'SUCCEEDED' ? 'SUCCEEDED' : remote.status;
      const result = await tx.gatewayAttempt.update({ where: { id: attempt.id }, data: { status } });
      return { ...result, orderStatus: remote.status === 'SUCCEEDED' && !current.payment ? 'PAID' : current.status };
    });
  }
}
```

## src/prisma/prisma.service.ts

Conecta Prisma con PostgreSQL mediante adapter-pg y comparte el cliente entre módulos.

| Bloque o campo | Explicación | Línea del archivo |
| --- | --- | --- |
| `Clase PrismaService` | Conecta Prisma con PostgreSQL mediante adapter-pg y comparte el cliente entre módulos. | 10 |
| `constructor` | Inyecta las dependencias necesarias; NestJS proporciona estas instancias al construir la clase. | 13 |
| `onModuleInit` | Abre la conexión al iniciar el módulo de Prisma. | 17 |
| `onModuleDestroy` | Cierra la conexión al destruir la aplicación. | 19 |
| `Clase PrismaModule` | Conecta Prisma con PostgreSQL mediante adapter-pg y comparte el cliente entre módulos. | 22 |

### Código completo para leer junto a la explicación

```typescript
// Conecta Prisma con PostgreSQL mediante adapter-pg y comparte el cliente entre módulos.

import { Global, Injectable, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

// todos los módulos reutilizan este cliente y su pool.

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  
  constructor(config: ConfigService) {
    super({ adapter: new PrismaPg({ connectionString: config.getOrThrow<string>('DATABASE_URL') }) });
  }
  // Abre la conexión al iniciar el módulo de Prisma.
  async onModuleInit() { await this.$connect(); }
  // Cierra la conexión al destruir la aplicación.
  async onModuleDestroy() { await this.$disconnect(); }
}

@Global()
@Module({ providers: [PrismaService], exports: [PrismaService] })
export class PrismaModule {}
```

## src/sales/sales.controller.ts

Recibe solicitudes HTTP, valida parámetros con DTO/Pipes y delega reglas en servicios.

| Bloque o campo | Explicación | Línea del archivo |
| --- | --- | --- |
| `Clase CartsController` | Recibe solicitudes HTTP, valida parámetros con DTO/Pipes y delega reglas en servicios. | 10 |
| `constructor` | Inyecta las dependencias necesarias; NestJS proporciona estas instancias al construir la clase. | 13 |
| `create` | Recibe datos de la ruta y delega createCart al servicio; los decoradores definen HTTP, documentación y permisos. | 15 |
| `get` | Recibe datos de la ruta y delega cart al servicio; los decoradores definen HTTP, documentación y permisos. | 18 |
| `item` | Recibe datos de la ruta y delega setItem al servicio; los decoradores definen HTTP, documentación y permisos. | 21 |
| `remove` | Recibe datos de la ruta y delega removeItem al servicio; los decoradores definen HTTP, documentación y permisos. | 24 |
| `checkout` | Recibe datos de la ruta y delega checkout al servicio; los decoradores definen HTTP, documentación y permisos. | 27 |
| `Clase OrdersController` | Recibe solicitudes HTTP, valida parámetros con DTO/Pipes y delega reglas en servicios. | 31 |
| `constructor` | Inyecta las dependencias necesarias; NestJS proporciona estas instancias al construir la clase. | 34 |
| `list` | Recibe datos de la ruta y delega list al servicio; los decoradores definen HTTP, documentación y permisos. | 36 |
| `get` | Recibe datos de la ruta y delega get al servicio; los decoradores definen HTTP, documentación y permisos. | 39 |
| `pay` | Recibe datos de la ruta y delega pay al servicio; los decoradores definen HTTP, documentación y permisos. | 42 |
| `status` | Recibe datos de la ruta y delega transition al servicio; los decoradores definen HTTP, documentación y permisos. | 45 |
| `cancel` | Recibe datos de la ruta y delega cancel al servicio; los decoradores definen HTTP, documentación y permisos. | 48 |

### Código completo para leer junto a la explicación

```typescript
// Recibe solicitudes HTTP, valida parámetros con DTO/Pipes y delega reglas en servicios.

import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Actor, CurrentUser, Roles } from '../common/security';
import { CartDto, CartItemDto, CheckoutDto, OrdersQuery, OrderStatusDto, PaymentDto } from './sales.dto';
import { SalesService } from './sales.service';
// un mismo flujo prepara ventas POS, compras WEB y pedidos SOCIAL.

@ApiTags('Carritos y checkout') @ApiBearerAuth() @Controller('carts')
export class CartsController {
  
  constructor(private readonly service: SalesService) {}
  // Pasa los datos de esta ruta al método createCart del servicio.
  @Post() @ApiOperation({ summary: 'Abrir carrito según el canal permitido al usuario' })
  create(@Body() dto: CartDto, @CurrentUser() actor: Actor) { return this.service.createCart(dto, actor); }
  // Pasa los datos de esta ruta al método cart del servicio.
  @Get(':id') @ApiOperation({ summary: 'Consultar mi carrito' })
  get(@Param('id', ParseIntPipe) id: number, @CurrentUser() actor: Actor) { return this.service.cart(id, actor); }
  // Pasa los datos de esta ruta al método setItem del servicio.
  @Put(':id/items') @ApiOperation({ summary: 'Agregar producto o reemplazar su cantidad; no reserva stock' })
  item(@Param('id', ParseIntPipe) id: number, @Body() dto: CartItemDto, @CurrentUser() actor: Actor) { return this.service.setItem(id, dto, actor); }
  // Pasa los datos de esta ruta al método removeItem del servicio.
  @Delete(':id/items/:productId') @ApiOperation({ summary: 'Retirar producto del carrito abierto' })
  remove(@Param('id', ParseIntPipe) id: number, @Param('productId', ParseIntPipe) productId: number, @CurrentUser() actor: Actor) { return this.service.removeItem(id, productId, actor); }
  // Pasa los datos de esta ruta al método checkout del servicio.
  @Post(':id/checkout') @ApiOperation({ summary: 'Confirmar compra transaccional con clave de idempotencia' })
  checkout(@Param('id', ParseIntPipe) id: number, @Body() dto: CheckoutDto, @CurrentUser() actor: Actor) { return this.service.checkout(id, dto, actor); }
}

@ApiTags('Pedidos y logística') @ApiBearerAuth() @Controller('orders')
export class OrdersController {
  
  constructor(private readonly service: SalesService) {}
  // Pasa los datos de esta ruta al método list del servicio.
  @Get() @ApiOperation({ summary: 'Historial propio o cola administrativa filtrada por estado/canal/día' })
  list(@Query() q: OrdersQuery, @CurrentUser() actor: Actor) { return this.service.list(q, actor); }
  // Pasa los datos de esta ruta al método get del servicio.
  @Get(':id') @ApiOperation({ summary: 'Detalle y comprobante de pedido autorizado' })
  get(@Param('id', ParseIntPipe) id: number, @CurrentUser() actor: Actor) { return this.service.get(id, actor); }
  // Pasa los datos de esta ruta al método pay del servicio.
  @Post(':id/payment') @Roles('ADMIN') @ApiOperation({ summary: 'Registrar pago completo verificado de un pedido WEB/SOCIAL' })
  pay(@Param('id', ParseIntPipe) id: number, @Body() dto: PaymentDto, @CurrentUser() actor: Actor) { return this.service.pay(id, dto, actor); }
  // Pasa los datos de esta ruta al método transition del servicio.
  @Patch(':id/status') @Roles('ADMIN') @ApiOperation({ summary: 'Avanzar de pagado a en camino y después entregado' })
  status(@Param('id', ParseIntPipe) id: number, @Body() dto: OrderStatusDto) { return this.service.transition(id, dto.status); }
  // Pasa los datos de esta ruta al método cancel del servicio.
  @Post(':id/cancel') @Roles('ADMIN', 'CUSTOMER') @ApiOperation({ summary: 'Cancelar pedido pendiente sin pago y reponer stock una sola vez' })
  cancel(@Param('id', ParseIntPipe) id: number, @CurrentUser() actor: Actor) { return this.service.cancel(id, actor); }
}
```

## src/sales/sales.dto.ts

Declara contratos de entrada, validadores y ejemplos Swagger. Un tipo TypeScript solo no valida un JSON recibido.

| Bloque o campo | Explicación | Línea del archivo |
| --- | --- | --- |
| `Clase CartDto` | DTO con validación de entradas. | 9 |
| `channel` | Tipo SalesChannel. Validaciones: @ApiProperty({ enum: SalesChannel, example: 'WEB' }), @IsEnum(SalesChannel) | 11 |
| `Clase CartItemDto` | DTO con validación de entradas. | 14 |
| `productId` | Tipo number. Validaciones: @ApiProperty({ example: 1 }), @IsInt(), @Min(1) | 16 |
| `quantity` | Tipo number. Validaciones: @ApiProperty({ example: 2 }), @IsInt(), @Min(1), @Max(10000) | 18 |
| `Clase CheckoutDto` | DTO con validación de entradas. | 21 |
| `idempotencyKey` | Tipo string. Validaciones: @ApiProperty({ example: 'compra-demo-001', description: 'Clave única para reintentos de esta misma confirmación' }), @IsString(), @MinLength(8), @MaxLength(100) | 23 |
| `cashSessionId` | Tipo number. Validaciones: @ApiPropertyOptional({ description: 'Obligatorio en POS', example: 1 }), @IsOptional(), @IsInt(), @Min(1) | 25 |
| `paymentMethod` | Tipo PaymentMethod. Validaciones: @ApiPropertyOptional({ enum: PaymentMethod, description: 'Obligatorio en POS' }), @IsOptional(), @IsEnum(PaymentMethod) | 27 |
| `addressId` | Tipo number. Validaciones: @ApiPropertyOptional({ description: 'Dirección propia para compra WEB' }), @IsOptional(), @IsInt(), @Min(1) | 29 |
| `recipientName` | Tipo string. Validaciones: @ApiPropertyOptional({ description: 'Destinatario del pedido SOCIAL' }), @IsOptional(), @IsString(), @MinLength(2), @MaxLength(150) | 31 |
| `recipientPhone` | Tipo string. Validaciones: @ApiPropertyOptional(), @IsOptional(), @IsString(), @MinLength(5), @MaxLength(30) | 33 |
| `deliveryAddress` | Tipo string. Validaciones: @ApiPropertyOptional(), @IsOptional(), @IsString(), @MinLength(5), @MaxLength(500) | 35 |
| `deliveryReference` | Tipo string. Validaciones: @ApiPropertyOptional(), @IsOptional(), @IsString(), @MaxLength(500) | 37 |
| `Clase PaymentDto` | DTO con validación de entradas. | 40 |
| `method` | Tipo PaymentMethod. Validaciones: @ApiProperty({ enum: PaymentMethod }), @IsEnum(PaymentMethod) | 42 |
| `reference` | Tipo string. Validaciones: @ApiPropertyOptional(), @IsOptional(), @IsString(), @MaxLength(150) | 44 |
| `Clase OrderStatusDto` | DTO con validación de entradas. | 47 |
| `status` | Tipo 'IN_TRANSIT'  /  'DELIVERED'. Validaciones: @ApiProperty({ enum: ['IN_TRANSIT', 'DELIVERED'] }), @IsEnum({ IN_TRANSIT: 'IN_TRANSIT', DELIVERED: 'DELIVERED' }) | 49 |
| `Clase OrdersQuery` | DTO con validación de entradas. | 52 |
| `channel` | Tipo SalesChannel. Validaciones: @ApiPropertyOptional({ enum: SalesChannel }), @IsOptional(), @IsEnum(SalesChannel) | 54 |
| `status` | Tipo OrderStatus. Validaciones: @ApiPropertyOptional({ enum: OrderStatus }), @IsOptional(), @IsEnum(OrderStatus) | 56 |
| `date` | Tipo string. Validaciones: @ApiPropertyOptional({ example: '2026-09-29', description: 'Día comercial en Guatemala (UTC-6)' }), @IsOptional(), @Matches(/^\d{4}-\d{2}-\d{2}$/), @IsDateString() | 58 |

### Código completo para leer junto a la explicación

```typescript
// Declara contratos de entrada, validadores y ejemplos Swagger. Un tipo TypeScript solo no valida un JSON recibido.

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength, IsDateString, Matches } from 'class-validator';
import { SalesChannel, PaymentMethod, OrderStatus } from '../generated/prisma/enums';
import { PageDto } from '../common/dto';
// el canal determina permisos y si hace falta logística o caja.

export class CartDto {
  // Canal de venta: mostrador, web o redes sociales.
  @ApiProperty({ enum: SalesChannel, example: 'WEB' }) @IsEnum(SalesChannel) channel: SalesChannel;
}

export class CartItemDto {
  // Identificador del repuesto.
  @ApiProperty({ example: 1 }) @IsInt() @Min(1) productId: number;
  // Cantidad de unidades que se quieren comprar.
  @ApiProperty({ example: 2 }) @IsInt() @Min(1) @Max(10000) quantity: number;
}

export class CheckoutDto {
  // Esta clave permite repetir la confirmación sin crear otra compra.
  @ApiProperty({ example: 'compra-demo-001', description: 'Clave única para reintentos de esta misma confirmación' }) @IsString() @MinLength(8) @MaxLength(100) idempotencyKey: string;
  // Caja en la que se registra la venta de mostrador.
  @ApiPropertyOptional({ description: 'Obligatorio en POS', example: 1 }) @IsOptional() @IsInt() @Min(1) cashSessionId?: number;
  // Método de pago usado en la venta POS.
  @ApiPropertyOptional({ enum: PaymentMethod, description: 'Obligatorio en POS' }) @IsOptional() @IsEnum(PaymentMethod) paymentMethod?: PaymentMethod;
  // Dirección del cliente que se usará para enviar el pedido.
  @ApiPropertyOptional({ description: 'Dirección propia para compra WEB' }) @IsOptional() @IsInt() @Min(1) addressId?: number;
  // Nombre de quien recibirá el pedido.
  @ApiPropertyOptional({ description: 'Destinatario del pedido SOCIAL' }) @IsOptional() @IsString() @MinLength(2) @MaxLength(150) recipientName?: string;
  // Teléfono de quien recibirá el pedido.
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(5) @MaxLength(30) recipientPhone?: string;
  // Dirección de entrega del pedido.
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(5) @MaxLength(500) deliveryAddress?: string;
  // Referencia para encontrar la dirección de entrega.
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) deliveryReference?: string;
}

export class PaymentDto {
  // Forma de pago: efectivo, tarjeta o transferencia.
  @ApiProperty({ enum: PaymentMethod }) @IsEnum(PaymentMethod) method: PaymentMethod;
  // Referencia opcional para identificar la dirección o el pago.
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(150) reference?: string;
}

export class OrderStatusDto {
  // Estado permitido para esta operación.
  @ApiProperty({ enum: ['IN_TRANSIT', 'DELIVERED'] }) @IsEnum({ IN_TRANSIT: 'IN_TRANSIT', DELIVERED: 'DELIVERED' }) status: 'IN_TRANSIT' | 'DELIVERED';
}

export class OrdersQuery extends PageDto {
  // Canal de venta: mostrador, web o redes sociales.
  @ApiPropertyOptional({ enum: SalesChannel }) @IsOptional() @IsEnum(SalesChannel) channel?: SalesChannel;
  // Estado permitido para esta operación.
  @ApiPropertyOptional({ enum: OrderStatus }) @IsOptional() @IsEnum(OrderStatus) status?: OrderStatus;
  // Día de Guatemala que queremos consultar.
  @ApiPropertyOptional({ example: '2026-09-29', description: 'Día comercial en Guatemala (UTC-6)' }) @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) @IsDateString() date?: string;
}
```

## src/sales/sales.module.ts

Registra controladores y servicios para que NestJS pueda construir sus dependencias.

| Bloque o campo | Explicación | Línea del archivo |
| --- | --- | --- |
| `Clase SalesModule` | Registra controladores y servicios para que NestJS pueda construir sus dependencias. | 8 |

### Código completo para leer junto a la explicación

```typescript
// Registra controladores y servicios para que NestJS pueda construir sus dependencias.

import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CartsController, OrdersController } from './sales.controller';
// centraliza reglas compartidas por mostrador y web.

@Module({ providers: [SalesService], controllers: [CartsController, OrdersController], exports: [SalesService] })
export class SalesModule {}
```

## src/sales/sales.service.ts

Centraliza carritos, checkout, pedidos, pagos administrativos, estados y cancelación en transacciones.

| Bloque o campo | Explicación | Línea del archivo |
| --- | --- | --- |
| `Clase SalesService` | Centraliza carritos, checkout, pedidos, pagos administrativos, estados y cancelación en transacciones. | 15 |
| `constructor` | Inyecta las dependencias necesarias; NestJS proporciona estas instancias al construir la clase. | 18 |
| `ownCart` | Comprueba existencia, dueño y, cuando corresponde, estado OPEN del carrito. | 21 |
| `createCart` | Restringe el canal por rol y registra el dueño; todavía no reserva inventario. | 29 |
| `cart` | Comprueba propiedad y devuelve el carrito con productos seleccionados de forma segura. | 34 |
| `setItem` | Bloquea el carrito en transacción y crea o reemplaza la cantidad mediante upsert. | 39 |
| `removeItem` | Bloquea un carrito abierto y retira su línea sin modificar las existencias del producto. | 50 |
| `checkout` | Valida canal/dirección/caja, bloquea productos, calcula total con Decimal y guarda pedido, stock, movimientos y pago POS de forma atómica. | 60 |
| `list` | Filtra pedidos por dueño/rol, canal, estado y día UTC-6, con paginación. | 110 |
| `get` | Busca el pedido y comprueba permiso de dueño, cajero o administrador. | 124 |
| `pay` | Registra el importe completo del pedido pendiente WEB/SOCIAL; bloquea un cobro manual cuando MockPay aún tiene un intento activo. | 133 |
| `transition` | Solo permite PAID → IN_TRANSIT → DELIVERED mediante una actualización condicional. | 145 |
| `cancel` | Solo cancela pedidos pendientes sin pago ni intento activo; devuelve el stock una vez y registra movimientos de cancelación. | 154 |

### Código completo para leer junto a la explicación

```typescript
// Centraliza carritos, checkout, pedidos, pagos administrativos, estados y cancelación en transacciones.

import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { Actor } from '../common/security';
import { CartDto, CartItemDto, CheckoutDto, OrdersQuery, PaymentDto } from './sales.dto';
import { Prisma } from '../generated/prisma/client';

// no devuelve costos de adquisición ni hashes en tickets y carritos.
const cartView = { items: { include: { product: { select: { id: true, name: true, sku: true, salePrice: true, stock: true, active: true } } } } } as const;
const orderView = { items: { select: { id: true, productId: true, productName: true, quantity: true, unitPrice: true } }, payment: true } as const;


@Injectable()
export class SalesService {
  
  constructor(private readonly prisma: PrismaService) {}
  // ningún usuario modifica el carrito creado por otra persona.
  // Comprueba existencia, dueño y, cuando corresponde, estado OPEN del carrito.
  private async ownCart(tx: Prisma.TransactionClient, id: number, actor: Actor, open = false) {
    const cart = await tx.cart.findUnique({ where: { id } });
    if (!cart) throw new NotFoundException('Carrito no encontrado');
    if (cart.createdById !== actor.id) throw new ForbiddenException('Carrito ajeno');
    if (open && cart.status !== 'OPEN') throw new ConflictException('El carrito ya fue cerrado');
    return cart;
  }
  // Restringe el canal por rol y registra el dueño; todavía no reserva inventario.
  createCart(dto: CartDto, actor: Actor) {
    if ((actor.role === 'CUSTOMER' && dto.channel !== 'WEB') || (actor.role === 'CASHIER' && dto.channel !== 'POS') || (actor.role === 'ADMIN' && dto.channel === 'WEB')) throw new ForbiddenException('Canal no permitido para este rol');
    return this.prisma.cart.create({ data: { channel: dto.channel, createdById: actor.id, customerId: actor.role === 'CUSTOMER' ? actor.id : null } });
  }
  // Comprueba propiedad y devuelve el carrito con productos seleccionados de forma segura.
  async cart(id: number, actor: Actor) {
    await this.ownCart(this.prisma, id, actor);
    return this.prisma.cart.findUniqueOrThrow({ where: { id }, include: cartView });
  }
  // Bloquea el carrito en transacción y crea o reemplaza la cantidad mediante upsert.
  async setItem(id: number, dto: CartItemDto, actor: Actor) {
    return this.prisma.$transaction(async tx => {
      // evita que se edite el carrito mientras se confirma la compra.
      await tx.$queryRaw`SELECT id FROM carts WHERE id = ${id} FOR UPDATE`;
      await this.ownCart(tx, id, actor, true);
      if (!(await tx.product.findFirst({ where: { id: dto.productId, active: true, category: { active: true } } }))) throw new NotFoundException('Producto no disponible');
      await tx.cartItem.upsert({ where: { cartId_productId: { cartId: id, productId: dto.productId } }, create: { cartId: id, ...dto }, update: { quantity: dto.quantity } });
      return tx.cart.findUniqueOrThrow({ where: { id }, include: cartView });
    });
  }
  // BLOQUE removeItem: Bloquea un carrito abierto y retira su línea sin modificar las existencias del producto.
  async removeItem(id: number, productId: number, actor: Actor) {
    return this.prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM carts WHERE id = ${id} FOR UPDATE`;
      await this.ownCart(tx, id, actor, true);
      await tx.cartItem.deleteMany({ where: { cartId: id, productId } });
      return tx.cart.findUniqueOrThrow({ where: { id }, include: cartView });
    });
  }
  // CONFIRMACIÓN ATÓMICA: pedido + detalles + stock + movimientos + pago POS.
  // BLOQUE checkout: Valida canal/dirección/caja, bloquea productos, calcula total con Decimal y guarda pedido, stock, movimientos y pago POS de forma atómica.
  async checkout(id: number, dto: CheckoutDto, actor: Actor) {
    return this.prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM carts WHERE id = ${id} FOR UPDATE`;
      const cart = await this.ownCart(tx, id, actor);
      const previous = await tx.order.findUnique({ where: { idempotencyKey: dto.idempotencyKey }, include: orderView });
      if (previous) {
        if (previous.createdById !== actor.id || previous.cartId !== id) throw new ConflictException('Clave de confirmación ya utilizada');
        return previous;
      }
      if (cart.status !== 'OPEN') throw new ConflictException('Carrito ya confirmado');
      const lines = await tx.cartItem.findMany({ where: { cartId: id }, orderBy: { productId: 'asc' } });
      if (!lines.length) throw new BadRequestException('El carrito está vacío');
      let delivery: { recipientName?: string; recipientPhone?: string; deliveryAddress?: string; deliveryReference?: string | null } = {};
      if (cart.channel === 'POS') {
        if (!dto.cashSessionId || !dto.paymentMethod) throw new BadRequestException('POS requiere caja abierta y método de pago');
        // El cierre toma el mismo bloqueo: nunca se cobra sobre una caja cerrada.
        await tx.$queryRaw`SELECT id FROM cash_sessions WHERE id = ${dto.cashSessionId} FOR UPDATE`;
        const session = await tx.cashSession.findUnique({ where: { id: dto.cashSessionId } });
        if (!session || session.closedAt) throw new ConflictException('Caja no disponible');
      } else if (cart.channel === 'WEB') {
        if (!dto.addressId) throw new BadRequestException('Selecciona una dirección propia');
        const address = await tx.address.findFirst({ where: { id: dto.addressId, userId: actor.id } });
        if (!address) throw new ForbiddenException('Dirección no disponible para este usuario');
        delivery = { recipientName: address.recipientName, recipientPhone: address.phone, deliveryAddress: address.addressLine, deliveryReference: address.reference };
      } else {
        if (!dto.recipientName || !dto.recipientPhone || !dto.deliveryAddress) throw new BadRequestException('Pedido social requiere destinatario, teléfono y dirección');
        delivery = { recipientName: dto.recipientName, recipientPhone: dto.recipientPhone, deliveryAddress: dto.deliveryAddress, deliveryReference: dto.deliveryReference };
      }
      const items: { productId: number; productName: string; quantity: number; unitPrice: Prisma.Decimal; unitCost: Prisma.Decimal }[] = [];
      let total = new Prisma.Decimal(0);
      for (const line of lines) {
        // Ordenar por producto reduce deadlocks entre carritos con varios artículos.
        await tx.$queryRaw`SELECT id FROM products WHERE id = ${line.productId} FOR UPDATE`;
        const product = await tx.product.findFirst({ where: { id: line.productId, active: true, category: { active: true } } });
        if (!product || product.stock < line.quantity) throw new ConflictException(`Stock insuficiente para producto ${line.productId}`);
        const changed = await tx.product.updateMany({ where: { id: product.id, stock: { gte: line.quantity } }, data: { stock: { decrement: line.quantity } } });
        if (!changed.count) throw new ConflictException('Inventario modificado por otra venta');
        total = total.plus(product.salePrice.mul(line.quantity));
        items.push({ productId: product.id, productName: product.name, quantity: line.quantity, unitPrice: product.salePrice, unitCost: product.acquisitionCost });
      }
      const order = await tx.order.create({ data: { receiptNumber: `REP-${randomUUID()}`, idempotencyKey: dto.idempotencyKey, cartId: id, customerId: cart.customerId,
        createdById: actor.id, channel: cart.channel, status: cart.channel === 'POS' ? 'COMPLETED' : 'PENDING', cashSessionId: cart.channel === 'POS' ? dto.cashSessionId : null,
        total, ...delivery, items: { create: items } } });
      await tx.inventoryMovement.createMany({ data: items.map(item => ({ productId: item.productId, orderId: order.id, actorId: actor.id, type: 'SALE' as const, quantityDelta: -item.quantity, reason: `Venta ${order.receiptNumber}` })) });
      if (cart.channel === 'POS') await tx.payment.create({ data: { orderId: order.id, recordedById: actor.id, method: dto.paymentMethod!, amount: total } });
      await tx.cart.update({ where: { id }, data: { status: 'CONVERTED' } });
      return tx.order.findUniqueOrThrow({ where: { id: order.id }, include: orderView });
    }, { timeout: 15000 });
  }
  // BLOQUE list: Filtra pedidos por dueño/rol, canal, estado y día UTC-6, con paginación.
  async list(q: OrdersQuery, actor: Actor) {
    const where: Prisma.OrderWhereInput = { channel: q.channel, status: q.status };
    if (actor.role === 'CUSTOMER') where.customerId = actor.id;
    if (actor.role === 'CASHIER') { where.channel = 'POS'; where.createdById = actor.id; }
    if (q.date) {
      const start = new Date(`${q.date}T00:00:00-06:00`);
      where.createdAt = { gte: start, lt: new Date(start.getTime() + 86400000) };
    }
    const [data, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({ where, include: orderView, orderBy: { id: 'desc' }, skip: (q.page - 1) * q.limit, take: q.limit }), this.prisma.order.count({ where }),
    ]);
    return { data, total, page: q.page, limit: q.limit };
  }
  // BLOQUE get: Busca el pedido y comprueba permiso de dueño, cajero o administrador.
  async get(id: number, actor: Actor) {
    const order = await this.prisma.order.findUnique({ where: { id }, include: orderView });
    if (!order) throw new NotFoundException('Pedido no encontrado');
    if (actor.role === 'CUSTOMER' && order.customerId !== actor.id) throw new ForbiddenException('Pedido ajeno');
    if (actor.role === 'CASHIER' && (order.channel !== 'POS' || order.createdById !== actor.id)) throw new ForbiddenException('Pedido no permitido');
    return order;
  }
  // COBRO WEB/SOCIAL: registro administrativo; el cliente no puede declararse pagado.
  // BLOQUE pay: Registra el importe completo del pedido pendiente WEB/SOCIAL; bloquea un cobro manual cuando MockPay aún tiene un intento activo.
  async pay(id: number, dto: PaymentDto, actor: Actor) {
    return this.prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM orders WHERE id = ${id} FOR UPDATE`;
      const order = await tx.order.findUnique({ where: { id } });
      if (!order) throw new NotFoundException();
      if (order.channel === 'POS' || order.status !== 'PENDING') throw new ConflictException('El pedido no admite este pago');
      if (await tx.gatewayAttempt.findFirst({ where: { orderId: id, status: { in: ['CREATING', 'PENDING', 'UNKNOWN'] } } })) throw new ConflictException('Hay un cobro MockPay activo; sincroniza su resultado antes de registrar otro pago');
      await tx.payment.create({ data: { orderId: id, recordedById: actor.id, method: dto.method, reference: dto.reference, amount: order.total } });
      return tx.order.update({ where: { id }, data: { status: 'PAID' }, include: orderView });
    });
  }
  // BLOQUE transition: Solo permite PAID → IN_TRANSIT → DELIVERED mediante una actualización condicional.
  async transition(id: number, status: 'IN_TRANSIT' | 'DELIVERED') {
    return this.prisma.$transaction(async tx => {
      const changed = await tx.order.updateMany({ where: { id, channel: { in: ['WEB', 'SOCIAL'] }, status: status === 'IN_TRANSIT' ? 'PAID' : 'IN_TRANSIT' }, data: { status } });
      if (!changed.count) throw new ConflictException('Transición de estado no permitida');
      return tx.order.findUniqueOrThrow({ where: { id }, include: orderView });
    });
  }
  // CANCELACIÓN: solo pendientes sin pago; repetirla nunca repone stock dos veces.
  // BLOQUE cancel: Solo cancela pedidos pendientes sin pago ni intento activo; devuelve el stock una vez y registra movimientos de cancelación.
  async cancel(id: number, actor: Actor) {
    await this.get(id, actor);
    return this.prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM orders WHERE id = ${id} FOR UPDATE`;
      const order = await tx.order.findUniqueOrThrow({ where: { id }, include: { items: { orderBy: { productId: 'asc' } }, payment: true } });
      if (order.status === 'CANCELLED') return tx.order.findUniqueOrThrow({ where: { id }, include: orderView });
      if (order.channel === 'POS' || order.status !== 'PENDING' || order.payment) throw new ConflictException('Solo se cancelan pedidos pendientes sin pago');
      if (await tx.gatewayAttempt.findFirst({ where: { orderId: id, status: { in: ['CREATING', 'PENDING', 'UNKNOWN'] } } })) throw new ConflictException('Hay un cobro MockPay activo; sincroniza antes de cancelar');
      for (const line of order.items) {
        await tx.product.update({ where: { id: line.productId }, data: { stock: { increment: line.quantity } } });
        await tx.inventoryMovement.create({ data: { productId: line.productId, orderId: id, actorId: actor.id, type: 'CANCELLATION', quantityDelta: line.quantity, reason: 'Cancelación de pedido pendiente' } });
      }
      return tx.order.update({ where: { id }, data: { status: 'CANCELLED' }, include: orderView });
    });
  }
}
```

## src/setup.ts

Configura prefijo /api, Helmet, CORS, validación global, filtro de errores, registro HTTP y Swagger.

| Bloque o campo | Explicación | Línea del archivo |
| --- | --- | --- |
| `configureApp` | Instala el pipeline global de HTTP y genera la documentación Swagger. | 12 |

### Código completo para leer junto a la explicación

```typescript
// Configura prefijo /api, Helmet, CORS, validación global, filtro de errores, registro HTTP y Swagger.

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { documentResponses } from './common/openapi';
import { HttpErrorFilter, HttpLoggingInterceptor } from './common/http';

// la misma configuración se usa en producción y pruebas.
// Instala el pipeline global de HTTP y genera la documentación Swagger.
export function configureApp(app: INestApplication) {
  const config = app.get(ConfigService);
  app.setGlobalPrefix('api');
  app.use(helmet());
  const origins = config.get<string>('CORS_ORIGINS', '').split(',').map(s => s.trim()).filter(Boolean);
  app.enableCors({ origin: origins, credentials: false });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalFilters(new HttpErrorFilter());
  app.useGlobalInterceptors(new HttpLoggingInterceptor());
  const swagger = new DocumentBuilder().setTitle('Repuestos — POS & E-commerce').setDescription('API del proyecto final. Moneda GTQ. Autenticación Passport/JWT. El envío se paga directamente al transportista y no forma parte del sistema.').setVersion('1.0.0').addBearerAuth().build();
  const document = SwaggerModule.createDocument(app, swagger);
  documentResponses(document);
  SwaggerModule.setup('api/docs', app, document, { jsonDocumentUrl: 'api/docs-json', swaggerOptions: { persistAuthorization: true } });
  app.enableShutdownHooks();
}
```

## test/e2e.cjs

Pruebas integradas con NestJS, HTTP y PostgreSQL real en una base separada terminada en _test.

### Código completo para leer junto a la explicación

```javascript
// Pruebas integradas con NestJS, HTTP y PostgreSQL real en una base separada terminada en _test.

// ejecutan HTTP, Guards, DTOs, Prisma y PostgreSQL juntos.
// Solo permiten una base cuyo nombre termine en _test; nunca usan datos de producción.
require('reflect-metadata');
require('dotenv').config({ quiet: true });
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { hash } = require('bcryptjs');
const testUrl = process.env.TEST_DATABASE_URL;
if (!testUrl || !new URL(testUrl).pathname.endsWith('_test')) throw new Error('Define TEST_DATABASE_URL con una base dedicada terminada en _test');
process.env.DATABASE_URL = testUrl;
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET ||= 'test-secret-only-never-use-in-production-123';
// fijar la conexión de pruebas antes de importar ConfigModule.
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/app.module');
const { configureApp } = require('../dist/setup');
const { PrismaService } = require('../dist/prisma/prisma.service');

test('POS y e-commerce: reglas completas contra PostgreSQL', async t => {
  const app = await NestFactory.create(AppModule, { logger: false });
  configureApp(app);
  await app.listen(0, '127.0.0.1');
  const db = app.get(PrismaService);
  const base = await app.getUrl();
  try {
    // Limpieza exclusiva del entorno de pruebas, validado antes de arrancar.
    await db.$executeRawUnsafe('TRUNCATE gateway_attempts, inventory_movements, payments, order_items, orders, cart_items, carts, addresses, cash_sessions, products, categories, users RESTART IDENTITY CASCADE');
    const password = 'PruebaSegura123!';
    const admin = await db.user.create({ data: { name: 'Admin Test', email: 'admin@test.local', passwordHash: await hash(password, 10), role: 'ADMIN' } });
    async function req(method, path, body, token, expected) {
      const res = await fetch(base + '/api' + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
      const json = await res.json();
      if (expected) assert.equal(res.status, expected, `${method} ${path}: ${JSON.stringify(json)}`);
      return { status: res.status, body: json };
    }
    const login = async email => (await req('POST', '/auth/login', { email, password }, null, 200)).body.accessToken;
    const a = await login('admin@test.local');
    let c, c2, cashier, category, product, second, address, session;
    await t.test('Registro público no permite elevar privilegios y errores HTTP son claros', async () => {
      await req('POST', '/auth/register', { name: 'Intruso', email: 'bad@test.local', password, role: 'ADMIN' }, null, 400);
      await req('POST', '/auth/register', { name: 'Cliente Test', email: 'customer@test.local', password }, null, 201);
      await req('POST', '/auth/register', { name: 'Cliente Test', email: 'customer@test.local', password }, null, 409);
      await req('POST', '/auth/register', { name: 'Otro Cliente', email: 'other@test.local', password }, null, 201);
      c = await login('customer@test.local'); c2 = await login('other@test.local');
      await req('GET', '/users', undefined, null, 401);
      await req('GET', '/users', undefined, c, 403);
      await req('POST', '/users', { name: 'Cajero Test', email: 'cashier@test.local', password, role: 'CASHIER' }, a, 201);
      cashier = await login('cashier@test.local');
    });
    await t.test('Catálogo: valida dinero, protege costos y registra stock', async () => {
      category = (await req('POST', '/categories', { name: 'Frenos Test' }, a, 201)).body;
      const dto = { categoryId: category.id, sku: 'TEST-001', name: 'Pastillas Test', acquisitionCost: 10, salePrice: 25.50 };
      await req('POST', '/products', { ...dto, salePrice: -5 }, a, 400);
      product = (await req('POST', '/products', dto, a, 201)).body;
      second = (await req('POST', '/products', { ...dto, sku: 'TEST-002', name: 'Filtro Test', salePrice: 10 }, a, 201)).body;
      await req('POST', `/products/${product.id}/stock`, { delta: 10, reason: 'Carga inicial de prueba' }, a, 201);
      await req('POST', `/products/${second.id}/stock`, { delta: 1, reason: 'Carga inicial de prueba' }, a, 201);
      const pub = (await req('GET', '/products', undefined, null, 200)).body;
      assert.equal(pub.total, 2); assert.equal(JSON.stringify(pub).includes('acquisitionCost'), false);
      await req('GET', '/products/internal', undefined, c, 403);
      await req('GET', '/products?page=0', undefined, null, 400);
      await req('PATCH', `/products/${product.id}`, { salePrice: 25.50 }, a, 200);
      await req('GET', '/products/999999', undefined, null, 404);
    });
    await t.test('Direcciones y carritos pertenecen al usuario', async () => {
      address = (await req('POST', '/addresses', { recipientName: 'Cliente Test', phone: '5555-0101', addressLine: 'Dirección de prueba zona 1' }, c, 201)).body;
      await req('PATCH', `/addresses/${address.id}`, { phone: '5555-0999' }, c2, 403);
      await req('POST', '/carts', { channel: 'POS' }, c, 403);
    });
    async function cart(token, channel, entries) {
      const x = (await req('POST', '/carts', { channel }, token, 201)).body;
      for (const [productId, quantity] of entries) await req('PUT', `/carts/${x.id}/items`, { productId, quantity }, token, 200);
      return x;
    }
    let webOrder;
    await t.test('Checkout conserva precio, valida propiedad y reintenta sin duplicar', async () => {
      const x = await cart(c, 'WEB', [[product.id, 2]]);
      await req('GET', `/carts/${x.id}`, undefined, c2, 403);
      const dto = { idempotencyKey: 'test-web-0001', addressId: address.id };
      webOrder = (await req('POST', `/carts/${x.id}/checkout`, dto, c, 201)).body;
      assert.equal(Number(webOrder.total), 51);
      assert.equal(JSON.stringify(webOrder).includes('unitCost'), false);
      assert.equal((await db.product.findUnique({ where: { id: product.id } })).stock, 8);
      const retry = (await req('POST', `/carts/${x.id}/checkout`, dto, c, 201)).body;
      assert.equal(retry.id, webOrder.id);
      assert.equal((await db.product.findUnique({ where: { id: product.id } })).stock, 8);
      await req('PUT', `/carts/${x.id}/items`, { productId: product.id, quantity: 1 }, c, 409);
      await req('GET', `/orders/${webOrder.id}`, undefined, c2, 403);
      await req('PATCH', `/products/${product.id}`, { salePrice: 30 }, a, 200);
      const historic = (await req('GET', `/orders/${webOrder.id}`, undefined, c, 200)).body;
      assert.equal(Number(historic.items[0].unitPrice), 25.50);
    });
    await t.test('Una línea sin stock revierte todos los descuentos y el pedido', async () => {
      const x = await cart(c, 'WEB', [[product.id, 1], [second.id, 5]]);
      await req('POST', `/carts/${x.id}/checkout`, { idempotencyKey: 'test-rollback-001', addressId: address.id }, c, 409);
      assert.equal((await db.product.findUnique({ where: { id: product.id } })).stock, 8);
      assert.equal(await db.order.count({ where: { cartId: x.id } }), 0);
    });
    await t.test('Dos compras simultáneas de la última unidad: solo una gana', async () => {
      const x = await cart(c, 'WEB', [[second.id, 1]]); const y = await cart(c, 'WEB', [[second.id, 1]]);
      const results = await Promise.all([req('POST', `/carts/${x.id}/checkout`, { idempotencyKey: 'race-last-one-a', addressId: address.id }, c), req('POST', `/carts/${y.id}/checkout`, { idempotencyKey: 'race-last-one-b', addressId: address.id }, c)]);
      assert.deepEqual(results.map(r => r.status).sort(), [201, 409]);
      assert.equal((await db.product.findUnique({ where: { id: second.id } })).stock, 0);
    });
    await t.test('Cancelación repetida repone unidades una sola vez', async () => {
      await req('POST', `/orders/${webOrder.id}/cancel`, {}, c, 201);
      await req('POST', `/orders/${webOrder.id}/cancel`, {}, c, 201);
      assert.equal((await db.product.findUnique({ where: { id: product.id } })).stock, 10);
    });
    await t.test('Pago y logística: impide salto de estados y pago por cliente', async () => {
      const x = await cart(c, 'WEB', [[product.id, 1]]);
      const o = (await req('POST', `/carts/${x.id}/checkout`, { idempotencyKey: 'test-logistics-001', addressId: address.id }, c, 201)).body;
      await req('PATCH', `/orders/${o.id}/status`, { status: 'DELIVERED' }, a, 409);
      await req('POST', `/orders/${o.id}/payment`, { method: 'TRANSFER' }, c, 403);
      await req('POST', `/orders/${o.id}/payment`, { method: 'TRANSFER' }, a, 201);
      await req('POST', `/orders/${o.id}/payment`, { method: 'TRANSFER' }, a, 409);
      await req('POST', `/orders/${o.id}/cancel`, {}, c, 409);
      await req('PATCH', `/orders/${o.id}/status`, { status: 'IN_TRANSIT' }, a, 200);
      await req('PATCH', `/orders/${o.id}/status`, { status: 'DELIVERED' }, a, 200);
      await req('PATCH', `/addresses/${address.id}`, { addressLine: 'Otra dirección modificada' }, c, 200);
      assert.equal((await req('GET', `/orders/${o.id}`, undefined, c, 200)).body.deliveryAddress, 'Dirección de prueba zona 1');
    });
    await t.test('Pedidos de redes sociales tienen logística sin tarifa de envío', async () => {
      const x = await cart(a, 'SOCIAL', [[product.id, 1]]);
      const o = (await req('POST', `/carts/${x.id}/checkout`, { idempotencyKey: 'social-test-001', recipientName: 'Comprador Social', recipientPhone: '5555-0202', deliveryAddress: 'Dirección de prueba social' }, a, 201)).body;
      assert.equal(Number(o.total), 30); assert.equal(o.channel, 'SOCIAL');
      assert.equal(Object.hasOwn(o, 'shippingCost'), false);
    });
    await t.test('Caja única, POS y conciliación separan efectivo de tarjeta', async () => {
      session = (await req('POST', '/cash-sessions', { openingAmount: 100 }, a, 201)).body;
      await req('POST', '/cash-sessions', { openingAmount: 100 }, a, 409);
      for (const method of ['CASH', 'CARD']) {
        const x = await cart(cashier, 'POS', [[product.id, 1]]);
        await req('POST', `/carts/${x.id}/checkout`, { idempotencyKey: 'pos-test-' + method, cashSessionId: session.id, paymentMethod: method }, cashier, 201);
      }
      const report = (await req('GET', `/cash-sessions/${session.id}`, undefined, a, 200)).body;
      assert.equal(Number(report.expectedAmount), 130);
      const closed = (await req('POST', `/cash-sessions/${session.id}/close`, { countedAmount: 128 }, a, 201)).body;
      assert.equal(Number(closed.difference), -2);
      const x = await cart(cashier, 'POS', [[product.id, 1]]);
      await req('POST', `/carts/${x.id}/checkout`, { idempotencyKey: 'closed-cash-test', cashSessionId: session.id, paymentMethod: 'CASH' }, cashier, 409);
    });
    await t.test('Cobro y cierre simultáneos mantienen conciliación e inventario', async () => {
      const open = (await req('POST', '/cash-sessions', { openingAmount: 0 }, a, 201)).body;
      const before = (await db.product.findUnique({ where: { id: product.id } })).stock;
      const x = await cart(cashier, 'POS', [[product.id, 1]]);
      const [sale, close] = await Promise.all([
        req('POST', `/carts/${x.id}/checkout`, { idempotencyKey: 'race-cash-close-001', cashSessionId: open.id, paymentMethod: 'CASH' }, cashier),
        req('POST', `/cash-sessions/${open.id}/close`, { countedAmount: 0 }, a),
      ]);
      assert.equal(close.status, 201);
      assert.ok([201, 409].includes(sale.status));
      const report = (await req('GET', `/cash-sessions/${open.id}`, undefined, a, 200)).body;
      assert.equal(Number(report.expectedAmount), sale.status === 201 ? 30 : 0);
      assert.equal((await db.product.findUnique({ where: { id: product.id } })).stock, before - (sale.status === 201 ? 1 : 0));
      await req('POST', `/cash-sessions/${open.id}/close`, { countedAmount: 0 }, a, 409);
    });
    await t.test('Cuenta desactivada pierde acceso aunque conserve su JWT', async () => {
      const other = await db.user.findUnique({ where: { email: 'other@test.local' } });
      await req('PATCH', `/users/${other.id}/active`, { active: false }, a, 200);
      await req('GET', '/auth/me', undefined, c2, 401);
    });
    await t.test('MockPay: enlaces, propiedad, verificación externa y notificaciones idempotentes', async () => {
      // El caso anterior desactivó esta cuenta; restaurarla para comprobar propiedad.
      await db.user.update({ where: { email: 'other@test.local' }, data: { active: true } });
      const { MockPayClient, singleSlash } = require('../dist/mockpay/mockpay.client');
      const gateway = app.get(MockPayClient);
      const originalCreate = gateway.create.bind(gateway);
      const originalGet = gateway.get.bind(gateway);
      const originalDemo = gateway.processDemo.bind(gateway);
      const remote = new Map();
      let calls = 0;
      gateway.create = async (amount, metadata) => {
        calls++;
        const id = require('node:crypto').randomUUID();
        remote.set(id, { id, amount, currency: 'GTQ', metadata, status: 'PENDING' });
        return { id_transaccion: id, checkout_url: 'https://mockpay-frontend.vercel.app//checkout/' + id };
      };
      gateway.get = async id => ({ ...remote.get(id) });
      gateway.processDemo = async (id, scenario) => { remote.get(id).status = scenario === 'SUCCESS' ? 'SUCCEEDED' : 'FAILED'; return remote.get(id); };
      try {
        assert.equal(singleSlash('https://mockpay-backend.onrender.com//api/v1/payments'), 'https://mockpay-backend.onrender.com/api/v1/payments');
        const x = await cart(c, 'WEB', [[product.id, 1]]);
        const o = (await req('POST', '/carts/' + x.id + '/checkout', { idempotencyKey: 'mockpay-order-001', addressId: address.id }, c, 201)).body;
        await req('POST', '/orders/' + o.id + '/mockpay', {}, c2, 403);
        const results = await Promise.all([req('POST', '/orders/' + o.id + '/mockpay', {}, c), req('POST', '/orders/' + o.id + '/mockpay', {}, c)]);
        assert.ok(results.some(r => r.status === 201));
        assert.equal(calls, 1);
        const attempt = (await req('GET', '/orders/' + o.id + '/mockpay', undefined, c, 200)).body;
        assert.ok(!attempt.checkoutUrl.includes('app//'));
        await req('POST', '/orders/' + o.id + '/payment', { method: 'CASH' }, a, 409);
        await req('POST', '/orders/' + o.id + '/cancel', {}, c, 409);
        // Una notificación falsificada no cambia PENDING: manda la respuesta real del proveedor.
        await req('POST', '/mockpay/webhook', { id: attempt.gatewayId, status: 'SUCCEEDED' }, null, 201);
        assert.equal((await db.order.findUnique({ where: { id: o.id } })).status, 'PENDING');
        remote.get(attempt.gatewayId).status = 'SUCCEEDED';
        remote.get(attempt.gatewayId).amount = 0.01;
        await req('POST', '/orders/' + o.id + '/mockpay/sync', {}, c, 502);
        assert.equal(await db.payment.count({ where: { orderId: o.id } }), 0);
        remote.get(attempt.gatewayId).amount = 30;
        await req('POST', '/orders/' + o.id + '/mockpay/sync', {}, c, 201);
        await req('POST', '/mockpay/webhook', { id: attempt.gatewayId, event: 'payment.succeeded' }, null, 201);
        assert.equal(await db.payment.count({ where: { orderId: o.id } }), 1);
        assert.equal((await db.order.findUnique({ where: { id: o.id } })).status, 'PAID');
        const y = await cart(c, 'WEB', [[product.id, 1]]);
        const failedOrder = (await req('POST', '/carts/' + y.id + '/checkout', { idempotencyKey: 'mockpay-failed-001', addressId: address.id }, c, 201)).body;
        const failed = (await req('POST', '/orders/' + failedOrder.id + '/mockpay', {}, c, 201)).body;
        const config = app.get(require('@nestjs/config').ConfigService);
        const mode = config.get('NODE_ENV');
        config.set('NODE_ENV', 'production');
        await req('POST', '/orders/' + failedOrder.id + '/mockpay/demo', { scenario: 'SUCCESS' }, c, 403);
        config.set('NODE_ENV', mode);
        await req('POST', '/orders/' + failedOrder.id + '/mockpay/demo', { scenario: 'INSUFFICIENT_FUNDS' }, c, 201);
        assert.equal(await db.payment.count({ where: { orderId: failedOrder.id } }), 0);
        await req('POST', '/orders/' + failedOrder.id + '/cancel', {}, c, 201);
        // Un resultado de creación incierto bloquea reintentos que podrían duplicar intenciones.
        const z = await cart(c, 'WEB', [[product.id, 1]]);
        const uncertain = (await req('POST', '/carts/' + z.id + '/checkout', { idempotencyKey: 'mockpay-unknown-001', addressId: address.id }, c, 201)).body;
        gateway.create = async () => { throw new (require('@nestjs/common').BadGatewayException)('Timeout de prueba'); };
        await req('POST', '/orders/' + uncertain.id + '/mockpay', {}, c, 502);
        await req('POST', '/orders/' + uncertain.id + '/mockpay', {}, c, 409);
        assert.equal(await db.gatewayAttempt.count({ where: { orderId: uncertain.id } }), 1);
      } finally { gateway.create = originalCreate; gateway.get = originalGet; gateway.processDemo = originalDemo; }
    });
    await t.test('Stock coincide con movimientos y Swagger documenta rutas', async () => {
      for (const p of await db.product.findMany()) {
        const sum = await db.inventoryMovement.aggregate({ where: { productId: p.id }, _sum: { quantityDelta: true } });
        assert.equal(p.stock, sum._sum.quantityDelta);
      }
      const doc = await (await fetch(base + '/api/docs-json')).json();
      assert.ok(doc.paths['/api/carts/{id}/checkout']);
      assert.ok(doc.components.securitySchemes.bearer);
      assert.ok(doc.components.schemas.CheckoutDto);
      // CONTRATOS: toda ruta tiene esquema de éxito y errores normalizados.
      for (const item of Object.values(doc.paths)) for (const [method, operation] of Object.entries(item)) {
        if (!['get', 'post', 'put', 'patch', 'delete'].includes(method)) continue;
        const success = operation.responses['200'] ?? operation.responses['201'];
        assert.ok(success?.content?.['application/json']?.schema);
        assert.ok(operation.responses['400'].content['application/json'].schema);
      }
      assert.equal(doc.components.schemas.PublicProduct.properties.salePrice.type, 'string');
      assert.equal(Object.hasOwn(doc.components.schemas.PublicProduct.properties, 'acquisitionCost'), false);
    });
  } finally { await app.close(); }
});
```

## tsconfig.json

Configura TypeScript estricto, decoradores, CommonJS, ES2022 y compilación de src hacia dist.

### Código completo para leer junto a la explicación

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2022",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strict": true,
    "strictPropertyInitialization": false,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src",
    "sourceMap": true
  },
  "include": [
    "src/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "test",
    "prisma"
  ]
}
```

## Archivos locales que no deben coincidir con GitHub

- node_modules: librerías instaladas; se reconstruyen con npm ci.
- src/generated/prisma: cliente generado desde schema; se reconstruye con npm run prisma:generate.
- dist: JavaScript compilado; se reconstruye con npm run build.
- .env: configuración privada del servidor local. No reemplazarla con la conexión de Supabase para estudiar localmente.
- .local: PostgreSQL local, accesos privados y configuraciones de prueba. Nunca subir a GitHub ni copiar contraseñas a esta guía.
- .git: historial; no es código. La carpeta actual tenía restricciones de escritura en el historial. scripts/conectar-github.ps1 permite vincularlo desde tu terminal; los archivos se sincronizan por contenido independientemente de eso.

## Preguntas para defenderlo

1. ¿Por qué el cliente no envía el total? Porque lo calcula el servidor con precios de base de datos.
2. ¿Por qué carrito y pedido son tablas distintas? El carrito es editable; el pedido conserva la operación histórica.
3. ¿Por qué una transacción? Evita pedido sin descuento de stock o stock descontado sin pedido.
4. ¿Cómo se evita comprar dos veces? idempotencyKey y restricciones únicas, además de bloqueo del carrito.
5. ¿Qué diferencia hay entre 401 y 403? Falta de autenticación válida y falta de autorización.
6. ¿Por qué no se expone acquisitionCost? Es un dato interno separado del catálogo público.
7. ¿Qué ocurre con el pago rechazado? No se crea payment; el pedido permanece pendiente hasta cancelación o una operación válida.
8. ¿Cómo se verifica el webhook? Se vuelve a consultar MockPay y se contrastan importe, moneda e identificadores.
9. ¿Por qué tarjeta no aumenta efectivo esperado? El dinero no está físicamente en caja.
10. ¿Dónde se ejecuta cada cosa? NestJS en Render, PostgreSQL en Supabase y código versionado en GitHub; local usa su propia base.

## Límites de esta guía

Las migraciones SQL ya aplicadas se conservan byte por byte para no romper su checksum. El schema y SQL se explican aquí y en DER/modelo-datos, sin reescribir migraciones históricas. JSON no admite comentarios: package.json y tsconfig se explican aquí. Los programas generados y dependencias no se editan ni etiquetan manualmente. Esta guía no convierte todas las mejoras posibles en requisitos del curso.

## Prisma: explicación de todos los campos

`@id` identifica una fila; `@default` proporciona un valor; `@unique` evita duplicados; `@map` enlaza el nombre TypeScript con la columna SQL; `@@map` enlaza el modelo con la tabla. `@relation(fields, references)` declara la clave foránea y `onDelete: Restrict` impide borrar un padre referenciado. `@@index` facilita búsquedas, `@@unique` restringe combinaciones. `Decimal(12,2)` admite doce dígitos totales, dos decimales; `Timestamptz(3)` guarda instantes con precisión de milisegundos.

### Modelo User

| Campo | Tipo | Significado | Atributos |
| --- | --- | --- | --- |
| `id` | `Int` | Identificador primario del registro. | `@id @default(autoincrement())` |
| `name` | `String` | Nombre legible. | `@db.VarChar(150)` |
| `email` | `String` | Correo único usado para iniciar sesión. No puede repetirse. | `@unique @db.VarChar(254)` |
| `phone` | `String?` | Teléfono de contacto. Puede estar ausente (null). | `@db.VarChar(30)` |
| `passwordHash` | `String` | Hash bcrypt; nunca contraseña en texto plano. | `@db.VarChar(255) @map("password_hash")` |
| `role` | `UserRole` | Rol de permisos: ADMIN, CASHIER o CUSTOMER. | `@default(CUSTOMER)` |
| `active` | `Boolean` | Permite desactivar sin borrar historial. | `@default(true)` |
| `createdAt` | `DateTime` | Momento de creación. | `@default(now()) @db.Timestamptz(3) @map("created_at")` |
| `addressesByUser` | `Address[]` | Colección de registros relacionados; no es una columna que guarde toda la lista. | `@relation("Address_user")` |
| `cartsByCreatedBy` | `Cart[]` | Colección de registros relacionados; no es una columna que guarde toda la lista. | `@relation("Cart_createdBy")` |
| `cartsByCustomer` | `Cart[]` | Colección de registros relacionados; no es una columna que guarde toda la lista. | `@relation("Cart_customer")` |
| `cashSessionsByOpenedBy` | `CashSession[]` | Colección de registros relacionados; no es una columna que guarde toda la lista. | `@relation("CashSession_openedBy")` |
| `cashSessionsByClosedBy` | `CashSession[]` | Colección de registros relacionados; no es una columna que guarde toda la lista. | `@relation("CashSession_closedBy")` |
| `ordersByCustomer` | `Order[]` | Colección de registros relacionados; no es una columna que guarde toda la lista. | `@relation("Order_customer")` |
| `ordersByCreatedBy` | `Order[]` | Colección de registros relacionados; no es una columna que guarde toda la lista. | `@relation("Order_createdBy")` |
| `paymentsByRecordedBy` | `Payment[]` | Colección de registros relacionados; no es una columna que guarde toda la lista. | `@relation("Payment_recordedBy")` |
| `inventoryMovementsByActor` | `InventoryMovement[]` | Colección de registros relacionados; no es una columna que guarde toda la lista. | `@relation("InventoryMovement_actor")` |

### Modelo Category

| Campo | Tipo | Significado | Atributos |
| --- | --- | --- | --- |
| `id` | `Int` | Identificador primario del registro. | `@id @default(autoincrement())` |
| `name` | `String` | Nombre legible. No puede repetirse. | `@unique @db.VarChar(100)` |
| `active` | `Boolean` | Permite desactivar sin borrar historial. | `@default(true)` |
| `productsByCategory` | `Product[]` | Colección de registros relacionados; no es una columna que guarde toda la lista. | `@relation("Product_category")` |

### Modelo Product

| Campo | Tipo | Significado | Atributos |
| --- | --- | --- | --- |
| `id` | `Int` | Identificador primario del registro. | `@id @default(autoincrement())` |
| `categoryId` | `Int` | Clave que vincula este registro con category. | `@map("category_id")` |
| `category` | `Category` | Relación que Prisma permite consultar mediante include/select. | `@relation("Product_category", fields: [categoryId], references: [id], onDelete: Restrict)` |
| `sku` | `String` | Código único del repuesto. No puede repetirse. | `@unique @db.VarChar(60)` |
| `name` | `String` | Nombre legible. | `@db.VarChar(150)` |
| `description` | `String?` | Descripción opcional. Puede estar ausente (null). | `` |
| `acquisitionCost` | `Decimal` | Costo interno de compra; se oculta al público. | `@db.Decimal(12,2) @map("acquisition_cost")` |
| `salePrice` | `Decimal` | Precio usado por el servidor al calcular ventas. | `@db.Decimal(12,2) @map("sale_price")` |
| `stock` | `Int` | Unidades disponibles en el inventario compartido. | `@default(0)` |
| `active` | `Boolean` | Permite desactivar sin borrar historial. | `@default(true)` |
| `createdAt` | `DateTime` | Momento de creación. | `@default(now()) @db.Timestamptz(3) @map("created_at")` |
| `cartItemsByProduct` | `CartItem[]` | Colección de registros relacionados; no es una columna que guarde toda la lista. | `@relation("CartItem_product")` |
| `orderItemsByProduct` | `OrderItem[]` | Colección de registros relacionados; no es una columna que guarde toda la lista. | `@relation("OrderItem_product")` |
| `inventoryMovementsByProduct` | `InventoryMovement[]` | Colección de registros relacionados; no es una columna que guarde toda la lista. | `@relation("InventoryMovement_product")` |

### Modelo Address

| Campo | Tipo | Significado | Atributos |
| --- | --- | --- | --- |
| `id` | `Int` | Identificador primario del registro. | `@id @default(autoincrement())` |
| `userId` | `Int` | Clave que vincula este registro con user. | `@map("user_id")` |
| `user` | `User` | Relación que Prisma permite consultar mediante include/select. | `@relation("Address_user", fields: [userId], references: [id], onDelete: Restrict)` |
| `recipientName` | `String` | Nombre de quien recibe la entrega. | `@db.VarChar(150) @map("recipient_name")` |
| `phone` | `String` | Teléfono de contacto. | `@db.VarChar(30)` |
| `addressLine` | `String` | Dirección personal guardada. | `@map("address_line")` |
| `reference` | `String?` | Referencia opcional de dirección o pago, según el modelo. Puede estar ausente (null). | `` |

### Modelo Cart

| Campo | Tipo | Significado | Atributos |
| --- | --- | --- | --- |
| `id` | `Int` | Identificador primario del registro. | `@id @default(autoincrement())` |
| `createdById` | `Int` | Clave que vincula este registro con createdBy. | `@map("created_by_id")` |
| `createdBy` | `User` | Relación que Prisma permite consultar mediante include/select. | `@relation("Cart_createdBy", fields: [createdById], references: [id], onDelete: Restrict)` |
| `customerId` | `Int?` | Clave que vincula este registro con customer. Puede estar ausente (null). | `@map("customer_id")` |
| `customer` | `User?` | Relación que Prisma permite consultar mediante include/select. Puede estar ausente (null). | `@relation("Cart_customer", fields: [customerId], references: [id], onDelete: Restrict)` |
| `channel` | `SalesChannel` | Canal POS, WEB o SOCIAL. | `` |
| `status` | `CartStatus` | Estado permitido del registro; las reglas de transición están en el servicio. | `@default(OPEN)` |
| `createdAt` | `DateTime` | Momento de creación. | `@default(now()) @db.Timestamptz(3) @map("created_at")` |
| `items` | `CartItem[]` | Colección de registros relacionados; no es una columna que guarde toda la lista. | `@relation("CartItem_cart")` |
| `order` | `Order?` | Relación que Prisma permite consultar mediante include/select. Puede estar ausente (null). | `@relation("Order_cart")` |

### Modelo CartItem

| Campo | Tipo | Significado | Atributos |
| --- | --- | --- | --- |
| `id` | `Int` | Identificador primario del registro. | `@id @default(autoincrement())` |
| `cartId` | `Int` | Clave que vincula este registro con cart. | `@map("cart_id")` |
| `cart` | `Cart` | Relación que Prisma permite consultar mediante include/select. | `@relation("CartItem_cart", fields: [cartId], references: [id], onDelete: Restrict)` |
| `productId` | `Int` | Clave que vincula este registro con product. | `@map("product_id")` |
| `product` | `Product` | Relación que Prisma permite consultar mediante include/select. | `@relation("CartItem_product", fields: [productId], references: [id], onDelete: Restrict)` |
| `quantity` | `Int` | Cantidad de unidades de una línea. | `` |

### Modelo CashSession

| Campo | Tipo | Significado | Atributos |
| --- | --- | --- | --- |
| `id` | `Int` | Identificador primario del registro. | `@id @default(autoincrement())` |
| `openedById` | `Int` | Clave que vincula este registro con openedBy. | `@map("opened_by_id")` |
| `openedBy` | `User` | Relación que Prisma permite consultar mediante include/select. | `@relation("CashSession_openedBy", fields: [openedById], references: [id], onDelete: Restrict)` |
| `closedById` | `Int?` | Clave que vincula este registro con closedBy. Puede estar ausente (null). | `@map("closed_by_id")` |
| `closedBy` | `User?` | Relación que Prisma permite consultar mediante include/select. Puede estar ausente (null). | `@relation("CashSession_closedBy", fields: [closedById], references: [id], onDelete: Restrict)` |
| `openingAmount` | `Decimal` | Fondo inicial de efectivo. | `@db.Decimal(12,2) @map("opening_amount")` |
| `countedAmount` | `Decimal?` | Efectivo contado al cierre. Puede estar ausente (null). | `@db.Decimal(12,2) @map("counted_amount")` |
| `expectedAmount` | `Decimal?` | Efectivo esperado fijado al cierre. Puede estar ausente (null). | `@db.Decimal(12,2) @map("expected_amount")` |
| `openedAt` | `DateTime` | Momento de apertura. | `@default(now()) @db.Timestamptz(3) @map("opened_at")` |
| `closedAt` | `DateTime?` | Momento de cierre; null indica caja abierta. Puede estar ausente (null). | `@db.Timestamptz(3) @map("closed_at")` |
| `orders` | `Order[]` | Colección de registros relacionados; no es una columna que guarde toda la lista. | `@relation("Order_cashSession")` |

### Modelo Order

| Campo | Tipo | Significado | Atributos |
| --- | --- | --- | --- |
| `id` | `Int` | Identificador primario del registro. | `@id @default(autoincrement())` |
| `receiptNumber` | `String` | Número único del comprobante. No puede repetirse. | `@unique @db.VarChar(60) @map("receipt_number")` |
| `idempotencyKey` | `String` | Clave única que identifica un checkout y permite reintentos sin duplicarlo. No puede repetirse. | `@unique @db.VarChar(100) @map("idempotency_key")` |
| `cartId` | `Int?` | Clave que vincula este registro con cart. Puede estar ausente (null). No puede repetirse. | `@unique @map("cart_id")` |
| `cart` | `Cart?` | Relación que Prisma permite consultar mediante include/select. Puede estar ausente (null). | `@relation("Order_cart", fields: [cartId], references: [id], onDelete: Restrict)` |
| `customerId` | `Int?` | Clave que vincula este registro con customer. Puede estar ausente (null). | `@map("customer_id")` |
| `customer` | `User?` | Relación que Prisma permite consultar mediante include/select. Puede estar ausente (null). | `@relation("Order_customer", fields: [customerId], references: [id], onDelete: Restrict)` |
| `createdById` | `Int` | Clave que vincula este registro con createdBy. | `@map("created_by_id")` |
| `createdBy` | `User` | Relación que Prisma permite consultar mediante include/select. | `@relation("Order_createdBy", fields: [createdById], references: [id], onDelete: Restrict)` |
| `cashSessionId` | `Int?` | Clave que vincula este registro con cashSession. Puede estar ausente (null). | `@map("cash_session_id")` |
| `cashSession` | `CashSession?` | Relación que Prisma permite consultar mediante include/select. Puede estar ausente (null). | `@relation("Order_cashSession", fields: [cashSessionId], references: [id], onDelete: Restrict)` |
| `channel` | `SalesChannel` | Canal POS, WEB o SOCIAL. | `` |
| `status` | `OrderStatus` | Estado permitido del registro; las reglas de transición están en el servicio. | `` |
| `total` | `Decimal` | Total calculado por el servidor con Decimal. | `@db.Decimal(12,2)` |
| `recipientName` | `String?` | Nombre de quien recibe la entrega. Puede estar ausente (null). | `@db.VarChar(150) @map("recipient_name")` |
| `recipientPhone` | `String?` | Teléfono histórico del destinatario. Puede estar ausente (null). | `@db.VarChar(30) @map("recipient_phone")` |
| `deliveryAddress` | `String?` | Copia histórica de la dirección del pedido. Puede estar ausente (null). | `@map("delivery_address")` |
| `deliveryReference` | `String?` | Referencia histórica para entrega. Puede estar ausente (null). | `@map("delivery_reference")` |
| `createdAt` | `DateTime` | Momento de creación. | `@default(now()) @db.Timestamptz(3) @map("created_at")` |
| `updatedAt` | `DateTime` | Momento de última actualización. | `@default(now()) @db.Timestamptz(3) @updatedAt @map("updated_at")` |
| `items` | `OrderItem[]` | Colección de registros relacionados; no es una columna que guarde toda la lista. | `@relation("OrderItem_order")` |
| `payment` | `Payment?` | Relación que Prisma permite consultar mediante include/select. Puede estar ausente (null). | `@relation("Payment_order")` |
| `movements` | `InventoryMovement[]` | Colección de registros relacionados; no es una columna que guarde toda la lista. | `@relation("InventoryMovement_order")` |
| `gatewayAttempts` | `GatewayAttempt[]` | Colección de registros relacionados; no es una columna que guarde toda la lista. | `` |

### Modelo OrderItem

| Campo | Tipo | Significado | Atributos |
| --- | --- | --- | --- |
| `id` | `Int` | Identificador primario del registro. | `@id @default(autoincrement())` |
| `orderId` | `Int` | Clave que vincula este registro con order. | `@map("order_id")` |
| `order` | `Order` | Relación que Prisma permite consultar mediante include/select. | `@relation("OrderItem_order", fields: [orderId], references: [id], onDelete: Restrict)` |
| `productId` | `Int` | Clave que vincula este registro con product. | `@map("product_id")` |
| `product` | `Product` | Relación que Prisma permite consultar mediante include/select. | `@relation("OrderItem_product", fields: [productId], references: [id], onDelete: Restrict)` |
| `productName` | `String` | Nombre histórico del repuesto vendido. | `@db.VarChar(150) @map("product_name")` |
| `quantity` | `Int` | Cantidad de unidades de una línea. | `` |
| `unitPrice` | `Decimal` | Precio histórico por unidad. | `@db.Decimal(12,2) @map("unit_price")` |
| `unitCost` | `Decimal` | Costo histórico por unidad; permanece interno. | `@db.Decimal(12,2) @map("unit_cost")` |

### Modelo Payment

| Campo | Tipo | Significado | Atributos |
| --- | --- | --- | --- |
| `id` | `Int` | Identificador primario del registro. | `@id @default(autoincrement())` |
| `orderId` | `Int` | Clave que vincula este registro con order. No puede repetirse. | `@unique @map("order_id")` |
| `order` | `Order` | Relación que Prisma permite consultar mediante include/select. | `@relation("Payment_order", fields: [orderId], references: [id], onDelete: Restrict)` |
| `recordedById` | `Int` | Clave que vincula este registro con recordedBy. | `@map("recorded_by_id")` |
| `recordedBy` | `User` | Relación que Prisma permite consultar mediante include/select. | `@relation("Payment_recordedBy", fields: [recordedById], references: [id], onDelete: Restrict)` |
| `method` | `PaymentMethod` | Método CASH, CARD o TRANSFER. | `` |
| `amount` | `Decimal` | Importe completo registrado en el pago. | `@db.Decimal(12,2)` |
| `reference` | `String?` | Referencia opcional de dirección o pago, según el modelo. Puede estar ausente (null). | `@db.VarChar(150)` |
| `paidAt` | `DateTime` | Momento de registro del pago. | `@default(now()) @db.Timestamptz(3) @map("paid_at")` |

### Modelo InventoryMovement

| Campo | Tipo | Significado | Atributos |
| --- | --- | --- | --- |
| `id` | `Int` | Identificador primario del registro. | `@id @default(autoincrement())` |
| `productId` | `Int` | Clave que vincula este registro con product. | `@map("product_id")` |
| `product` | `Product` | Relación que Prisma permite consultar mediante include/select. | `@relation("InventoryMovement_product", fields: [productId], references: [id], onDelete: Restrict)` |
| `orderId` | `Int?` | Clave que vincula este registro con order. Puede estar ausente (null). | `@map("order_id")` |
| `order` | `Order?` | Relación que Prisma permite consultar mediante include/select. Puede estar ausente (null). | `@relation("InventoryMovement_order", fields: [orderId], references: [id], onDelete: Restrict)` |
| `actorId` | `Int` | Clave que vincula este registro con actor. | `@map("actor_id")` |
| `actor` | `User` | Relación que Prisma permite consultar mediante include/select. | `@relation("InventoryMovement_actor", fields: [actorId], references: [id], onDelete: Restrict)` |
| `type` | `MovementType` | Tipo de movimiento de inventario. | `` |
| `quantityDelta` | `Int` | Unidades agregadas si positivo o retiradas si negativo. | `@map("quantity_delta")` |
| `reason` | `String?` | Motivo del movimiento. Puede estar ausente (null). | `` |
| `createdAt` | `DateTime` | Momento de creación. | `@default(now()) @db.Timestamptz(3) @map("created_at")` |

### Modelo GatewayAttempt

| Campo | Tipo | Significado | Atributos |
| --- | --- | --- | --- |
| `id` | `String` | Identificador primario del registro. | `@id @default(uuid()) @db.Uuid` |
| `orderId` | `Int` | Clave que vincula este registro con order. | `@map("order_id")` |
| `order` | `Order` | Relación que Prisma permite consultar mediante include/select. | `@relation(fields: [orderId], references: [id], onDelete: Restrict)` |
| `gatewayId` | `String?` | Identificador remoto de MockPay; único cuando existe. Puede estar ausente (null). No puede repetirse. | `@unique @map("gateway_id")` |
| `checkoutUrl` | `String?` | Dirección normalizada del formulario externo. Puede estar ausente (null). | `@map("checkout_url")` |
| `status` | `String` | Estado permitido del registro; las reglas de transición están en el servicio. | `@default("CREATING") @db.VarChar(20)` |
| `createdAt` | `DateTime` | Momento de creación. | `@default(now()) @db.Timestamptz(3) @map("created_at")` |
| `updatedAt` | `DateTime` | Momento de última actualización. | `@updatedAt @db.Timestamptz(3) @map("updated_at")` |

## Configuración explicada

### package.json

`dependencies` son librerías del servidor; `devDependencies` sirven para compilar, generar Prisma y probar. `engines` declara Node compatible. `scripts.build` llama tsc; `start` ejecuta dist/main.js; `prisma:generate` genera tipos; `db:deploy` aplica SQL pendiente; `db:seed` carga ejemplos; `test:e2e` ejecuta pruebas. `npm ci` instala lo fijado por package-lock; `--include=dev` incluye las herramientas necesarias durante el build de Render.

### tsconfig.json

`strict` exige tipos coherentes. `experimentalDecorators` y `emitDecoratorMetadata` permiten NestJS y su inyección. `esModuleInterop` facilita imports de paquetes CommonJS. `rootDir=src` y `outDir=dist` separan fuente y compilado; `include/exclude` limitan los archivos de build. `sourceMap` permite relacionar JavaScript con su fuente.

### Variables de entorno

DATABASE_URL conecta PostgreSQL; JWT_SECRET firma tokens; PORT indica puerto; NODE_ENV distingue entorno; CORS_ORIGINS configura orígenes de navegador; STORE_CURRENCY fija GTQ; SEED_PASSWORD se usa al crear ejemplos; MOCKPAY_API_URL señala el proveedor; MOCKPAY_SECRET_KEY autoriza solicitudes del servidor a MockPay. Ningún valor secreto se escribe en esta guía.

### Migraciones SQL

CREATE TYPE crea opciones enum; CREATE TABLE define tablas; PRIMARY KEY identifica filas; FOREIGN KEY verifica relación; UNIQUE evita repetidos; CHECK impide estados inválidos incluso si alguien evita el servicio. CREATE INDEX acelera filtros. Un índice UNIQUE con WHERE limita la unicidad a filas concretas: caja abierta o intento activo. ALTER TABLE agrega reglas después de crear tablas. Prisma conserva el historial en _prisma_migrations; no cambies migraciones ya aplicadas porque se verifica su checksum.

## Scripts Windows y pruebas, por bloques

En PowerShell `param` recibe opciones; `$PSScriptRoot` es la carpeta del script; `Join-Path` arma rutas; `Test-Path` comprueba existencia; `&` ejecuta comandos; `$LASTEXITCODE` comprueba fallos; `try/finally` restaura variables aunque falle una prueba. Los scripts usan rutas literales para evitar confundir espacios del nombre Proyecto Final.

- configure-local.cjs lee .env existente, conserva claves, crea secretos faltantes y guarda archivos privados. fs lee/escribe y crypto genera valores aleatorios.
- local-db.ps1 descubre PostgreSQL, verifica que el clúster sea propio, inicializa autenticación scram y usa procesos ocultos para el servidor de base de datos. Los logs y el PID son datos de ejecución.
- migrate-local.ps1 lanza el motor oficial Prisma, envía JSON-RPC por stdin y recibe respuestas por stdout; comprueba errores/timeout y conserva el historial real de migraciones.
- iniciar-local.ps1 cambia a la raíz, prepara configuración, inicia PostgreSQL, instala si hace falta, genera Prisma, aplica migraciones, compila, carga ejemplos y ejecuta npm start. -Preparar obliga a preparar; -EngineFallback selecciona el adaptador alternativo.
- probar-local.ps1 guarda entorno previo, prepara la base _test, aplica migraciones y ejecuta pruebas; finally restaura el entorno.
- detener-base.ps1 delega el apagado del clúster propio.
- conectar-github.ps1 obtiene main y conecta el historial desde tu terminal; el reset mixed inicial conserva el contenido de archivos. No debe usarse para borrar cambios.
- iniciar-local.cmd invoca PowerShell; pause permite leer errores antes de cerrar la ventana.

En e2e.cjs `node:test` agrupa casos y `assert` comprueba resultados. Se crea NestJS en el proceso, se atiende HTTP real y se usa PostgreSQL de pruebas. Primero se exige el sufijo _test; únicamente después se permite TRUNCATE de tablas de esa base. Los casos prueban permiso/propiedad, hashing, checkout y rollback, concurrencia, caja, logística y MockPay. El cliente externo se reemplaza por una implementación de prueba; los pagos públicos ficticios se verificaron además contra el proveedor real del curso. La copia de estudio nunca requiere ejecutar estos tests sobre Supabase.
