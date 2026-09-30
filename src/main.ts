import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { configureApp } from './setup';
// ARRANQUE: escucha el puerto de Render o el configurado en .env local.
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  await app.listen(app.get(ConfigService).getOrThrow<number>('PORT'), '0.0.0.0');
}
bootstrap().catch(error => { console.error('No se pudo iniciar la API:', error.message); process.exitCode = 1; });
