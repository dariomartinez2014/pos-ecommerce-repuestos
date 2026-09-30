import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddressDto, UpdateAddressDto } from './addresses.dto';
// PROPIEDAD: el token determina el dueño; nunca se acepta userId desde el cliente.
@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}
  private async own(id: number, userId: number) {
    const address = await this.prisma.address.findUnique({ where: { id } });
    if (!address) throw new NotFoundException('Dirección no encontrada');
    if (address.userId !== userId) throw new ForbiddenException('Dirección ajena');
  }
  list(userId: number) { return this.prisma.address.findMany({ where: { userId } }); }
  create(dto: AddressDto, userId: number) { return this.prisma.address.create({ data: { ...dto, userId } }); }
  async update(id: number, dto: UpdateAddressDto, userId: number) {
    await this.own(id, userId);
    return this.prisma.address.update({ where: { id }, data: dto });
  }
  async remove(id: number, userId: number) {
    await this.own(id, userId);
    return this.prisma.address.delete({ where: { id } });
  }
}
