// ARCHIVO: Declara contratos de entrada, validadores y ejemplos Swagger. Un tipo TypeScript solo no valida un JSON recibido.
// ESTUDIO: consulta docs/GUIA-CODIGO-COMPLETA.md para recorrer este archivo.
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength, IsDateString, Matches } from 'class-validator';
import { SalesChannel, PaymentMethod, OrderStatus } from '../generated/prisma/enums';
import { PageDto } from '../common/dto';
// CREACIÓN: el canal determina permisos y si hace falta logística o caja.
// CLASE CartDto: contrato de entrada cuyos decoradores comprueban los datos recibidos.
export class CartDto {
  // CAMPO channel: SalesChannel; declarado en el contrato. Los decoradores de abajo documentan y validan este valor.
  @ApiProperty({ enum: SalesChannel, example: 'WEB' }) @IsEnum(SalesChannel) channel: SalesChannel;
}
// CLASE CartItemDto: contrato de entrada cuyos decoradores comprueban los datos recibidos.
export class CartItemDto {
  // CAMPO productId: number; declarado en el contrato. Los decoradores de abajo documentan y validan este valor.
  @ApiProperty({ example: 1 }) @IsInt() @Min(1) productId: number;
  // CAMPO quantity: number; declarado en el contrato. Los decoradores de abajo documentan y validan este valor.
  @ApiProperty({ example: 2 }) @IsInt() @Min(1) @Max(10000) quantity: number;
}
// CLASE CheckoutDto: contrato de entrada cuyos decoradores comprueban los datos recibidos.
export class CheckoutDto {
  // CAMPO idempotencyKey: string; declarado en el contrato. Los decoradores de abajo documentan y validan este valor.
  @ApiProperty({ example: 'compra-demo-001', description: 'Clave única para reintentos de esta misma confirmación' }) @IsString() @MinLength(8) @MaxLength(100) idempotencyKey: string;
  // CAMPO cashSessionId: number; opcional. Los decoradores de abajo documentan y validan este valor.
  @ApiPropertyOptional({ description: 'Obligatorio en POS', example: 1 }) @IsOptional() @IsInt() @Min(1) cashSessionId?: number;
  // CAMPO paymentMethod: PaymentMethod; opcional. Los decoradores de abajo documentan y validan este valor.
  @ApiPropertyOptional({ enum: PaymentMethod, description: 'Obligatorio en POS' }) @IsOptional() @IsEnum(PaymentMethod) paymentMethod?: PaymentMethod;
  // CAMPO addressId: number; opcional. Los decoradores de abajo documentan y validan este valor.
  @ApiPropertyOptional({ description: 'Dirección propia para compra WEB' }) @IsOptional() @IsInt() @Min(1) addressId?: number;
  // CAMPO recipientName: string; opcional. Los decoradores de abajo documentan y validan este valor.
  @ApiPropertyOptional({ description: 'Destinatario del pedido SOCIAL' }) @IsOptional() @IsString() @MinLength(2) @MaxLength(150) recipientName?: string;
  // CAMPO recipientPhone: string; opcional. Los decoradores de abajo documentan y validan este valor.
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(5) @MaxLength(30) recipientPhone?: string;
  // CAMPO deliveryAddress: string; opcional. Los decoradores de abajo documentan y validan este valor.
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(5) @MaxLength(500) deliveryAddress?: string;
  // CAMPO deliveryReference: string; opcional. Los decoradores de abajo documentan y validan este valor.
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) deliveryReference?: string;
}
// CLASE PaymentDto: contrato de entrada cuyos decoradores comprueban los datos recibidos.
export class PaymentDto {
  // CAMPO method: PaymentMethod; declarado en el contrato. Los decoradores de abajo documentan y validan este valor.
  @ApiProperty({ enum: PaymentMethod }) @IsEnum(PaymentMethod) method: PaymentMethod;
  // CAMPO reference: string; opcional. Los decoradores de abajo documentan y validan este valor.
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(150) reference?: string;
}
// CLASE OrderStatusDto: contrato de entrada cuyos decoradores comprueban los datos recibidos.
export class OrderStatusDto {
  // CAMPO status: 'IN_TRANSIT' | 'DELIVERED'; declarado en el contrato. Los decoradores de abajo documentan y validan este valor.
  @ApiProperty({ enum: ['IN_TRANSIT', 'DELIVERED'] }) @IsEnum({ IN_TRANSIT: 'IN_TRANSIT', DELIVERED: 'DELIVERED' }) status: 'IN_TRANSIT' | 'DELIVERED';
}
// CLASE OrdersQuery: contrato de entrada cuyos decoradores comprueban los datos recibidos.
export class OrdersQuery extends PageDto {
  // CAMPO channel: SalesChannel; opcional. Los decoradores de abajo documentan y validan este valor.
  @ApiPropertyOptional({ enum: SalesChannel }) @IsOptional() @IsEnum(SalesChannel) channel?: SalesChannel;
  // CAMPO status: OrderStatus; opcional. Los decoradores de abajo documentan y validan este valor.
  @ApiPropertyOptional({ enum: OrderStatus }) @IsOptional() @IsEnum(OrderStatus) status?: OrderStatus;
  // CAMPO date: string; opcional. Los decoradores de abajo documentan y validan este valor.
  @ApiPropertyOptional({ example: '2026-09-29', description: 'Día comercial en Guatemala (UTC-6)' }) @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) @IsDateString() date?: string;
}
