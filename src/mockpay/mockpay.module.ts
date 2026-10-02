// ARCHIVO: Registra controladores y servicios para que NestJS pueda construir sus dependencias.
// ESTUDIO: consulta docs/GUIA-CODIGO-COMPLETA.md para recorrer este archivo.
import { Module } from '@nestjs/common';
import { SalesModule } from '../sales/sales.module';
import { MockPayClient } from './mockpay.client';
import { MockPayService } from './mockpay.service';
import { MockPayOrdersController, MockPayWebhookController } from './mockpay.controller';
// MÓDULO: separa comunicación externa, reglas de cobro y rutas de NestJS.
// CLASE MockPayModule: agrupa y registra dependencias en NestJS.
@Module({ imports: [SalesModule], providers: [MockPayClient, MockPayService], controllers: [MockPayOrdersController, MockPayWebhookController] })
export class MockPayModule {}

