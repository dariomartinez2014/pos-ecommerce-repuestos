import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Injectable, Logger, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Request, Response } from 'express';
import { finalize } from 'rxjs/operators';
import { Prisma } from '../generated/prisma/client';

// ERRORES: transforma conflictos conocidos y evita exponer SQL o secretos.
@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger('Errores');
  catch(error: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    let status = 500;
    let message: string | string[] = 'Error interno del servidor';
    if (error instanceof HttpException) {
      status = error.getStatus();
      const body = error.getResponse();
      message = typeof body === 'string' ? body : (body as { message?: string | string[] }).message ?? error.message;
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') { status = 409; message = 'Ya existe un registro con esos datos únicos'; }
      if (error.code === 'P2025') { status = 404; message = 'Registro no encontrado'; }
      if (error.code === 'P2003') { status = 409; message = 'La operación afecta una relación existente o inválida'; }
      if (error.code === 'P2034') { status = 409; message = 'Operación concurrente: vuelve a intentarlo'; }
    }
    if (status === 500) this.logger.error(error instanceof Error ? error.message : 'Error desconocido');
    res.status(status).json({ statusCode: status, message, path: req.path, timestamp: new Date().toISOString() });
  }
}

// LOGGING: registra también solicitudes fallidas, sin imprimir cuerpos ni tokens.
@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');
  intercept(ctx: ExecutionContext, next: CallHandler) {
    const req = ctx.switchToHttp().getRequest<Request>();
    const start = Date.now();
    return next.handle().pipe(finalize(() => this.logger.log(`${req.method} ${req.path} ${Date.now() - start}ms`)));
  }
}
