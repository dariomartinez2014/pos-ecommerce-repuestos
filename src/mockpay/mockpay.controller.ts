// Publica las rutas de intención, consulta, sincronización, simulación local, webhook y redirecciones.

import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Allow, IsIn, IsUUID } from 'class-validator';
import { Actor, CurrentUser, Public, Roles } from '../common/security';
import { MockPayService } from './mockpay.service';

// aceptar el contrato del proveedor; únicamente el ID inicia una consulta verificada.

class WebhookDto {
  @ApiProperty() @IsUUID() id: string;
  @Allow() event?: string; @Allow() amount?: number; @Allow() currency?: string;
  @Allow() status?: string; @Allow() failure_reason?: string | null;
  @Allow() metadata?: Record<string, unknown>; @Allow() created_at?: string;
}
const attemptSchema: any = { type: 'object', properties: {
  id: { type: 'string', format: 'uuid' }, orderId: { type: 'integer' }, gatewayId: { type: 'string', nullable: true },
  checkoutUrl: { type: 'string', nullable: true }, status: { type: 'string', enum: ['CREATING','PENDING','UNKNOWN','FAILED','SUCCEEDED'] },
  createdAt: { type: 'string', format: 'date-time' }, updatedAt: { type: 'string', format: 'date-time' },
  orderStatus: { type: 'string', description: 'Presente al sincronizar' }
} };
// el cliente elige una prueba, nunca envía datos de tarjetas reales.

class DemoPaymentDto {
  @ApiProperty({ enum: ['SUCCESS','INSUFFICIENT_FUNDS','DECLINED'], example: 'SUCCESS' })
  @IsIn(['SUCCESS','INSUFFICIENT_FUNDS','DECLINED']) scenario: 'SUCCESS' | 'INSUFFICIENT_FUNDS' | 'DECLINED';
}

@ApiTags('Pasarela MockPay') @ApiBearerAuth() @Roles('ADMIN', 'CUSTOMER') @Controller('orders')
export class MockPayOrdersController {
  
  constructor(private readonly service: MockPayService) {}
  // Pasa los datos de esta ruta al método create del servicio.
  @Post(':id/mockpay') @ApiOperation({ summary: 'Crear o recuperar checkout MockPay; cliente dueño o administrador' }) @ApiResponse({ status: 201, schema: attemptSchema })
  create(@Param('id', ParseIntPipe) id: number, @CurrentUser() actor: Actor) { return this.service.create(id, actor); }
  // Pasa los datos de esta ruta al método latest del servicio.
  @Get(':id/mockpay') @ApiOperation({ summary: 'Consultar último intento y enlace de cobro' }) @ApiResponse({ status: 200, schema: attemptSchema })
  latest(@Param('id', ParseIntPipe) id: number, @CurrentUser() actor: Actor) { return this.service.latest(id, actor); }
  // Pasa los datos de esta ruta al método sync del servicio.
  @Post(':id/mockpay/sync') @ApiOperation({ summary: 'Consultar resultado verificado; útil en localhost sin webhook público' }) @ApiResponse({ status: 201, schema: attemptSchema })
  sync(@Param('id', ParseIntPipe) id: number, @CurrentUser() actor: Actor) { return this.service.sync(id, actor); }
  // Pasa los datos de esta ruta al método demo del servicio.
  @Post(':id/mockpay/demo') @ApiOperation({ summary: 'Probar tarjeta ficticia del curso desde Swagger; solo desarrollo/pruebas' }) @ApiResponse({ status: 201, schema: attemptSchema })
  demo(@Param('id', ParseIntPipe) id: number, @Body() dto: DemoPaymentDto, @CurrentUser() actor: Actor) { return this.service.demo(id, dto.scenario, actor); }
}

@ApiTags('Pasarela MockPay') @Controller('mockpay')
export class MockPayWebhookController {
  
  constructor(private readonly service: MockPayService) {}
  // Pasa los datos de esta ruta al método verify del servicio.
  @Public() @Post('webhook') @ApiOperation({ summary: 'Notificación MockPay: reconsulta proveedor antes de aplicar pago' }) @ApiResponse({ status: 201, schema: attemptSchema })
  webhook(@Body() body: WebhookDto) { return this.service.verify(body.id); }
  // informar cómo consultar; nunca marcar pagado desde un query string.
  // Pasa los datos de esta ruta al método returned del servicio.
  @Public() @Get('return') @ApiOperation({ summary: 'Retorno del navegador; no confirma pagos' }) @ApiResponse({ status: 200, schema: { type: 'object', properties: { message: { type: 'string' }, transactionId: { type: 'string' } } } })
  returned(@Query('transaction_id') id: string) { return { message: 'Regresa a Swagger y sincroniza tu pedido para comprobar el pago.', transactionId: id }; }
  // Pasa los datos de esta ruta al método cancelled del servicio.
  @Public() @Get('cancel') @ApiOperation({ summary: 'Retorno por cancelación; el pedido conserva su estado' }) @ApiResponse({ status: 200, schema: { type: 'object', properties: { message: { type: 'string' } } } })
  cancelled() { return { message: 'Se cerró el checkout. Consulta el resultado del intento antes de cancelar el pedido.' }; }
}
