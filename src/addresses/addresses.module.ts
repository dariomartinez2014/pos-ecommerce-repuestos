// Registra controladores y servicios para que NestJS pueda construir sus dependencias.

import { Module } from '@nestjs/common';
import { AddressesController } from './addresses.controller';
import { AddressesService } from './addresses.service';
// registra las dependencias de las direcciones personales.

@Module({ controllers: [AddressesController], providers: [AddressesService] })
export class AddressesModule {}
