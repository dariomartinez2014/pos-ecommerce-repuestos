// Define la identidad Actor, los decoradores propios y los Guards de autenticación y autorización.

import { CanActivate, createParamDecorator, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '../generated/prisma/enums';

// identidad mínima adjuntada al request por Passport.
export interface Actor { id: number; name: string; email: string; role: UserRole }
export const Public = () => SetMetadata('public', true);
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): Actor => ctx.switchToHttp().getRequest().user);

// únicamente @Public permite omitir el token.

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  
  constructor(private readonly reflector: Reflector) { super(); }
  // Decide si una solicitud puede continuar; lee metadata y, según el Guard, requiere JWT o un rol permitido.
  canActivate(ctx: ExecutionContext) {
    if (this.reflector.getAllAndOverride<boolean>('public', [ctx.getHandler(), ctx.getClass()])) return true;
    return super.canActivate(ctx);
  }
}

// lee metadata del método y de la clase, en ese orden.

@Injectable()
export class RolesGuard implements CanActivate {
  
  constructor(private readonly reflector: Reflector) {}
  // Decide si una solicitud puede continuar; lee metadata y, según el Guard, requiere JWT o un rol permitido.
  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<UserRole[]>('roles', [ctx.getHandler(), ctx.getClass()]);
    if (!roles) return true;
    const user: Actor | undefined = ctx.switchToHttp().getRequest().user;
    return !!user && roles.includes(user.role);
  }
}
