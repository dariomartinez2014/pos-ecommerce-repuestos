// ARCHIVO: Recibe solicitudes HTTP, valida parámetros con DTO/Pipes y delega reglas en servicios.
// ESTUDIO: consulta docs/GUIA-CODIGO-COMPLETA.md para recorrer este archivo.
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Actor, CurrentUser, Public, Roles } from '../common/security';
import { CategoriesService } from './categories.service';
import { CatalogService } from './catalog.service';
import { CatalogQuery, CategoryDto, ProductDto, StockDto, UpdateProductDto } from './catalog.dto';

// CONTROLLERS: declaran rutas, permisos y DTOs; delegan reglas en el servicio.
// CLASE ProductsController: Recibe solicitudes HTTP, valida parámetros con DTO/Pipes y delega reglas en servicios.
@ApiTags('Catálogo') @Controller('products')
export class ProductsController {
  // BLOQUE constructor: Inyecta las dependencias necesarias; NestJS proporciona estas instancias al construir la clase.
  constructor(private readonly service: CatalogService) {}
  // BLOQUE list: Recibe datos de la ruta y delega list al servicio; los decoradores definen HTTP, documentación y permisos.
  @Public() @Get() @ApiOperation({ summary: 'Catálogo público paginado, sin costos internos' })
  list(@Query() q: CatalogQuery) { return this.service.list(q); }
  // BLOQUE internal: Recibe datos de la ruta y delega list al servicio; los decoradores definen HTTP, documentación y permisos.
  @Get('internal') @Roles('ADMIN') @ApiBearerAuth() @ApiOperation({ summary: 'Catálogo administrativo con costos y productos inactivos' })
  internal(@Query() q: CatalogQuery) { return this.service.list(q, true); }
  // BLOQUE get: Recibe datos de la ruta y delega get al servicio; los decoradores definen HTTP, documentación y permisos.
  @Public() @Get(':id') @ApiOperation({ summary: 'Consultar producto disponible en catálogo' })
  get(@Param('id', ParseIntPipe) id: number) { return this.service.get(id); }
  // BLOQUE create: Recibe datos de la ruta y delega create al servicio; los decoradores definen HTTP, documentación y permisos.
  @Post() @Roles('ADMIN') @ApiBearerAuth() @ApiOperation({ summary: 'Crear repuesto con stock inicial cero' })
  create(@Body() dto: ProductDto) { return this.service.create(dto); }
  // BLOQUE update: Recibe datos de la ruta y delega update al servicio; los decoradores definen HTTP, documentación y permisos.
  @Patch(':id') @Roles('ADMIN') @ApiBearerAuth() @ApiOperation({ summary: 'Editar repuesto; no modifica ventas anteriores' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) { return this.service.update(id, dto); }
  // BLOQUE remove: Recibe datos de la ruta y delega update al servicio; los decoradores definen HTTP, documentación y permisos.
  @Delete(':id') @Roles('ADMIN') @ApiBearerAuth() @ApiOperation({ summary: 'Retirar del catálogo preservando su historial' })
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.update(id, { active: false }); }
  // BLOQUE stock: Recibe datos de la ruta y delega adjust al servicio; los decoradores definen HTTP, documentación y permisos.
  @Post(':id/stock') @Roles('ADMIN') @ApiBearerAuth() @ApiOperation({ summary: 'Ajustar inventario con motivo y trazabilidad' })
  stock(@Param('id', ParseIntPipe) id: number, @Body() dto: StockDto, @CurrentUser() actor: Actor) { return this.service.adjust(id, dto, actor.id); }
}
// CLASE CategoriesController: Recibe solicitudes HTTP, valida parámetros con DTO/Pipes y delega reglas en servicios.
@ApiTags('Categorías') @Controller('categories')
export class CategoriesController {
  // BLOQUE constructor: Inyecta las dependencias necesarias; NestJS proporciona estas instancias al construir la clase.
  constructor(private readonly service: CategoriesService) {}
  // BLOQUE list: Recibe datos de la ruta y delega list al servicio; los decoradores definen HTTP, documentación y permisos.
  @Public() @Get() @ApiOperation({ summary: 'Listar categorías activas' })
  list() { return this.service.list(); }
  // BLOQUE create: Recibe datos de la ruta y delega create al servicio; los decoradores definen HTTP, documentación y permisos.
  @Post() @Roles('ADMIN') @ApiBearerAuth() @ApiOperation({ summary: 'Crear categoría' })
  create(@Body() dto: CategoryDto) { return this.service.create(dto); }
  // BLOQUE update: Recibe datos de la ruta y delega update al servicio; los decoradores definen HTTP, documentación y permisos.
  @Patch(':id') @Roles('ADMIN') @ApiBearerAuth() @ApiOperation({ summary: 'Renombrar categoría' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: CategoryDto) { return this.service.update(id, dto); }
  // BLOQUE remove: Recibe datos de la ruta y delega remove al servicio; los decoradores definen HTTP, documentación y permisos.
  @Delete(':id') @Roles('ADMIN') @ApiBearerAuth() @ApiOperation({ summary: 'Desactivar categoría y ocultarla del catálogo público' })
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
