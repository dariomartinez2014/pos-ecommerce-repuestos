import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Actor, CurrentUser, Roles } from '../common/security';
import { CashService } from './cash.service';
import { OpenCashDto, CloseCashDto } from './cash.dto';
// RUTAS: el administrador abre y cierra caja; el cajero puede consultar el listado.
@ApiTags('Caja') @ApiBearerAuth() @Controller('cash-sessions')
export class CashController {
  constructor(private readonly service: CashService) {}
  @Get() @Roles('ADMIN', 'CASHIER') @ApiOperation({ summary: 'Listar últimas 100 sesiones para seleccionar caja abierta' })
  list() { return this.service.list(); }
  @Post() @Roles('ADMIN') @ApiOperation({ summary: 'Abrir caja física única' })
  open(@Body() dto: OpenCashDto, @CurrentUser() actor: Actor) { return this.service.open(dto, actor); }
  @Get(':id') @Roles('ADMIN') @ApiOperation({ summary: 'Conciliar efectivo y consultar ventas por método de pago' })
  get(@Param('id', ParseIntPipe) id: number) { return this.service.get(id); }
  @Post(':id/close') @Roles('ADMIN') @ApiOperation({ summary: 'Cerrar caja con el efectivo contado y calcular diferencia' })
  close(@Param('id', ParseIntPipe) id: number, @Body() dto: CloseCashDto, @CurrentUser() actor: Actor) { return this.service.close(id, dto, actor); }
}
