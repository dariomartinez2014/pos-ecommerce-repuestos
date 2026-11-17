// Busca repuestos, oculta costos públicos, comprueba categorías y ajusta stock con su movimiento contable.

import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CatalogQuery, ProductDto, StockDto, UpdateProductDto } from './catalog.dto';
import { Prisma } from '../generated/prisma/client';

// la selección explícita evita mostrar costos internos.
export const publicProduct = {
  id: true, sku: true, name: true, description: true, salePrice: true, stock: true, active: true,
  category: { select: { id: true, name: true } },
  // El catálogo solo lista identificadores. Cada imagen se descarga por separado.
  images: { select: { id: true }, orderBy: { id: 'asc' } },
} as const;

function tipoDeImagen(bytes: Buffer) {
  if (bytes.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'))) return 'image/png';
  if (bytes.subarray(0, 3).equals(Buffer.from('ffd8ff', 'hex'))) return 'image/jpeg';
  if (bytes.length >= 16 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  throw new BadRequestException('Las imágenes deben ser JPG, PNG o WebP.');
}

@Injectable()
export class CatalogService {
  
  constructor(private readonly prisma: PrismaService) {}
  // Aplica filtros y paginación; la versión pública oculta costos y registros inactivos.
  async list(q: CatalogQuery, internal = false) {
    const where: Prisma.ProductWhereInput = { ...(internal ? {} : { active: true, category: { active: true } }), categoryId: q.categoryId,
      ...(q.search ? { OR: [{ name: { contains: q.search, mode: 'insensitive' } }, { sku: { contains: q.search, mode: 'insensitive' } }] } : {}) };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({ where, select: { ...publicProduct, ...(internal ? { acquisitionCost: true } : {}) }, orderBy: { id: 'asc' }, skip: (q.page - 1) * q.limit, take: q.limit }),
      this.prisma.product.count({ where }),
    ]);
    return { data, total, page: q.page, limit: q.limit };
  }
  // Busca el registro solicitado y responde con los campos permitidos.
  async get(id: number) {
    const product = await this.prisma.product.findFirst({ where: { id, active: true, category: { active: true } }, select: publicProduct });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }
  // La imagen debe pertenecer a un producto que siga visible en la tienda.
  async image(productId: number, id: number) {
    const foto = await this.prisma.productImage.findFirst({
      where: { id, productId, product: { active: true, category: { active: true } } },
      select: { bytes: true, contentType: true },
    });
    if (!foto) throw new NotFoundException('Imagen no encontrada');
    return foto;
  }
  async create(dto: ProductDto, fotos: { buffer: Buffer }[]) {
    await this.category(dto.categoryId);
    // Revisa los bytes antes de guardar el producto y sus fotos en una sola operación.
    const images = fotos.map(({ buffer }) => ({ contentType: tipoDeImagen(buffer), bytes: Uint8Array.from(buffer) }));
    return this.prisma.product.create({ data: { ...dto, images: { create: images } } });
  }
  // Aplica cambios permitidos por el DTO; comprueba propiedad o categoría según este servicio.
  async update(id: number, dto: UpdateProductDto) {
    if (dto.categoryId) await this.category(dto.categoryId);
    return this.prisma.product.update({ where: { id }, data: dto });
  }
  // Comprueba que la categoría exista y esté activa antes de asociar un repuesto.
  private async category(id: number) {
    if (!(await this.prisma.category.findFirst({ where: { id, active: true } }))) throw new NotFoundException('Categoría no disponible');
  }
  // el stock y su movimiento de auditoría cambian juntos.
  // Actualiza stock de forma condicional y guarda el movimiento de auditoría dentro de la misma transacción.
  async adjust(id: number, dto: StockDto, actorId: number) {
    return this.prisma.$transaction(async tx => {
      const changed = await tx.product.updateMany({ where: { id, ...(dto.delta < 0 ? { stock: { gte: -dto.delta } } : {}) }, data: { stock: { increment: dto.delta } } });
      if (!changed.count) throw new ConflictException('Producto inexistente o stock insuficiente');
      await tx.inventoryMovement.create({ data: { productId: id, actorId, type: 'ADJUSTMENT', quantityDelta: dto.delta, reason: dto.reason } });
      return tx.product.findUniqueOrThrow({ where: { id } });
    });
  }
}
