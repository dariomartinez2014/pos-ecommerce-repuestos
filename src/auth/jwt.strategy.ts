// ARCHIVO: Passport obtiene el Bearer token, verifica firma/expiración y consulta el estado actual del usuario.
// ESTUDIO: consulta docs/GUIA-CODIGO-COMPLETA.md para recorrer este archivo.
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
import { safeUser } from './auth.service';

// PASSPORT: verifica firma y expiración; consulta rol/estado actual en cada petición.
// CLASE JwtStrategy: Passport obtiene el Bearer token, verifica firma/expiración y consulta el estado actual del usuario.
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  // BLOQUE constructor: Inyecta las dependencias necesarias; NestJS proporciona estas instancias al construir la clase.
  constructor(config: ConfigService, private readonly prisma: PrismaService) {
    super({ jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'), algorithms: ['HS256'] });
  }
  // BLOQUE validate: Consulta el usuario del sub del JWT y rechaza cuentas que ya no estén activas.
  async validate(payload: { sub?: unknown }) {
    if (!Number.isInteger(payload.sub)) throw new UnauthorizedException();
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub as number }, select: safeUser });
    if (!user?.active) throw new UnauthorizedException('Cuenta no disponible');
    return user;
  }
}
