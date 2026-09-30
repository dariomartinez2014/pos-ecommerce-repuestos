import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength, NotEquals } from 'class-validator';
import { Type } from 'class-transformer';
import { PageDto } from '../common/dto';
// DTOs: los precios tienen dos decimales y las unidades son enteras.
export class CategoryDto {
  @ApiProperty({ example: 'Frenos' }) @IsString() @MinLength(2) @MaxLength(100) name: string;
}
export class ProductDto {
  @ApiProperty({ example: 1 }) @IsInt() @Min(1) categoryId: number;
  @ApiProperty({ example: 'FRE-001' }) @IsString() @MinLength(1) @MaxLength(60) sku: string;
  @ApiProperty({ example: 'Pastillas de freno delanteras' }) @IsString() @MinLength(2) @MaxLength(150) name: string;
  @ApiPropertyOptional({ example: 'Juego de pastillas; verificar compatibilidad del vehículo' }) @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @ApiProperty({ example: 125 }) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(99999999) acquisitionCost: number;
  @ApiProperty({ example: 195 }) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0.01) @Max(99999999) salePrice: number;
}
export class UpdateProductDto extends PartialType(ProductDto) {
  @ApiPropertyOptional() @IsOptional() @IsBoolean() active?: boolean;
}
export class StockDto {
  @ApiProperty({ example: 10, description: 'Positivo agrega; negativo retira existencias' }) @IsInt() @Min(-1000000) @Max(1000000) @NotEquals(0) delta: number;
  @ApiProperty({ example: 'Ingreso por compra a proveedor' }) @IsString() @MinLength(5) @MaxLength(500) reason: string;
}
export class CatalogQuery extends PageDto {
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) categoryId?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) search?: string;
}
