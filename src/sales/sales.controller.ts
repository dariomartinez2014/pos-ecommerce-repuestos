// Recibe solicitudes HTTP, valida parámetros con DTO/Pipes y delega reglas en servicios.

import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Actor, CurrentUser, Roles } from '../common/security';
import { CartDto, CartItemDto, CheckoutDto, OrdersQuery, OrderStatusDto, PaymentDto } from './sales.dto';
import { SalesService } from './sales.service';
// un mismo flujo prepara ventas POS, compras WEB y pedidos SOCIAL.

@ApiTags('Carritos y checkout') @ApiBearerAuth() @Controller('carts')
export class CartsController {
  
  constructor(private readonly service: SalesService) {}
  // Pasa los datos de esta ruta al método createCart del servicio.
  @Post() @ApiOperation({ summary: 'Abrir carrito según el canal permitido al usuario' })
  create(@Body() dto: CartDto, @CurrentUser() actor: Actor) { return this.service.createCart(dto, actor); }
  // Pasa los datos de esta ruta al método cart del servicio.
  @Get(':id') @ApiOperation({ summary: 'Consultar mi carrito' })
  get(@Param('id', ParseIntPipe) id: number, @CurrentUser() actor: Actor) { return this.service.cart(id, actor); }
  // Pasa los datos de esta ruta al método setItem del servicio.
  @Put(':id/items') @ApiOperation({ summary: 'Agregar producto o reemplazar su cantidad; no reserva stock' })
  item(@Param('id', ParseIntPipe) id: number, @Body() dto: CartItemDto, @CurrentUser() actor: Actor) { return this.service.setItem(id, dto, actor); }
  // Pasa los datos de esta ruta al método removeItem del servicio.
  @Delete(':id/items/:productId') @ApiOperation({ summary: 'Retirar producto del carrito abierto' })
  remove(@Param('id', ParseIntPipe) id: number, @Param('productId', ParseIntPipe) productId: number, @CurrentUser() actor: Actor) { return this.service.removeItem(id, productId, actor); }
  // Pasa los datos de esta ruta al método checkout del servicio.
  @Post(':id/checkout') @ApiOperation({ summary: 'Confirmar compra transaccional con clave de idempotencia' })
  checkout(@Param('id', ParseIntPipe) id: number, @Body() dto: CheckoutDto, @CurrentUser() actor: Actor) { return this.service.checkout(id, dto, actor); }
}

@ApiTags('Pedidos y logística') @ApiBearerAuth() @Controller('orders')
export class OrdersController {
  
  constructor(private readonly service: SalesService) {}
  // Pasa los datos de esta ruta al método list del servicio.
  @Get() @ApiOperation({ summary: 'Historial propio o cola administrativa filtrada por estado/canal/día' })
  list(@Query() q: OrdersQuery, @CurrentUser() actor: Actor) { return this.service.list(q, actor); }
  // Pasa los datos de esta ruta al método get del servicio.
  @Get(':id') @ApiOperation({ summary: 'Detalle y comprobante de pedido autorizado' })
  get(@Param('id', ParseIntPipe) id: number, @CurrentUser() actor: Actor) { return this.service.get(id, actor); }
  // Pasa los datos de esta ruta al método pay del servicio.
  @Post(':id/payment') @Roles('ADMIN') @ApiOperation({ summary: 'Registrar pago completo verificado de un pedido WEB/SOCIAL' })
  pay(@Param('id', ParseIntPipe) id: number, @Body() dto: PaymentDto, @CurrentUser() actor: Actor) { return this.service.pay(id, dto, actor); }
  // Pasa los datos de esta ruta al método transition del servicio.
  @Patch(':id/status') @Roles('ADMIN') @ApiOperation({ summary: 'Avanzar de pagado a en camino y después entregado' })
  status(@Param('id', ParseIntPipe) id: number, @Body() dto: OrderStatusDto) { return this.service.transition(id, dto.status); }
  // Pasa los datos de esta ruta al método cancel del servicio.
  @Post(':id/cancel') @Roles('ADMIN', 'CUSTOMER') @ApiOperation({ summary: 'Cancelar pedido pendiente sin pago y reponer stock una sola vez' })
  cancel(@Param('id', ParseIntPipe) id: number, @CurrentUser() actor: Actor) { return this.service.cancel(id, actor); }
}
