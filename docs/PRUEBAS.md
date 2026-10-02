# Verificación local

Fecha: 29 de septiembre de 2026, Guatemala. La suite terminó con 14 comprobaciones aprobadas y cero fallos: 13 casos y su prueba contenedora.

## Entorno

NestJS y HTTP reales, PostgreSQL 18 local y cliente Prisma 7.10. Compilación TypeScript estricta. Base aislada pos_ecommerce_test; no se limpió la base de demostración.

~~~powershell
# Ejecutado para preparar base, migrar, compilar y probar.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/probar-local.ps1 -EngineFallback
~~~

El entorno de construcción restringe procesos hijos de Node (spawn EPERM). El adaptador local utiliza el mismo motor Prisma, mantiene abierto su canal hasta recibir respuesta y registra migraciones en _prisma_migrations. El comando estándar para otros entornos permanece npm run db:deploy.

## Casos

1. Registro público rechaza elevar privilegios; duplicados y permisos HTTP.
2. Catálogo valida dinero, protege costos y registra stock.
3. Direcciones y carritos pertenecen al usuario.
4. Checkout guarda precios históricos y reintenta sin duplicados.
5. Fallo en una línea revierte descuentos y pedido.
6. Dos compras simultáneas de la última unidad: una venta y un rechazo.
7. Cancelación repetida repone unidades una sola vez.
8. Pago administrativo y secuencia logística; dirección histórica.
9. Pedido SOCIAL excluye tarifa de envío.
10. Caja única, POS y conciliación separan efectivo y tarjeta.
11. Cobro y cierre simultáneos mantienen conciliación e inventario.
12. Cuenta desactivada pierde acceso aunque conserve JWT.
13. Stock coincide con movimientos; Swagger documenta todas las respuestas de éxito y errores.

También se validó el schema Prisma, se generó el cliente y se aplicó la migración en una base local nueva. El seed cargó usuarios por rol, cuatro categorías, ocho repuestos y pedidos/ventas de ejemplo.

## Límites

La suite cubre reglas prioritarias del alcance y carreras concretas. No constituye prueba de carga de producción. La publicación Render/Supabase y la verificación remota todavía están pendientes. Los pagos CARD/TRANSFER son registros administrativos, sin integración bancaria. El uso visual de Swagger se comprueba por separado.


## Actualización: 1 de octubre de 2026

15 comprobaciones aprobadas y cero fallos (14 casos y su prueba contenedora), con MockPay. Se verificaron creación concurrente sin duplicar intención, enlaces con una barra, propiedad, notificación falsificada, total remoto distinto, éxito repetido, rechazo y resultado incierto.

Prueba externa del sandbox: un pedido de demostración en GTQ fue aprobado por MockPay y sincronizado dos veces, conservando un único pago. También se identificó el error del formulario externo con espacios en tarjeta; docs/MOCKPAY.md explica la alternativa desde Swagger.

## Verificación del entorno publicado

La API en Render y PostgreSQL en Supabase aprobaron 17 comprobaciones públicas: catálogo, identidad, permisos de cliente, checkout idempotente, inventario, MockPay aprobado/rechazado, sincronización repetida y cancelación. El informe no incluye contraseñas ni tarjetas. Consulta ENTREGA-PUBLICA.md para el alcance y los pendientes de roles ADMIN/CASHIER.
