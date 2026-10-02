// ARCHIVO: Registra controladores y servicios para que NestJS pueda construir sus dependencias.
// ESTUDIO: consulta docs/GUIA-CODIGO-COMPLETA.md para recorrer este archivo.
import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CatalogService } from './catalog.service';
import { ProductsController, CategoriesController } from './catalog.controller';
// MÓDULO DE CATÁLOGO: agrupa productos y sus categorías.
// CLASE CatalogModule: agrupa y registra dependencias en NestJS.
@Module({ providers: [CatalogService, CategoriesService], controllers: [ProductsController, CategoriesController] })
export class CatalogModule {}
