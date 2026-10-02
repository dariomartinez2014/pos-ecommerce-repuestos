// ARCHIVO: Recibe solicitudes HTTP, valida parámetros con DTO/Pipes y delega reglas en servicios.
// ESTUDIO: consulta docs/GUIA-CODIGO-COMPLETA.md para recorrer este archivo.
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Actor, CurrentUser, Roles } from '../common/security';
import { CartDto, CartItemDto, CheckoutDto, OrdersQuery, OrderStatusDto, PaymentDto } from './sales.dto';
import { SalesService } from './sales.service';
// CARRITOS: un mismo flujo prepara ventas POS, compras WEB y pedidos SOCIAL.
// CLASE CartsController: Recibe solicitudes HTTP, valida parámetros con DTO/Pipes y delega reglas en servicios.
@ApiTags('Carritos y checkout') @ApiBearerAuth() @Controller('carts')
export class CartsController {
  // BLOQUE constructor: Inyecta las dependencias necesarias; NestJS proporciona estas instancias al construir la clase.
  constructor(private readonly service: SalesService) {}
  // BLOQUE create: Recibe datos de la ruta y delega createCart al servicio; los decoradores definen HTTP, documentación y permisos.
  @Post() @ApiOperation({ summary: 'Abrir carrito según el canal permitido al usuario' })
  create(@Body() dto: CartDto, @CurrentUser() actor: Actor) { return this.service.createCart(dto, actor); }
  // BLOQUE get: Recibe datos de la ruta y delega cart al servicio; los decoradores definen HTTP, documentación y permisos.
  @Get(':id') @ApiOperation({ summary: 'Consultar mi carrito' })
  get(@Param('id', ParseIntPipe) id: number, @CurrentUser() actor: Actor) { return this.service.cart(id, actor); }
  // BLOQUE item: Recibe datos de la ruta y delega setItem al servicio; los decoradores definen HTTP, documentación y permisos.
  @Put(':id/items') @ApiOperation({ summary: 'Agregar producto o reemplazar su cantidad; no reserva stock' })
  item(@Param('id', ParseIntPipe) id: number, @Body() dto: CartItemDto, @CurrentUser() actor: Actor) { return this.service.setItem(id, dto, actor); }
  // BLOQUE remove: Recibe datos de la ruta y delega removeItem al servicio; los decoradores definen HTTP, documentación y permisos.
  @Delete(':id/items/:productId') @ApiOperation({ summary: 'Retirar producto del carrito abierto' })
  remove(@Param('id', ParseIntPipe) id: number, @Param('productId', ParseIntPipe) productId: number, @CurrentUser() actor: Actor) { return this.service.removeItem(id, productId, actor); }
  // BLOQUE checkout: Recibe datos de la ruta y delega checkout al servicio; los decoradores definen HTTP, documentación y permisos.
  @Post(':id/checkout') @ApiOperation({ summary: 'Confirmar compra transaccional con clave de idempotencia' })
  checkout(@Param('id', ParseIntPipe) id: number, @Body() dto: CheckoutDto, @CurrentUser() actor: Actor) { return this.service.checkout(id, dto, actor); }
}
// CLASE OrdersController: Recibe solicitudes HTTP, valida parámetros con DTO/Pipes y delega reglas en servicios.
@ApiTags('Pedidos y logística') @ApiBearerAuth() @Controller('orders')
export class OrdersController {
  // BLOQUE constructor: Inyecta las dependencias necesarias; NestJS proporciona estas instancias al construir la clase.
  constructor(private readonly service: SalesService) {}
  // BLOQUE list: Recibe datos de la ruta y delega list al servicio; los decoradores definen HTTP, documentación y permisos.
  @Get() @ApiOperation({ summary: 'Historial propio o cola administrativa filtrada por estado/canal/día' })
  list(@Query() q: OrdersQuery, @CurrentUser() actor: Actor) { return this.service.list(q, actor); }
  // BLOQUE get: Recibe datos de la ruta y delega get al servicio; los decoradores definen HTTP, documentación y permisos.
  @Get(':id') @ApiOperation({ summary: 'Detalle y comprobante de pedido autorizado' })
  get(@Param('id', ParseIntPipe) id: number, @CurrentUser() actor: Actor) { return this.service.get(id, actor); }
  // BLOQUE pay: Recibe datos de la ruta y delega pay al servicio; los decoradores definen HTTP, documentación y permisos.
  @Post(':id/payment') @Roles('ADMIN') @ApiOperation({ summary: 'Registrar pago completo verificado de un pedido WEB/SOCIAL' })
  pay(@Param('id', ParseIntPipe) id: number, @Body() dto: PaymentDto, @CurrentUser() actor: Actor) { return this.service.pay(id, dto, actor); }
  // BLOQUE status: Recibe datos de la ruta y delega transition al servicio; los decoradores definen HTTP, documentación y permisos.
  @Patch(':id/status') @Roles('ADMIN') @ApiOperation({ summary: 'Avanzar de pagado a en camino y después entregado' })
  status(@Param('id', ParseIntPipe) id: number, @Body() dto: OrderStatusDto) { return this.service.transition(id, dto.status); }
  // BLOQUE cancel: Recibe datos de la ruta y delega cancel al servicio; los decoradores definen HTTP, documentación y permisos.
  @Post(':id/cancel') @Roles('ADMIN', 'CUSTOMER') @ApiOperation({ summary: 'Cancelar pedido pendiente sin pago y reponer stock una sola vez' })
  cancel(@Param('id', ParseIntPipe) id: number, @CurrentUser() actor: Actor) { return this.service.cancel(id, actor); }
}
