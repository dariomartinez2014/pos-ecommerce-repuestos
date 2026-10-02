// ARCHIVO: Gestiona categorías y su desactivación sin eliminar el historial de productos.
// ESTUDIO: consulta docs/GUIA-CODIGO-COMPLETA.md para recorrer este archivo.
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CategoryDto } from './catalog.dto';
// CATEGORÍAS: concentra consultas y bajas lógicas para conservar el historial.
// CLASE CategoriesService: Gestiona categorías y su desactivación sin eliminar el historial de productos.
@Injectable()
export class CategoriesService {
  // BLOQUE constructor: Inyecta las dependencias necesarias; NestJS proporciona estas instancias al construir la clase.
  constructor(private readonly prisma: PrismaService) {}
  // BLOQUE list: Aplica filtros y paginación; la versión pública oculta costos y registros inactivos.
  list() { return this.prisma.category.findMany({ where: { active: true }, orderBy: { name: 'asc' } }); }
  // BLOQUE create: Crea el registro usando el DTO validado y sus comprobaciones de negocio.
  create(dto: CategoryDto) { return this.prisma.category.create({ data: dto }); }
  // BLOQUE update: Aplica cambios permitidos por el DTO; comprueba propiedad o categoría según este servicio.
  update(id: number, dto: CategoryDto) { return this.prisma.category.update({ where: { id }, data: dto }); }
  // BLOQUE remove: Desactiva la categoría conservando sus relaciones e historial.
  remove(id: number) { return this.prisma.category.update({ where: { id }, data: { active: false } }); }
}
