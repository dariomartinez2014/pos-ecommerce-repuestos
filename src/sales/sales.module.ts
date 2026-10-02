// ARCHIVO: Registra controladores y servicios para que NestJS pueda construir sus dependencias.
// ESTUDIO: consulta docs/GUIA-CODIGO-COMPLETA.md para recorrer este archivo.
import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CartsController, OrdersController } from './sales.controller';
// MÓDULO DE VENTAS: centraliza reglas compartidas por mostrador y web.
// CLASE SalesModule: agrupa y registra dependencias en NestJS.
@Module({ providers: [SalesService], controllers: [CartsController, OrdersController], exports: [SalesService] })
export class SalesModule {}
