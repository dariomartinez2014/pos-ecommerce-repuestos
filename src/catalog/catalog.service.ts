import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CatalogQuery, ProductDto, StockDto, UpdateProductDto } from './catalog.dto';
import { Prisma } from '../generated/prisma/client';

// RESPUESTA PÚBLICA: la selección explícita impide filtrar costos internos.
export const publicProduct = { id: true, sku: true, name: true, description: true, salePrice: true, stock: true, active: true, category: { select: { id: true, name: true } } } as const;
@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}
  async list(q: CatalogQuery, internal = false) {
    const where: Prisma.ProductWhereInput = { ...(internal ? {} : { active: true, category: { active: true } }), categoryId: q.categoryId,
      ...(q.search ? { OR: [{ name: { contains: q.search, mode: 'insensitive' } }, { sku: { contains: q.search, mode: 'insensitive' } }] } : {}) };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({ where, select: { ...publicProduct, ...(internal ? { acquisitionCost: true } : {}) }, orderBy: { id: 'asc' }, skip: (q.page - 1) * q.limit, take: q.limit }),
      this.prisma.product.count({ where }),
    ]);
    return { data, total, page: q.page, limit: q.limit };
  }
  async get(id: number) {
    const product = await this.prisma.product.findFirst({ where: { id, active: true, category: { active: true } }, select: publicProduct });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }
  async create(dto: ProductDto) {
    await this.category(dto.categoryId);
    return this.prisma.product.create({ data: dto });
  }
  async update(id: number, dto: UpdateProductDto) {
    if (dto.categoryId) await this.category(dto.categoryId);
    return this.prisma.product.update({ where: { id }, data: dto });
  }
  private async category(id: number) {
    if (!(await this.prisma.category.findFirst({ where: { id, active: true } }))) throw new NotFoundException('Categoría no disponible');
  }
  // TRANSACCIÓN: el stock y su movimiento de auditoría cambian juntos.
  async adjust(id: number, dto: StockDto, actorId: number) {
    return this.prisma.$transaction(async tx => {
      const changed = await tx.product.updateMany({ where: { id, ...(dto.delta < 0 ? { stock: { gte: -dto.delta } } : {}) }, data: { stock: { increment: dto.delta } } });
      if (!changed.count) throw new ConflictException('Producto inexistente o stock insuficiente');
      await tx.inventoryMovement.create({ data: { productId: id, actorId, type: 'ADJUSTMENT', quantityDelta: dto.delta, reason: dto.reason } });
      return tx.product.findUniqueOrThrow({ where: { id } });
    });
  }
}
