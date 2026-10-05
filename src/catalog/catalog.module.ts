// Registra controladores y servicios para que NestJS pueda construir sus dependencias.

import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CatalogService } from './catalog.service';
import { ProductsController, CategoriesController } from './catalog.controller';
// agrupa productos y sus categorías.

@Module({ providers: [CatalogService, CategoriesService], controllers: [ProductsController, CategoriesController] })
export class CatalogModule {}
