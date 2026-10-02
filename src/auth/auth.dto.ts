// ARCHIVO: Declara contratos de entrada, validadores y ejemplos Swagger. Un tipo TypeScript solo no valida un JSON recibido.
// ESTUDIO: consulta docs/GUIA-CODIGO-COMPLETA.md para recorrer este archivo.
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength, IsBoolean } from 'class-validator';
import { UserRole } from '../generated/prisma/enums';

// ENTRADAS: el registro público no contiene un campo role.
// CLASE LoginDto: contrato de entrada cuyos decoradores comprueban los datos recibidos.
export class LoginDto {
  // CAMPO email: string; declarado en el contrato. Los decoradores de abajo documentan y validan este valor.
  @ApiProperty({ example: 'cliente@demo.local' }) @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value) @IsEmail() @MaxLength(254)
  email: string;
  // CAMPO password: string; declarado en el contrato. Los decoradores de abajo documentan y validan este valor.
  @ApiProperty({ minLength: 10, example: 'TuClaveDeDemo123!' }) @IsString() @MinLength(10) @MaxLength(64)
  password: string;
}
// CLASE RegisterDto: contrato de entrada cuyos decoradores comprueban los datos recibidos.
export class RegisterDto extends LoginDto {
  // CAMPO name: string; declarado en el contrato. Los decoradores de abajo documentan y validan este valor.
  @ApiProperty({ example: 'Ana López' }) @IsString() @MinLength(2) @MaxLength(150)
  name: string;
  // CAMPO phone: string; opcional. Los decoradores de abajo documentan y validan este valor.
  @ApiPropertyOptional({ example: '5555-0101' }) @IsOptional() @IsString() @MaxLength(30)
  phone?: string;
}
// CLASE CreateStaffDto: contrato de entrada cuyos decoradores comprueban los datos recibidos.
export class CreateStaffDto extends RegisterDto {
  // CAMPO role: UserRole; declarado en el contrato. Los decoradores de abajo documentan y validan este valor.
  @ApiProperty({ enum: UserRole }) @IsEnum(UserRole)
  role: UserRole;
}
// CLASE ActiveDto: contrato de entrada cuyos decoradores comprueban los datos recibidos.
export class ActiveDto {
  // CAMPO active: boolean; declarado en el contrato. Los decoradores de abajo documentan y validan este valor.
  @ApiProperty() @IsBoolean()
  active: boolean;
}
