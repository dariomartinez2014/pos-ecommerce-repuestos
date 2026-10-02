// ARCHIVO: Registra controladores y servicios para que NestJS pueda construir sus dependencias.
// ESTUDIO: consulta docs/GUIA-CODIGO-COMPLETA.md para recorrer este archivo.
import { Module } from '@nestjs/common';
import { AddressesController } from './addresses.controller';
import { AddressesService } from './addresses.service';
// MÓDULO: registra las dependencias de las direcciones personales.
// CLASE AddressesModule: agrupa y registra dependencias en NestJS.
@Module({ controllers: [AddressesController], providers: [AddressesService] })
export class AddressesModule {}
