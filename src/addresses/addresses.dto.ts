// ARCHIVO: Declara contratos de entrada, validadores y ejemplos Swagger. Un tipo TypeScript solo no valida un JSON recibido.
// ESTUDIO: consulta docs/GUIA-CODIGO-COMPLETA.md para recorrer este archivo.
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
// DIRECCIÓN PERSONAL: únicamente el dueño puede consultarla o modificarla.
// CLASE AddressDto: contrato de entrada cuyos decoradores comprueban los datos recibidos.
export class AddressDto {
  // CAMPO recipientName: string; declarado en el contrato. Los decoradores de abajo documentan y validan este valor.
  @ApiProperty({ example: 'Ana López' }) @IsString() @MinLength(2) @MaxLength(150) recipientName: string;
  // CAMPO phone: string; declarado en el contrato. Los decoradores de abajo documentan y validan este valor.
  @ApiProperty({ example: '5555-0101' }) @IsString() @MinLength(5) @MaxLength(30) phone: string;
  // CAMPO addressLine: string; declarado en el contrato. Los decoradores de abajo documentan y validan este valor.
  @ApiProperty({ example: 'Zona 1, Ciudad de Guatemala' }) @IsString() @MinLength(5) @MaxLength(500) addressLine: string;
  // CAMPO reference: string; opcional. Los decoradores de abajo documentan y validan este valor.
  @ApiPropertyOptional({ example: 'Portón azul' }) @IsOptional() @IsString() @MaxLength(500) reference?: string;
}
// CLASE UpdateAddressDto: contrato de entrada cuyos decoradores comprueban los datos recibidos.
export class UpdateAddressDto extends PartialType(AddressDto) {}
