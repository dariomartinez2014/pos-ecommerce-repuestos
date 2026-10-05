// Indica al CLI de Prisma dónde están el schema, las migraciones y la conexión privada.

// migraciones y generación; la URL viene del entorno.
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: env('DATABASE_URL') },
});
