// ARCHIVO: Valida page y limit para compartir paginación entre catálogo y pedidos.
// ESTUDIO: consulta docs/GUIA-CODIGO-COMPLETA.md para recorrer este archivo.
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
// PAGINACIÓN: limita lecturas para evitar descargar todo el catálogo por accidente.
// CLASE PageDto: Valida page y limit para compartir paginación entre catálogo y pedidos.
export class PageDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 }) @Type(() => Number) @IsInt() @Min(1)
  page = 1;
  @ApiPropertyOptional({ default: 20, maximum: 100 }) @Type(() => Number) @IsInt() @Min(1) @Max(100)
  limit = 20;
}
