// ARCHIVO: Declara contratos de entrada, validadores y ejemplos Swagger. Un tipo TypeScript solo no valida un JSON recibido.
// ESTUDIO: consulta docs/GUIA-CODIGO-COMPLETA.md para recorrer este archivo.
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength, NotEquals } from 'class-validator';
import { Type } from 'class-transformer';
import { PageDto } from '../common/dto';
// DTOs: los precios tienen dos decimales y las unidades son enteras.
// CLASE CategoryDto: contrato de entrada cuyos decoradores comprueban los datos recibidos.
export class CategoryDto {
  // CAMPO name: string; declarado en el contrato. Los decoradores de abajo documentan y validan este valor.
  @ApiProperty({ example: 'Frenos' }) @IsString() @MinLength(2) @MaxLength(100) name: string;
}
// CLASE ProductDto: contrato de entrada cuyos decoradores comprueban los datos recibidos.
export class ProductDto {
  // CAMPO categoryId: number; declarado en el contrato. Los decoradores de abajo documentan y validan este valor.
  @ApiProperty({ example: 1 }) @IsInt() @Min(1) categoryId: number;
  // CAMPO sku: string; declarado en el contrato. Los decoradores de abajo documentan y validan este valor.
  @ApiProperty({ example: 'FRE-001' }) @IsString() @MinLength(1) @MaxLength(60) sku: string;
  // CAMPO name: string; declarado en el contrato. Los decoradores de abajo documentan y validan este valor.
  @ApiProperty({ example: 'Pastillas de freno delanteras' }) @IsString() @MinLength(2) @MaxLength(150) name: string;
  // CAMPO description: string; opcional. Los decoradores de abajo documentan y validan este valor.
  @ApiPropertyOptional({ example: 'Juego de pastillas; verificar compatibilidad del vehículo' }) @IsOptional() @IsString() @MaxLength(2000) description?: string;
  // CAMPO acquisitionCost: number; declarado en el contrato. Los decoradores de abajo documentan y validan este valor.
  @ApiProperty({ example: 125 }) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(99999999) acquisitionCost: number;
  // CAMPO salePrice: number; declarado en el contrato. Los decoradores de abajo documentan y validan este valor.
  @ApiProperty({ example: 195 }) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0.01) @Max(99999999) salePrice: number;
}
// CLASE UpdateProductDto: contrato de entrada cuyos decoradores comprueban los datos recibidos.
export class UpdateProductDto extends PartialType(ProductDto) {
  // CAMPO active: boolean; opcional. Los decoradores de abajo documentan y validan este valor.
  @ApiPropertyOptional() @IsOptional() @IsBoolean() active?: boolean;
}
// CLASE StockDto: contrato de entrada cuyos decoradores comprueban los datos recibidos.
export class StockDto {
  // CAMPO delta: number; declarado en el contrato. Los decoradores de abajo documentan y validan este valor.
  @ApiProperty({ example: 10, description: 'Positivo agrega; negativo retira existencias' }) @IsInt() @Min(-1000000) @Max(1000000) @NotEquals(0) delta: number;
  // CAMPO reason: string; declarado en el contrato. Los decoradores de abajo documentan y validan este valor.
  @ApiProperty({ example: 'Ingreso por compra a proveedor' }) @IsString() @MinLength(5) @MaxLength(500) reason: string;
}
// CLASE CatalogQuery: contrato de entrada cuyos decoradores comprueban los datos recibidos.
export class CatalogQuery extends PageDto {
  // CAMPO categoryId: number; opcional. Los decoradores de abajo documentan y validan este valor.
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) categoryId?: number;
  // CAMPO search: string; opcional. Los decoradores de abajo documentan y validan este valor.
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) search?: string;
}
