import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, compare } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './auth.dto';
import { Actor } from '../common/security';
import { UserRole } from '../generated/prisma/enums';
export const safeUser = { id: true, name: true, email: true, phone: true, role: true, active: true } as const;

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}
  // ADMINISTRACIÓN: las respuestas excluyen siempre el hash de contraseña.
  listUsers() { return this.prisma.user.findMany({ select: safeUser, take: 100, orderBy: { id: 'asc' } }); }
  setActive(id: number, active: boolean, actor: Actor) {
    if (id === actor.id && !active) throw new BadRequestException('No puedes desactivar tu propia cuenta');
    return this.prisma.user.update({ where: { id }, data: { active }, select: safeUser });
  }
  // HASH: bcrypt tiene límite de 72 bytes; validar bytes evita truncar contraseñas Unicode.
  async register(dto: RegisterDto, role: UserRole = UserRole.CUSTOMER) {
    if (Buffer.byteLength(dto.password, 'utf8') > 72) throw new BadRequestException('Contraseña demasiado larga en bytes');
    const passwordHash = await hash(dto.password, 12);
    return this.prisma.user.create({ data: { email: dto.email, name: dto.name, phone: dto.phone, passwordHash, role }, select: safeUser });
  }
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.active || !(await compare(dto.password, user.passwordHash))) throw new UnauthorizedException('Credenciales inválidas');
    return { accessToken: await this.jwt.signAsync({ sub: user.id }), tokenType: 'Bearer', expiresIn: 3600 };
  }
}
