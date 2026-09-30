import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
// DIRECCIÓN PERSONAL: únicamente el dueño puede consultarla o modificarla.
export class AddressDto {
  @ApiProperty({ example: 'Ana López' }) @IsString() @MinLength(2) @MaxLength(150) recipientName: string;
  @ApiProperty({ example: '5555-0101' }) @IsString() @MinLength(5) @MaxLength(30) phone: string;
  @ApiProperty({ example: 'Zona 1, Ciudad de Guatemala' }) @IsString() @MinLength(5) @MaxLength(500) addressLine: string;
  @ApiPropertyOptional({ example: 'Portón azul' }) @IsOptional() @IsString() @MaxLength(500) reference?: string;
}
export class UpdateAddressDto extends PartialType(AddressDto) {}
