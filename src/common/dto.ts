// Valida page y limit para compartir paginación entre catálogo y pedidos.

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
// limita lecturas para evitar descargar todo el catálogo por accidente.

export class PageDto {
  // Swagger necesita el tipo explícito porque este campo tiene un valor inicial.
  @ApiPropertyOptional({ type: Number, default: 1, minimum: 1 }) @Type(() => Number) @IsInt() @Min(1)
  page = 1;
  @ApiPropertyOptional({ type: Number, default: 20, maximum: 100 }) @Type(() => Number) @IsInt() @Min(1) @Max(100)
  limit = 20;
}
