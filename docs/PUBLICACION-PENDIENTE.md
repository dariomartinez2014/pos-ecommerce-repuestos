# Publicación pendiente

La versión local se prepara antes de publicar, como indicó el estudiante. El curso requiere una API en Render y PostgreSQL en Supabase con datos de prueba. Esa publicación todavía está pendiente.

1. Crear la cuenta y el proyecto Supabase y guardar su conexión privada.
2. Subir el código al repositorio GitHub.
3. Crear el servicio Render conectado al repositorio.
4. Configurar DATABASE_URL, JWT_SECRET y demás variables privadas.
5. Aplicar migraciones y cargar ejemplos una vez, con accesos propios de ese entorno.
6. Verificar catálogo, login, checkout, roles, caja y Swagger desde la URL pública.
7. Actualizar README con enlaces y preparar accesos para evaluación.

Los comandos estándar ya existen: npm ci, prisma:generate, db:deploy, build, db:seed y start. Revisaremos la configuración vigente al crear los servicios.

Después podremos agregar interfaz visual, búsqueda por vehículo, imágenes, favoritos, avisos de stock y reportes de utilidad. Los pagos actuales se registran administrativamente y el envío queda fuera del total.
