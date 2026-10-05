// Declara contratos de entrada, validadores y ejemplos Swagger. Un tipo TypeScript solo no valida un JSON recibido.

import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
// únicamente el dueño puede consultarla o modificarla.

export class AddressDto {
  // Nombre de quien recibirá el pedido.
  @ApiProperty({ example: 'Ana López' }) @IsString() @MinLength(2) @MaxLength(150) recipientName: string;
  // Teléfono de contacto.
  @ApiProperty({ example: '5555-0101' }) @IsString() @MinLength(5) @MaxLength(30) phone: string;
  // Dirección guardada por el cliente.
  @ApiProperty({ example: 'Zona 1, Ciudad de Guatemala' }) @IsString() @MinLength(5) @MaxLength(500) addressLine: string;
  // Referencia opcional para identificar la dirección o el pago.
  @ApiPropertyOptional({ example: 'Portón azul' }) @IsOptional() @IsString() @MaxLength(500) reference?: string;
}

export class UpdateAddressDto extends PartialType(AddressDto) {}
