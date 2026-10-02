// ARCHIVO: Registra controladores y servicios para que NestJS pueda construir sus dependencias.
// ESTUDIO: consulta docs/GUIA-CODIGO-COMPLETA.md para recorrer este archivo.
import { Module } from '@nestjs/common';
import { CashController } from './cash.controller';
import { CashService } from './cash.service';
// MÓDULO: registra caja y permite al seed reutilizar las reglas del servicio.
export { CashService } from './cash.service';
// CLASE CashModule: agrupa y registra dependencias en NestJS.
@Module({ providers: [CashService], controllers: [CashController] })
export class CashModule {}
