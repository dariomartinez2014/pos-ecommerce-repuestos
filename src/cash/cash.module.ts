// Registra controladores y servicios para que NestJS pueda construir sus dependencias.

import { Module } from '@nestjs/common';
import { CashController } from './cash.controller';
import { CashService } from './cash.service';
// registra caja y permite al seed reutilizar las reglas del servicio.
export { CashService } from './cash.service';

@Module({ providers: [CashService], controllers: [CashController] })
export class CashModule {}
