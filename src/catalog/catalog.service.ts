// Busca repuestos, oculta costos públicos, comprueba categorías y ajusta stock con su movimiento contable.

import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PageDto } from '../common/dto';
import { PrismaService } from '../prisma/prisma.service';
import { CatalogQuery, ProductDto, StockDto, UpdateProductDto } from './catalog.dto';
import { Prisma } from '../generated/prisma/client';

// la selección explícita evita mostrar costos internos.
export const publicProduct = {
  id: true, sku: true, name: true, description: true, salePrice: true, stock: true, active: true,
  category: { select: { id: true, name: true } },
  // El catálogo solo lista identificadores. Cada imagen se descarga por separado.
  referenceImageSku: true,
  primaryImageId: true,
  images: { select: { id: true }, orderBy: { id: 'asc' } },
} as const;

function tipoDeImagen(bytes: Buffer) {
  if (bytes.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'))) return 'image/png';
  if (bytes.subarray(0, 3).equals(Buffer.from('ffd8ff', 'hex'))) return 'image/jpeg';
  if (bytes.length >= 16 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  throw new BadRequestException('Las imágenes deben ser JPG, PNG o WebP.');
}

function prepararFotos(fotos: { buffer: Buffer }[]) {
  return fotos.map(({ buffer }) => ({ contentType: tipoDeImagen(buffer), bytes: Uint8Array.from(buffer) }));
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
    return this.prisma.product.create({ data: { ...dto, images: { create: prepararFotos(fotos) } } });
  }
  async update(id: number, dto: UpdateProductDto, fotos: { buffer: Buffer }[] = []) {
    const { reemplazarImagenes, quitarImagenes, imagenPrincipal, ...datos } = dto;
    const nuevas = prepararFotos(fotos);
    const quitar = quitarImagenes ?? [];
    if (reemplazarImagenes && !nuevas.length) throw new BadRequestException('Selecciona al menos una imagen para reemplazar las actuales.');
    if (datos.categoryId) await this.category(datos.categoryId);
    const where = { id };
    if (!nuevas.length && !quitar.length && imagenPrincipal == null) {
      return this.prisma.product.update({ where, data: datos });
    }

    // Todos los cambios se guardan juntos, incluso si dos administradores editan a la vez.
    return this.prisma.$transaction(async tx => {
      const producto = await tx.product.findUniqueOrThrow({
        where,
        select: { referenceImageSku: true, images: { select: { id: true } } },
      });
      const idsActuales = producto.images.map(foto => foto.id);
      if (producto.referenceImageSku) idsActuales.unshift(0);
      const eliminar = reemplazarImagenes ? idsActuales : quitar;
      const restantes = idsActuales.filter(fotoId => !eliminar.includes(fotoId));

      // Cada foto que se quita o se marca como principal debe pertenecer al producto.
      if (!quitar.every(fotoId => idsActuales.includes(fotoId))) {
        throw new BadRequestException('Una de las fotos que quieres quitar ya no pertenece al producto.');
      }
      if (imagenPrincipal != null && !restantes.includes(imagenPrincipal)) {
        throw new BadRequestException('La foto principal debe estar entre las fotos que conservas.');
      }
      if (restantes.length + nuevas.length > 5) {
        throw new BadRequestException('Puedes tener hasta 5 imágenes por producto.');
      }
      const idsSubidos = eliminar.filter(fotoId => fotoId !== 0);
      if (idsSubidos.length) await tx.productImage.deleteMany({ where: { productId: id, id: { in: idsSubidos } } });
      return tx.product.update({
        where,
        data: {
          ...datos,
          referenceImageSku: eliminar.includes(0) ? null : undefined,
          primaryImageId: imagenPrincipal === 0 ? null : imagenPrincipal ?? undefined,
          images: { create: nuevas },
        },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }
  // Comprueba que la categoría exista y esté activa antes de asociar un repuesto.
  private async category(id: number) {
    if (!(await this.prisma.category.findFirst({ where: { id, active: true } }))) throw new NotFoundException('Categoría no disponible');
  }
  // El historial incluye los ajustes manuales, incluso si se retiró el producto.
  async listAdjustments(id: number, q: PageDto) {
    const product = await this.prisma.product.findUnique({ where: { id }, select: { id: true } });
    if (!product) throw new NotFoundException('Producto no encontrado');

    const where: Prisma.InventoryMovementWhereInput = { productId: id, type: 'ADJUSTMENT' };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.inventoryMovement.findMany({
        where,
        // Del responsable solo se necesita su nombre para identificar el ajuste.
        select: { id: true, quantityDelta: true, reason: true, actor: { select: { name: true } }, createdAt: true },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      }),
      this.prisma.inventoryMovement.count({ where }),
    ], { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
    return { data, total, page: q.page, limit: q.limit };
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
