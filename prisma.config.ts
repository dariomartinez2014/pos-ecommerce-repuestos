// CONFIGURACIÓN CLI: migraciones y generación; la URL viene del entorno.
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: env('DATABASE_URL') },
});
