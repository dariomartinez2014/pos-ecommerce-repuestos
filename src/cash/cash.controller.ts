// ARCHIVO: Recibe solicitudes HTTP, valida parámetros con DTO/Pipes y delega reglas en servicios.
// ESTUDIO: consulta docs/GUIA-CODIGO-COMPLETA.md para recorrer este archivo.
import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Actor, CurrentUser, Roles } from '../common/security';
import { CashService } from './cash.service';
import { OpenCashDto, CloseCashDto } from './cash.dto';
// RUTAS: el administrador abre y cierra caja; el cajero puede consultar el listado.
// CLASE CashController: Recibe solicitudes HTTP, valida parámetros con DTO/Pipes y delega reglas en servicios.
@ApiTags('Caja') @ApiBearerAuth() @Controller('cash-sessions')
export class CashController {
  // BLOQUE constructor: Inyecta las dependencias necesarias; NestJS proporciona estas instancias al construir la clase.
  constructor(private readonly service: CashService) {}
  // BLOQUE list: Recibe datos de la ruta y delega list al servicio; los decoradores definen HTTP, documentación y permisos.
  @Get() @Roles('ADMIN', 'CASHIER') @ApiOperation({ summary: 'Listar últimas 100 sesiones para seleccionar caja abierta' })
  list() { return this.service.list(); }
  // BLOQUE open: Recibe datos de la ruta y delega open al servicio; los decoradores definen HTTP, documentación y permisos.
  @Post() @Roles('ADMIN') @ApiOperation({ summary: 'Abrir caja física única' })
  open(@Body() dto: OpenCashDto, @CurrentUser() actor: Actor) { return this.service.open(dto, actor); }
  // BLOQUE get: Recibe datos de la ruta y delega get al servicio; los decoradores definen HTTP, documentación y permisos.
  @Get(':id') @Roles('ADMIN') @ApiOperation({ summary: 'Conciliar efectivo y consultar ventas por método de pago' })
  get(@Param('id', ParseIntPipe) id: number) { return this.service.get(id); }
  // BLOQUE close: Recibe datos de la ruta y delega close al servicio; los decoradores definen HTTP, documentación y permisos.
  @Post(':id/close') @Roles('ADMIN') @ApiOperation({ summary: 'Cerrar caja con el efectivo contado y calcular diferencia' })
  close(@Param('id', ParseIntPipe) id: number, @Body() dto: CloseCashDto, @CurrentUser() actor: Actor) { return this.service.close(id, dto, actor); }
}
