import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Actor, CurrentUser, Roles } from '../common/security';
import { AddressDto, UpdateAddressDto } from './addresses.dto';
import { AddressesService } from './addresses.service';
// RUTAS: reciben DTOs validados y delegan la autorización de propiedad al servicio.
@ApiTags('Direcciones') @ApiBearerAuth() @Roles('CUSTOMER') @Controller('addresses')
export class AddressesController {
  constructor(private readonly service: AddressesService) {}
  @Get() @ApiOperation({ summary: 'Mis direcciones' })
  list(@CurrentUser() u: Actor) { return this.service.list(u.id); }
  @Post() @ApiOperation({ summary: 'Guardar dirección personal' })
  create(@Body() dto: AddressDto, @CurrentUser() u: Actor) { return this.service.create(dto, u.id); }
  @Patch(':id') @ApiOperation({ summary: 'Editar dirección sin alterar pedidos históricos' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAddressDto, @CurrentUser() u: Actor) { return this.service.update(id, dto, u.id); }
  @Delete(':id') @ApiOperation({ summary: 'Eliminar dirección guardada' })
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() u: Actor) { return this.service.remove(id, u.id); }
}
