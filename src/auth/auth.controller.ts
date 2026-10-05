// Recibe solicitudes HTTP, valida parámetros con DTO/Pipes y delega reglas en servicios.

import { Body, Controller, Get, HttpCode, Post, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { ActiveDto, CreateStaffDto, LoginDto, RegisterDto } from './auth.dto';
import { Actor, CurrentUser, Public, Roles } from '../common/security';

// los servicios ejecutan hashing y emisión de tokens.

@ApiTags('Autenticación') @Controller('auth')
export class AuthController {
  
  constructor(private readonly auth: AuthService) {}
  // Pasa los datos de esta ruta al método register del servicio.
  @Public() @Post('register') @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Registrar cliente; nunca crea cuentas internas' })
  register(@Body() dto: RegisterDto) { return this.auth.register(dto); }
  // Pasa los datos de esta ruta al método login del servicio.
  @Public() @Post('login') @HttpCode(200) @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Obtener JWT válido durante una hora' })
  login(@Body() dto: LoginDto) { return this.auth.login(dto); }
  // Pasa los datos de esta ruta al método me del servicio.
  @Get('me') @ApiBearerAuth() @ApiOperation({ summary: 'Consultar identidad del token actual' })
  me(@CurrentUser() user: Actor) { return user; }
}


@ApiTags('Usuarios internos') @ApiBearerAuth() @Roles('ADMIN') @Controller('users')
export class UsersController {
  
  constructor(private readonly auth: AuthService) {}
  // Pasa los datos de esta ruta al método register del servicio.
  @Post() @ApiOperation({ summary: 'Crear usuario por decisión del administrador' })
  create(@Body() dto: CreateStaffDto) { return this.auth.register(dto, dto.role); }
  // Pasa los datos de esta ruta al método listUsers del servicio.
  @Get() @ApiOperation({ summary: 'Listar cuentas sin hashes (máximo 100)' })
  list() { return this.auth.listUsers(); }
  // Pasa los datos de esta ruta al método setActive del servicio.
  @Patch(':id/active') @ApiOperation({ summary: 'Activar o desactivar una cuenta' })
  active(@Param('id', ParseIntPipe) id: number, @Body() dto: ActiveDto, @CurrentUser() user: Actor) {
    return this.auth.setActive(id, dto.active, user);
  }
}
