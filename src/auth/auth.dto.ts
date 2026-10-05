// Declara contratos de entrada, validadores y ejemplos Swagger. Un tipo TypeScript solo no valida un JSON recibido.

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength, IsBoolean } from 'class-validator';
import { UserRole } from '../generated/prisma/enums';

// el registro público no contiene un campo role.

export class LoginDto {
  // Correo que usamos para iniciar sesión.
  @ApiProperty({ example: 'cliente@demo.local' }) @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value) @IsEmail() @MaxLength(254)
  email: string;
  // Contraseña que llega en la petición; después se compara o se guarda como hash.
  @ApiProperty({ minLength: 10, example: 'TuClaveDeDemo123!' }) @IsString() @MinLength(10) @MaxLength(64)
  password: string;
}

export class RegisterDto extends LoginDto {
  // Nombre del usuario o del registro.
  @ApiProperty({ example: 'Ana López' }) @IsString() @MinLength(2) @MaxLength(150)
  name: string;
  // Teléfono de contacto.
  @ApiPropertyOptional({ example: '5555-0101' }) @IsOptional() @IsString() @MaxLength(30)
  phone?: string;
}

export class CreateStaffDto extends RegisterDto {
  // Rol que determina los permisos del usuario.
  @ApiProperty({ enum: UserRole }) @IsEnum(UserRole)
  role: UserRole;
}

export class ActiveDto {
  // Indica si la cuenta o el registro sigue disponible.
  @ApiProperty() @IsBoolean()
  active: boolean;
}
