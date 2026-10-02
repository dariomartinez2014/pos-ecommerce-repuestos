// ARCHIVO: Recibe solicitudes HTTP, valida parámetros con DTO/Pipes y delega reglas en servicios.
// ESTUDIO: consulta docs/GUIA-CODIGO-COMPLETA.md para recorrer este archivo.
import { Body, Controller, Get, HttpCode, Post, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { ActiveDto, CreateStaffDto, LoginDto, RegisterDto } from './auth.dto';
import { Actor, CurrentUser, Public, Roles } from '../common/security';

// RUTAS DE IDENTIDAD: los servicios ejecutan hashing y emisión de tokens.
// CLASE AuthController: Recibe solicitudes HTTP, valida parámetros con DTO/Pipes y delega reglas en servicios.
@ApiTags('Autenticación') @Controller('auth')
export class AuthController {
  // BLOQUE constructor: Inyecta las dependencias necesarias; NestJS proporciona estas instancias al construir la clase.
  constructor(private readonly auth: AuthService) {}
  // BLOQUE register: Recibe datos de la ruta y delega register al servicio; los decoradores definen HTTP, documentación y permisos.
  @Public() @Post('register') @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Registrar cliente; nunca crea cuentas internas' })
  register(@Body() dto: RegisterDto) { return this.auth.register(dto); }
  // BLOQUE login: Recibe datos de la ruta y delega login al servicio; los decoradores definen HTTP, documentación y permisos.
  @Public() @Post('login') @HttpCode(200) @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Obtener JWT válido durante una hora' })
  login(@Body() dto: LoginDto) { return this.auth.login(dto); }
  // BLOQUE me: Recibe datos de la ruta y delega me al servicio; los decoradores definen HTTP, documentación y permisos.
  @Get('me') @ApiBearerAuth() @ApiOperation({ summary: 'Consultar identidad del token actual' })
  me(@CurrentUser() user: Actor) { return user; }
}

// CLASE UsersController: Recibe solicitudes HTTP, valida parámetros con DTO/Pipes y delega reglas en servicios.
@ApiTags('Usuarios internos') @ApiBearerAuth() @Roles('ADMIN') @Controller('users')
export class UsersController {
  // BLOQUE constructor: Inyecta las dependencias necesarias; NestJS proporciona estas instancias al construir la clase.
  constructor(private readonly auth: AuthService) {}
  // BLOQUE create: Recibe datos de la ruta y delega register al servicio; los decoradores definen HTTP, documentación y permisos.
  @Post() @ApiOperation({ summary: 'Crear usuario por decisión del administrador' })
  create(@Body() dto: CreateStaffDto) { return this.auth.register(dto, dto.role); }
  // BLOQUE list: Recibe datos de la ruta y delega listUsers al servicio; los decoradores definen HTTP, documentación y permisos.
  @Get() @ApiOperation({ summary: 'Listar cuentas sin hashes (máximo 100)' })
  list() { return this.auth.listUsers(); }
  // BLOQUE active: Recibe datos de la ruta y delega setActive al servicio; los decoradores definen HTTP, documentación y permisos.
  @Patch(':id/active') @ApiOperation({ summary: 'Activar o desactivar una cuenta' })
  active(@Param('id', ParseIntPipe) id: number, @Body() dto: ActiveDto, @CurrentUser() user: Actor) {
    return this.auth.setActive(id, dto.active, user);
  }
}
