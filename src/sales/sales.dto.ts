// Declara contratos de entrada, validadores y ejemplos Swagger. Un tipo TypeScript solo no valida un JSON recibido.

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength, IsDateString, Matches } from 'class-validator';
import { SalesChannel, PaymentMethod, OrderStatus } from '../generated/prisma/enums';
import { PageDto } from '../common/dto';
// el canal determina permisos y si hace falta logística o caja.

export class CartDto {
  // Canal de venta: mostrador, web o redes sociales.
  @ApiProperty({ enum: SalesChannel, example: 'WEB' }) @IsEnum(SalesChannel) channel: SalesChannel;
}

export class CartItemDto {
  // Identificador del repuesto.
  @ApiProperty({ example: 1 }) @IsInt() @Min(1) productId: number;
  // Cantidad de unidades que se quieren comprar.
  @ApiProperty({ example: 2 }) @IsInt() @Min(1) @Max(10000) quantity: number;
}

export class CheckoutDto {
  // Esta clave permite repetir la confirmación sin crear otra compra.
  @ApiProperty({ example: 'compra-demo-001', description: 'Clave única para reintentos de esta misma confirmación' }) @IsString() @MinLength(8) @MaxLength(100) idempotencyKey: string;
  // Caja en la que se registra la venta de mostrador.
  @ApiPropertyOptional({ description: 'Obligatorio en POS', example: 1 }) @IsOptional() @IsInt() @Min(1) cashSessionId?: number;
  // Método de pago usado en la venta POS.
  @ApiPropertyOptional({ enum: PaymentMethod, description: 'Obligatorio en POS' }) @IsOptional() @IsEnum(PaymentMethod) paymentMethod?: PaymentMethod;
  // Dirección del cliente que se usará para enviar el pedido.
  @ApiPropertyOptional({ description: 'Dirección propia para compra WEB' }) @IsOptional() @IsInt() @Min(1) addressId?: number;
  // Nombre de quien recibirá el pedido.
  @ApiPropertyOptional({ description: 'Destinatario del pedido SOCIAL' }) @IsOptional() @IsString() @MinLength(2) @MaxLength(150) recipientName?: string;
  // Teléfono de quien recibirá el pedido.
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(5) @MaxLength(30) recipientPhone?: string;
  // Dirección de entrega del pedido.
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(5) @MaxLength(500) deliveryAddress?: string;
  // Referencia para encontrar la dirección de entrega.
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) deliveryReference?: string;
}

export class PaymentDto {
  // Forma de pago: efectivo, tarjeta o transferencia.
  @ApiProperty({ enum: PaymentMethod }) @IsEnum(PaymentMethod) method: PaymentMethod;
  // Referencia opcional para identificar la dirección o el pago.
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(150) reference?: string;
}

export class OrderStatusDto {
  // Estado permitido para esta operación.
  @ApiProperty({ enum: ['IN_TRANSIT', 'DELIVERED'] }) @IsEnum({ IN_TRANSIT: 'IN_TRANSIT', DELIVERED: 'DELIVERED' }) status: 'IN_TRANSIT' | 'DELIVERED';
}

export class OrdersQuery extends PageDto {
  // Canal de venta: mostrador, web o redes sociales.
  @ApiPropertyOptional({ enum: SalesChannel }) @IsOptional() @IsEnum(SalesChannel) channel?: SalesChannel;
  // Estado permitido para esta operación.
  @ApiPropertyOptional({ enum: OrderStatus }) @IsOptional() @IsEnum(OrderStatus) status?: OrderStatus;
  // Día de Guatemala que queremos consultar.
  @ApiPropertyOptional({ example: '2026-09-29', description: 'Día comercial en Guatemala (UTC-6)' }) @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) @IsDateString() date?: string;
}
