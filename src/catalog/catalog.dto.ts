// Declara contratos de entrada, validadores y ejemplos Swagger. Un tipo TypeScript solo no valida un JSON recibido.

import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength, NotEquals } from 'class-validator';
import { Type } from 'class-transformer';
import { PageDto } from '../common/dto';
// DTOs: los precios tienen dos decimales y las unidades son enteras.

export class CategoryDto {
  // Nombre del usuario o del registro.
  @ApiProperty({ example: 'Frenos' }) @IsString() @MinLength(2) @MaxLength(100) name: string;
}

export class ProductDto {
  // Categoría a la que pertenece el repuesto.
  @ApiProperty({ example: 1 }) @IsInt() @Min(1) categoryId: number;
  // Código único del repuesto.
  @ApiProperty({ example: 'FRE-001' }) @IsString() @MinLength(1) @MaxLength(60) sku: string;
  // Nombre del usuario o del registro.
  @ApiProperty({ example: 'Pastillas de freno delanteras' }) @IsString() @MinLength(2) @MaxLength(150) name: string;
  // Descripción opcional del repuesto.
  @ApiPropertyOptional({ example: 'Juego de pastillas; verificar compatibilidad del vehículo' }) @IsOptional() @IsString() @MaxLength(2000) description?: string;
  // Costo de compra; solo debe verlo el administrador.
  @ApiProperty({ example: 125 }) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(99999999) acquisitionCost: number;
  // Precio de venta usado para calcular el total.
  @ApiProperty({ example: 195 }) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0.01) @Max(99999999) salePrice: number;
}

export class UpdateProductDto extends PartialType(ProductDto) {
  // Indica si la cuenta o el registro sigue disponible.
  @ApiPropertyOptional() @IsOptional() @IsBoolean() active?: boolean;
}

export class StockDto {
  // Un número positivo agrega stock y uno negativo lo retira.
  @ApiProperty({ example: 10, description: 'Positivo agrega; negativo retira existencias' }) @IsInt() @Min(-1000000) @Max(1000000) @NotEquals(0) delta: number;
  // Motivo del ajuste de inventario.
  @ApiProperty({ example: 'Ingreso por compra a proveedor' }) @IsString() @MinLength(5) @MaxLength(500) reason: string;
}

export class CatalogQuery extends PageDto {
  // Categoría a la que pertenece el repuesto.
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) categoryId?: number;
  // Texto para buscar por nombre o código.
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) search?: string;
}
