import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Actor } from '../common/security';
import { Prisma } from '../generated/prisma/client';
import { OpenCashDto, CloseCashDto } from './cash.dto';
// SERVICIO: apertura, conciliación y cierre coordinados con las ventas POS.
@Injectable()
export class CashService {
  constructor(private readonly prisma: PrismaService) {}
  // LISTADO: permite elegir caja sin transferir consultas al controlador.
  list() { return this.prisma.cashSession.findMany({ orderBy: { id: 'desc' }, take: 100 }); }
  open(dto: OpenCashDto, actor: Actor) {
    // Un índice único parcial en PostgreSQL impide dos cajas abiertas simultáneas.
    return this.prisma.cashSession.create({ data: { ...dto, openedById: actor.id } });
  }
  async report(tx: Prisma.TransactionClient, id: number) {
    const session = await tx.cashSession.findUnique({ where: { id } });
    if (!session) throw new NotFoundException('Caja no encontrada');
    const totals = await tx.payment.groupBy({ by: ['method'], where: { order: { cashSessionId: id, channel: 'POS', status: 'COMPLETED' } }, _sum: { amount: true }, _count: { _all: true } });
    const cash = totals.find(row => row.method === 'CASH')?._sum.amount ?? new Prisma.Decimal(0);
    const expected = session.expectedAmount ?? session.openingAmount.plus(cash);
    return { ...session, totalsByMethod: totals, expectedAmount: expected, difference: session.countedAmount?.minus(expected) ?? null };
  }
  async get(id: number) { return this.prisma.$transaction(tx => this.report(tx, id), { isolationLevel: 'RepeatableRead' }); }
  async close(id: number, dto: CloseCashDto, actor: Actor) {
    return this.prisma.$transaction(async tx => {
      // MISMO BLOQUEO QUE CHECKOUT: el corte no puede adelantarse a un cobro en curso.
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
