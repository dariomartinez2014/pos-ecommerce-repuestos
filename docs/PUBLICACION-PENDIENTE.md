# Publicación pendiente

La publicación requerida ya está realizada: API en Render, PostgreSQL en Supabase, datos de demostración y comercio MockPay con URLs públicas. También se completaron las pruebas públicas de administración/caja. Consulta ENTREGA-PUBLICA.md para el estado verificado.

1. Crear la cuenta y el proyecto Supabase y guardar su conexión privada.
2. Subir el código al repositorio GitHub.
3. Crear el servicio Render conectado al repositorio.
4. Configurar DATABASE_URL, JWT_SECRET y demás variables privadas.
5. Aplicar migraciones y cargar ejemplos una vez, con accesos propios de ese entorno.
6. Verificar catálogo, login, checkout, roles, caja y Swagger desde la URL pública.
7. Actualizar README con enlaces y preparar accesos para evaluación.

La lista anterior documenta la secuencia de publicación completada. Los comandos vigentes y los enlaces se encuentran en ENTREGA-PUBLICA.md.

Después podremos agregar interfaz visual, búsqueda por vehículo, imágenes, favoritos, avisos de stock y reportes de utilidad. Los pagos pueden registrarse administrativamente o mediante MockPay verificado; el envío queda fuera del total.
