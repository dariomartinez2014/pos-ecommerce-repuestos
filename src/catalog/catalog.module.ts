import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CatalogService } from './catalog.service';
import { ProductsController, CategoriesController } from './catalog.controller';
// MÓDULO DE CATÁLOGO: agrupa productos y sus categorías.
@Module({ providers: [CatalogService, CategoriesService], controllers: [ProductsController, CategoriesController] })
export class CatalogModule {}
