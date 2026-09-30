import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Actor, CurrentUser, Public, Roles } from '../common/security';
import { CategoriesService } from './categories.service';
import { CatalogService } from './catalog.service';
import { CatalogQuery, CategoryDto, ProductDto, StockDto, UpdateProductDto } from './catalog.dto';

// CONTROLLERS: declaran rutas, permisos y DTOs; delegan reglas en el servicio.
@ApiTags('Catálogo') @Controller('products')
export class ProductsController {
  constructor(private readonly service: CatalogService) {}
  @Public() @Get() @ApiOperation({ summary: 'Catálogo público paginado, sin costos internos' })
  list(@Query() q: CatalogQuery) { return this.service.list(q); }
  @Get('internal') @Roles('ADMIN') @ApiBearerAuth() @ApiOperation({ summary: 'Catálogo administrativo con costos y productos inactivos' })
  internal(@Query() q: CatalogQuery) { return this.service.list(q, true); }
  @Public() @Get(':id') @ApiOperation({ summary: 'Consultar producto disponible en catálogo' })
  get(@Param('id', ParseIntPipe) id: number) { return this.service.get(id); }
  @Post() @Roles('ADMIN') @ApiBearerAuth() @ApiOperation({ summary: 'Crear repuesto con stock inicial cero' })
  create(@Body() dto: ProductDto) { return this.service.create(dto); }
  @Patch(':id') @Roles('ADMIN') @ApiBearerAuth() @ApiOperation({ summary: 'Editar repuesto; no modifica ventas anteriores' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) { return this.service.update(id, dto); }
  @Delete(':id') @Roles('ADMIN') @ApiBearerAuth() @ApiOperation({ summary: 'Retirar del catálogo preservando su historial' })
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.update(id, { active: false }); }
  @Post(':id/stock') @Roles('ADMIN') @ApiBearerAuth() @ApiOperation({ summary: 'Ajustar inventario con motivo y trazabilidad' })
  stock(@Param('id', ParseIntPipe) id: number, @Body() dto: StockDto, @CurrentUser() actor: Actor) { return this.service.adjust(id, dto, actor.id); }
}
@ApiTags('Categorías') @Controller('categories')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}
  @Public() @Get() @ApiOperation({ summary: 'Listar categorías activas' })
  list() { return this.service.list(); }
  @Post() @Roles('ADMIN') @ApiBearerAuth() @ApiOperation({ summary: 'Crear categoría' })
  create(@Body() dto: CategoryDto) { return this.service.create(dto); }
  @Patch(':id') @Roles('ADMIN') @ApiBearerAuth() @ApiOperation({ summary: 'Renombrar categoría' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: CategoryDto) { return this.service.update(id, dto); }
  @Delete(':id') @Roles('ADMIN') @ApiBearerAuth() @ApiOperation({ summary: 'Desactivar categoría y ocultarla del catálogo público' })
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
