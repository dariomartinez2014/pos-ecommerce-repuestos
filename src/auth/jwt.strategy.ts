import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
import { safeUser } from './auth.service';

// PASSPORT: verifica firma y expiración; consulta rol/estado actual en cada petición.
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService, private readonly prisma: PrismaService) {
    super({ jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'), algorithms: ['HS256'] });
  }
  async validate(payload: { sub?: unknown }) {
    if (!Number.isInteger(payload.sub)) throw new UnauthorizedException();
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub as number }, select: safeUser });
    if (!user?.active) throw new UnauthorizedException('Cuenta no disponible');
    return user;
  }
}
