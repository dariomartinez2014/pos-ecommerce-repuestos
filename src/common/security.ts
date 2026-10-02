// ARCHIVO: Define la identidad Actor, los decoradores propios y los Guards de autenticación y autorización.
// ESTUDIO: consulta docs/GUIA-CODIGO-COMPLETA.md para recorrer este archivo.
import { CanActivate, createParamDecorator, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '../generated/prisma/enums';

// CONTRATO: identidad mínima adjuntada al request por Passport.
export interface Actor { id: number; name: string; email: string; role: UserRole }
export const Public = () => SetMetadata('public', true);
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): Actor => ctx.switchToHttp().getRequest().user);

// AUTENTICACIÓN POR DEFECTO: únicamente @Public permite omitir el token.
// CLASE JwtGuard: Define la identidad Actor, los decoradores propios y los Guards de autenticación y autorización.
@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  // BLOQUE constructor: Inyecta las dependencias necesarias; NestJS proporciona estas instancias al construir la clase.
  constructor(private readonly reflector: Reflector) { super(); }
  // BLOQUE canActivate: Decide si una solicitud puede continuar; lee metadata y, según el Guard, requiere JWT o un rol permitido.
  canActivate(ctx: ExecutionContext) {
    if (this.reflector.getAllAndOverride<boolean>('public', [ctx.getHandler(), ctx.getClass()])) return true;
    return super.canActivate(ctx);
  }
}

// AUTORIZACIÓN: lee metadata del método y de la clase, en ese orden.
// CLASE RolesGuard: Define la identidad Actor, los decoradores propios y los Guards de autenticación y autorización.
@Injectable()
export class RolesGuard implements CanActivate {
  // BLOQUE constructor: Inyecta las dependencias necesarias; NestJS proporciona estas instancias al construir la clase.
  constructor(private readonly reflector: Reflector) {}
  // BLOQUE canActivate: Decide si una solicitud puede continuar; lee metadata y, según el Guard, requiere JWT o un rol permitido.
  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<UserRole[]>('roles', [ctx.getHandler(), ctx.getClass()]);
    if (!roles) return true;
    const user: Actor | undefined = ctx.switchToHttp().getRequest().user;
    return !!user && roles.includes(user.role);
  }
}
