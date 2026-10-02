// ARCHIVO: Publica las rutas de intención, consulta, sincronización, simulación local, webhook y redirecciones.
// ESTUDIO: consulta docs/GUIA-CODIGO-COMPLETA.md para recorrer este archivo.
import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Allow, IsIn, IsUUID } from 'class-validator';
import { Actor, CurrentUser, Public, Roles } from '../common/security';
import { MockPayService } from './mockpay.service';

// WEBHOOK: aceptar el contrato del proveedor; únicamente el ID inicia una consulta verificada.
// CLASE WebhookDto: Publica las rutas de intención, consulta, sincronización, simulación local, webhook y redirecciones.
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
// ESCENARIOS: el cliente elige una prueba, nunca envía datos de tarjetas reales.
// CLASE DemoPaymentDto: Publica las rutas de intención, consulta, sincronización, simulación local, webhook y redirecciones.
class DemoPaymentDto {
  @ApiProperty({ enum: ['SUCCESS','INSUFFICIENT_FUNDS','DECLINED'], example: 'SUCCESS' })
  @IsIn(['SUCCESS','INSUFFICIENT_FUNDS','DECLINED']) scenario: 'SUCCESS' | 'INSUFFICIENT_FUNDS' | 'DECLINED';
}
// CLASE MockPayOrdersController: Publica las rutas de intención, consulta, sincronización, simulación local, webhook y redirecciones.
@ApiTags('Pasarela MockPay') @ApiBearerAuth() @Roles('ADMIN', 'CUSTOMER') @Controller('orders')
export class MockPayOrdersController {
  // BLOQUE constructor: Inyecta las dependencias necesarias; NestJS proporciona estas instancias al construir la clase.
  constructor(private readonly service: MockPayService) {}
  // BLOQUE create: Recibe datos de la ruta y delega create al servicio; los decoradores definen HTTP, documentación y permisos.
  @Post(':id/mockpay') @ApiOperation({ summary: 'Crear o recuperar checkout MockPay; cliente dueño o administrador' }) @ApiResponse({ status: 201, schema: attemptSchema })
  create(@Param('id', ParseIntPipe) id: number, @CurrentUser() actor: Actor) { return this.service.create(id, actor); }
  // BLOQUE latest: Recibe datos de la ruta y delega latest al servicio; los decoradores definen HTTP, documentación y permisos.
  @Get(':id/mockpay') @ApiOperation({ summary: 'Consultar último intento y enlace de cobro' }) @ApiResponse({ status: 200, schema: attemptSchema })
  latest(@Param('id', ParseIntPipe) id: number, @CurrentUser() actor: Actor) { return this.service.latest(id, actor); }
  // BLOQUE sync: Recibe datos de la ruta y delega sync al servicio; los decoradores definen HTTP, documentación y permisos.
  @Post(':id/mockpay/sync') @ApiOperation({ summary: 'Consultar resultado verificado; útil en localhost sin webhook público' }) @ApiResponse({ status: 201, schema: attemptSchema })
  sync(@Param('id', ParseIntPipe) id: number, @CurrentUser() actor: Actor) { return this.service.sync(id, actor); }
  // BLOQUE demo: Recibe datos de la ruta y delega demo al servicio; los decoradores definen HTTP, documentación y permisos.
  @Post(':id/mockpay/demo') @ApiOperation({ summary: 'Probar tarjeta ficticia del curso desde Swagger; solo desarrollo/pruebas' }) @ApiResponse({ status: 201, schema: attemptSchema })
  demo(@Param('id', ParseIntPipe) id: number, @Body() dto: DemoPaymentDto, @CurrentUser() actor: Actor) { return this.service.demo(id, dto.scenario, actor); }
}
// CLASE MockPayWebhookController: Publica las rutas de intención, consulta, sincronización, simulación local, webhook y redirecciones.
@ApiTags('Pasarela MockPay') @Controller('mockpay')
export class MockPayWebhookController {
  // BLOQUE constructor: Inyecta las dependencias necesarias; NestJS proporciona estas instancias al construir la clase.
  constructor(private readonly service: MockPayService) {}
  // BLOQUE webhook: Recibe datos de la ruta y delega verify al servicio; los decoradores definen HTTP, documentación y permisos.
  @Public() @Post('webhook') @ApiOperation({ summary: 'Notificación MockPay: reconsulta proveedor antes de aplicar pago' }) @ApiResponse({ status: 201, schema: attemptSchema })
  webhook(@Body() body: WebhookDto) { return this.service.verify(body.id); }
  // RETORNO VISUAL: informar cómo consultar; nunca marcar pagado desde un query string.
  // BLOQUE returned: Recibe datos de la ruta y delega returned al servicio; los decoradores definen HTTP, documentación y permisos.
  @Public() @Get('return') @ApiOperation({ summary: 'Retorno del navegador; no confirma pagos' }) @ApiResponse({ status: 200, schema: { type: 'object', properties: { message: { type: 'string' }, transactionId: { type: 'string' } } } })
  returned(@Query('transaction_id') id: string) { return { message: 'Regresa a Swagger y sincroniza tu pedido para comprobar el pago.', transactionId: id }; }
  // BLOQUE cancelled: Recibe datos de la ruta y delega cancelled al servicio; los decoradores definen HTTP, documentación y permisos.
  @Public() @Get('cancel') @ApiOperation({ summary: 'Retorno por cancelación; el pedido conserva su estado' }) @ApiResponse({ status: 200, schema: { type: 'object', properties: { message: { type: 'string' } } } })
  cancelled() { return { message: 'Se cerró el checkout. Consulta el resultado del intento antes de cancelar el pedido.' }; }
}
