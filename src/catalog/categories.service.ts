// Gestiona categorías y su desactivación sin eliminar el historial de productos.

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CategoryDto } from './catalog.dto';
// concentra consultas y bajas lógicas para conservar el historial.

@Injectable()
export class CategoriesService {
  
  constructor(private readonly prisma: PrismaService) {}
  // Aplica filtros y paginación; la versión pública oculta costos y registros inactivos.
  list() { return this.prisma.category.findMany({ where: { active: true }, orderBy: { name: 'asc' } }); }
  // Crea el registro usando el DTO validado y sus comprobaciones de negocio.
  create(dto: CategoryDto) { return this.prisma.category.create({ data: dto }); }
  // Aplica cambios permitidos por el DTO; comprueba propiedad o categoría según este servicio.
  update(id: number, dto: CategoryDto) { return this.prisma.category.update({ where: { id }, data: dto }); }
  // Desactiva la categoría conservando sus relaciones e historial.
  remove(id: number) { return this.prisma.category.update({ where: { id }, data: { active: false } }); }
}
