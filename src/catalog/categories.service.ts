import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CategoryDto } from './catalog.dto';
// CATEGORÍAS: concentra consultas y bajas lógicas para conservar el historial.
@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}
  list() { return this.prisma.category.findMany({ where: { active: true }, orderBy: { name: 'asc' } }); }
  create(dto: CategoryDto) { return this.prisma.category.create({ data: dto }); }
  update(id: number, dto: CategoryDto) { return this.prisma.category.update({ where: { id }, data: dto }); }
  remove(id: number) { return this.prisma.category.update({ where: { id }, data: { active: false } }); }
}
