import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength, IsBoolean } from 'class-validator';
import { UserRole } from '../generated/prisma/enums';

// ENTRADAS: el registro público no contiene un campo role.
export class LoginDto {
  @ApiProperty({ example: 'cliente@demo.local' }) @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value) @IsEmail() @MaxLength(254)
  email: string;
  @ApiProperty({ minLength: 10, example: 'TuClaveDeDemo123!' }) @IsString() @MinLength(10) @MaxLength(64)
  password: string;
}
export class RegisterDto extends LoginDto {
  @ApiProperty({ example: 'Ana López' }) @IsString() @MinLength(2) @MaxLength(150)
  name: string;
  @ApiPropertyOptional({ example: '5555-0101' }) @IsOptional() @IsString() @MaxLength(30)
  phone?: string;
}
export class CreateStaffDto extends RegisterDto {
  @ApiProperty({ enum: UserRole }) @IsEnum(UserRole)
  role: UserRole;
}
export class ActiveDto {
  @ApiProperty() @IsBoolean()
  active: boolean;
}
