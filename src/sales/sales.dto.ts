import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength, IsDateString, Matches } from 'class-validator';
import { SalesChannel, PaymentMethod, OrderStatus } from '../generated/prisma/enums';
import { PageDto } from '../common/dto';
// CREACIÓN: el canal determina permisos y si hace falta logística o caja.
export class CartDto {
  @ApiProperty({ enum: SalesChannel, example: 'WEB' }) @IsEnum(SalesChannel) channel: SalesChannel;
}
export class CartItemDto {
  @ApiProperty({ example: 1 }) @IsInt() @Min(1) productId: number;
  @ApiProperty({ example: 2 }) @IsInt() @Min(1) @Max(10000) quantity: number;
}
export class CheckoutDto {
  @ApiProperty({ example: 'compra-demo-001', description: 'Clave única para reintentos de esta misma confirmación' }) @IsString() @MinLength(8) @MaxLength(100) idempotencyKey: string;
  @ApiPropertyOptional({ description: 'Obligatorio en POS', example: 1 }) @IsOptional() @IsInt() @Min(1) cashSessionId?: number;
  @ApiPropertyOptional({ enum: PaymentMethod, description: 'Obligatorio en POS' }) @IsOptional() @IsEnum(PaymentMethod) paymentMethod?: PaymentMethod;
  @ApiPropertyOptional({ description: 'Dirección propia para compra WEB' }) @IsOptional() @IsInt() @Min(1) addressId?: number;
  @ApiPropertyOptional({ description: 'Destinatario del pedido SOCIAL' }) @IsOptional() @IsString() @MinLength(2) @MaxLength(150) recipientName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(5) @MaxLength(30) recipientPhone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(5) @MaxLength(500) deliveryAddress?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) deliveryReference?: string;
}
export class PaymentDto {
  @ApiProperty({ enum: PaymentMethod }) @IsEnum(PaymentMethod) method: PaymentMethod;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(150) reference?: string;
}
export class OrderStatusDto {
  @ApiProperty({ enum: ['IN_TRANSIT', 'DELIVERED'] }) @IsEnum({ IN_TRANSIT: 'IN_TRANSIT', DELIVERED: 'DELIVERED' }) status: 'IN_TRANSIT' | 'DELIVERED';
}
export class OrdersQuery extends PageDto {
  @ApiPropertyOptional({ enum: SalesChannel }) @IsOptional() @IsEnum(SalesChannel) channel?: SalesChannel;
  @ApiPropertyOptional({ enum: OrderStatus }) @IsOptional() @IsEnum(OrderStatus) status?: OrderStatus;
  @ApiPropertyOptional({ example: '2026-09-29', description: 'Día comercial en Guatemala (UTC-6)' }) @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) @IsDateString() date?: string;
}
