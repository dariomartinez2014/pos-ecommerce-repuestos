import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CartsController, OrdersController } from './sales.controller';
// MÓDULO DE VENTAS: centraliza reglas compartidas por mostrador y web.
@Module({ providers: [SalesService], controllers: [CartsController, OrdersController], exports: [SalesService] })
export class SalesModule {}
