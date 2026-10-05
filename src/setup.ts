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
