// Abre caja, agrupa pagos POS, calcula efectivo esperado y coordina el cierre con ventas concurrentes.

import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Actor } from '../common/security';
import { Prisma } from '../generated/prisma/client';
import { OpenCashDto, CloseCashDto } from './cash.dto';
// apertura, conciliación y cierre junto con las ventas de mostrador.

@Injectable()
export class CashService {
  
  constructor(private readonly prisma: PrismaService) {}
  // permite elegir caja sin transferir consultas al controlador.
  // Consulta los registros que permite este servicio.
  list() { return this.prisma.cashSession.findMany({ orderBy: { id: 'desc' }, take: 100 }); }
  // Crea una sesión con fondo inicial; el índice parcial de PostgreSQL rechaza una segunda caja abierta.
  open(dto: OpenCashDto, actor: Actor) {
    // Un índice único parcial en PostgreSQL impide dos cajas abiertas simultáneas.
    return this.prisma.cashSession.create({ data: { ...dto, openedById: actor.id } });
  }
  // Agrupa pagos POS por método; suma solamente CASH al fondo inicial y compara contra el efectivo contado.
  async report(tx: Prisma.TransactionClient, id: number) {
    const session = await tx.cashSession.findUnique({ where: { id } });
    if (!session) throw new NotFoundException('Caja no encontrada');
    const totals = await tx.payment.groupBy({ by: ['method'], where: { order: { cashSessionId: id, channel: 'POS', status: 'COMPLETED' } }, _sum: { amount: true }, _count: { _all: true } });
    const cash = totals.find(row => row.method === 'CASH')?._sum.amount ?? new Prisma.Decimal(0);
    const expected = session.expectedAmount ?? session.openingAmount.plus(cash);
    return { ...session, totalsByMethod: totals, expectedAmount: expected, difference: session.countedAmount?.minus(expected) ?? null };
  }
  // Obtiene el informe de caja con una lectura consistente RepeatableRead.
  async get(id: number) { return this.prisma.$transaction(tx => this.report(tx, id), { isolationLevel: 'RepeatableRead' }); }
  // Bloquea la caja, rechaza cierre repetido, calcula el saldo esperado y guarda quién/cuándo cerró.
  async close(id: number, dto: CloseCashDto, actor: Actor) {
    return this.prisma.$transaction(async tx => {
      // el corte no puede adelantarse a un cobro en curso.
      await tx.$queryRaw`SELECT id FROM cash_sessions WHERE id = ${id} FOR UPDATE`;
      const session = await tx.cashSession.findUnique({ where: { id } });
      if (!session) throw new NotFoundException();
      if (session.closedAt) throw new ConflictException('Caja ya cerrada');
      const report = await this.report(tx, id);
      await tx.cashSession.update({ where: { id }, data: { closedAt: new Date(), closedById: actor.id, countedAmount: dto.countedAmount, expectedAmount: report.expectedAmount } });
      return this.report(tx, id);
    });
  }
}
