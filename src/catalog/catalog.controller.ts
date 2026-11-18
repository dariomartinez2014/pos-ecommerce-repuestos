// Recibe solicitudes HTTP, valida parámetros con DTO/Pipes y delega reglas en servicios.

import { Body, Controller, Delete, Get, Header, Param, ParseIntPipe, Patch, Post, Query, StreamableFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Actor, CurrentUser, Public, Roles } from '../common/security';
import { CategoriesService } from './categories.service';
import { CatalogService } from './catalog.service';
import { CatalogQuery, CategoryDto, ProductDto, StockDto, UpdateProductDto } from './catalog.dto';

// La carga de fotos tiene los mismos límites al crear y al editar.
const CargaFotos = FilesInterceptor('imagenes', 5, { limits: { fileSize: 5 * 1024 * 1024, files: 5, fields: 10 } });

@ApiTags('Catálogo') @Controller('products')
export class ProductsController {
  
  constructor(private readonly service: CatalogService) {}
  // Pasa los datos de esta ruta al método list del servicio.
  @Public() @Get() @ApiOperation({ summary: 'Catálogo público paginado, sin costos internos' })
  list(@Query() q: CatalogQuery) { return this.service.list(q); }
  // Pasa los datos de esta ruta al método list del servicio.
  @Get('internal') @Roles('ADMIN') @ApiBearerAuth() @ApiOperation({ summary: 'Catálogo administrativo con costos y productos inactivos' })
  internal(@Query() q: CatalogQuery) { return this.service.list(q, true); }
  // Pasa los datos de esta ruta al método get del servicio.
  @Public() @Get(':id') @ApiOperation({ summary: 'Consultar producto disponible en catálogo' })
  get(@Param('id', ParseIntPipe) id: number) { return this.service.get(id); }
  // La tienda de Vercel puede cargar la imagen desde el dominio público de la API.
  @Public() @Get(':id/images/:imageId')
  @Header('Cross-Origin-Resource-Policy', 'cross-origin')
  @Header('Cache-Control', 'public, max-age=300')
  @ApiOperation({ summary: 'Descargar una imagen de un producto disponible' })
  async image(@Param('id', ParseIntPipe) id: number, @Param('imageId', ParseIntPipe) imageId: number) {
    const foto = await this.service.image(id, imageId);
    return new StreamableFile(Buffer.from(foto.bytes), { type: foto.contentType });
  }
  // Acepta el JSON original y también un formulario con hasta cinco imágenes.
  @Post() @Roles('ADMIN') @ApiBearerAuth()
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiOperation({ summary: 'Crear repuesto con stock inicial cero y fotos opcionales' })
  @UseInterceptors(CargaFotos)
  create(@Body() dto: ProductDto, @UploadedFiles() fotos: { buffer: Buffer }[] = []) {
    return this.service.create(dto, fotos);
  }
  // Los archivos son opcionales en la edición y solo los puede enviar un administrador.
  @Patch(':id') @Roles('ADMIN') @ApiBearerAuth()
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiOperation({ summary: 'Editar repuesto, sus fotos y la imagen principal' })
  @UseInterceptors(CargaFotos)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto, @UploadedFiles() fotos: { buffer: Buffer }[] = []) {
    return this.service.update(id, dto, fotos);
  }
  // Pasa los datos de esta ruta al método update del servicio.
  @Delete(':id') @Roles('ADMIN') @ApiBearerAuth() @ApiOperation({ summary: 'Retirar del catálogo preservando su historial' })
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.update(id, { active: false }); }
  // Pasa los datos de esta ruta al método adjust del servicio.
  @Post(':id/stock') @Roles('ADMIN') @ApiBearerAuth() @ApiOperation({ summary: 'Ajustar inventario con motivo y trazabilidad' })
  stock(@Param('id', ParseIntPipe) id: number, @Body() dto: StockDto, @CurrentUser() actor: Actor) { return this.service.adjust(id, dto, actor.id); }
}

@ApiTags('Categorías') @Controller('categories')
export class CategoriesController {
  
  constructor(private readonly service: CategoriesService) {}
  // Pasa los datos de esta ruta al método list del servicio.
  @Public() @Get() @ApiOperation({ summary: 'Listar categorías activas' })
  list() { return this.service.list(); }
  // Pasa los datos de esta ruta al método create del servicio.
  @Post() @Roles('ADMIN') @ApiBearerAuth() @ApiOperation({ summary: 'Crear categoría' })
  create(@Body() dto: CategoryDto) { return this.service.create(dto); }
  // Pasa los datos de esta ruta al método update del servicio.
  @Patch(':id') @Roles('ADMIN') @ApiBearerAuth() @ApiOperation({ summary: 'Renombrar categoría' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: CategoryDto) { return this.service.update(id, dto); }
  // Pasa los datos de esta ruta al método remove del servicio.
  @Delete(':id') @Roles('ADMIN') @ApiBearerAuth() @ApiOperation({ summary: 'Desactivar categoría y ocultarla del catálogo público' })
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
