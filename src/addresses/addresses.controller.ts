// ARCHIVO: Recibe solicitudes HTTP, valida parámetros con DTO/Pipes y delega reglas en servicios.
// ESTUDIO: consulta docs/GUIA-CODIGO-COMPLETA.md para recorrer este archivo.
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Actor, CurrentUser, Roles } from '../common/security';
import { AddressDto, UpdateAddressDto } from './addresses.dto';
import { AddressesService } from './addresses.service';
// RUTAS: reciben DTOs validados y delegan la autorización de propiedad al servicio.
// CLASE AddressesController: Recibe solicitudes HTTP, valida parámetros con DTO/Pipes y delega reglas en servicios.
@ApiTags('Direcciones') @ApiBearerAuth() @Roles('CUSTOMER') @Controller('addresses')
export class AddressesController {
  // BLOQUE constructor: Inyecta las dependencias necesarias; NestJS proporciona estas instancias al construir la clase.
  constructor(private readonly service: AddressesService) {}
  // BLOQUE list: Recibe datos de la ruta y delega list al servicio; los decoradores definen HTTP, documentación y permisos.
  @Get() @ApiOperation({ summary: 'Mis direcciones' })
  list(@CurrentUser() u: Actor) { return this.service.list(u.id); }
  // BLOQUE create: Recibe datos de la ruta y delega create al servicio; los decoradores definen HTTP, documentación y permisos.
  @Post() @ApiOperation({ summary: 'Guardar dirección personal' })
  create(@Body() dto: AddressDto, @CurrentUser() u: Actor) { return this.service.create(dto, u.id); }
  // BLOQUE update: Recibe datos de la ruta y delega update al servicio; los decoradores definen HTTP, documentación y permisos.
  @Patch(':id') @ApiOperation({ summary: 'Editar dirección sin alterar pedidos históricos' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAddressDto, @CurrentUser() u: Actor) { return this.service.update(id, dto, u.id); }
  // BLOQUE remove: Recibe datos de la ruta y delega remove al servicio; los decoradores definen HTTP, documentación y permisos.
  @Delete(':id') @ApiOperation({ summary: 'Eliminar dirección guardada' })
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() u: Actor) { return this.service.remove(id, u.id); }
}
