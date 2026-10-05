// Guarda y modifica direcciones del usuario autenticado, comprobando propiedad.

import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddressDto, UpdateAddressDto } from './addresses.dto';
// el token determina el dueño; nunca se acepta userId desde el cliente.

@Injectable()
export class AddressesService {
  
  constructor(private readonly prisma: PrismaService) {}
  // Busca una dirección y rechaza su uso si pertenece a otra persona.
  private async own(id: number, userId: number) {
    const address = await this.prisma.address.findUnique({ where: { id } });
    if (!address) throw new NotFoundException('Dirección no encontrada');
    if (address.userId !== userId) throw new ForbiddenException('Dirección ajena');
  }
  // Consulta los registros que permite este servicio.
  list(userId: number) { return this.prisma.address.findMany({ where: { userId } }); }
  // Guarda una dirección con userId obtenido del token.
  create(dto: AddressDto, userId: number) { return this.prisma.address.create({ data: { ...dto, userId } }); }
  // Aplica cambios permitidos por el DTO; comprueba propiedad o categoría según este servicio.
  async update(id: number, dto: UpdateAddressDto, userId: number) {
    await this.own(id, userId);
    return this.prisma.address.update({ where: { id }, data: dto });
  }
  // Retira el registro autorizado según las reglas de este servicio.
  async remove(id: number, userId: number) {
    await this.own(id, userId);
    return this.prisma.address.delete({ where: { id } });
  }
}
