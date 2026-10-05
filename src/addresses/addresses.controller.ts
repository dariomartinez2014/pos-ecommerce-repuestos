// Recibe solicitudes HTTP, valida parámetros con DTO/Pipes y delega reglas en servicios.

import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Actor, CurrentUser, Roles } from '../common/security';
import { AddressDto, UpdateAddressDto } from './addresses.dto';
import { AddressesService } from './addresses.service';
// reciben DTOs validados y delegan la autorización de propiedad al servicio.

@ApiTags('Direcciones') @ApiBearerAuth() @Roles('CUSTOMER') @Controller('addresses')
export class AddressesController {
  
  constructor(private readonly service: AddressesService) {}
  // Pasa los datos de esta ruta al método list del servicio.
  @Get() @ApiOperation({ summary: 'Mis direcciones' })
  list(@CurrentUser() u: Actor) { return this.service.list(u.id); }
  // Pasa los datos de esta ruta al método create del servicio.
  @Post() @ApiOperation({ summary: 'Guardar dirección personal' })
  create(@Body() dto: AddressDto, @CurrentUser() u: Actor) { return this.service.create(dto, u.id); }
  // Pasa los datos de esta ruta al método update del servicio.
  @Patch(':id') @ApiOperation({ summary: 'Editar dirección sin alterar pedidos históricos' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAddressDto, @CurrentUser() u: Actor) { return this.service.update(id, dto, u.id); }
  // Pasa los datos de esta ruta al método remove del servicio.
  @Delete(':id') @ApiOperation({ summary: 'Eliminar dirección guardada' })
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() u: Actor) { return this.service.remove(id, u.id); }
}
