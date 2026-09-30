import { Body, Controller, Get, HttpCode, Post, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { ActiveDto, CreateStaffDto, LoginDto, RegisterDto } from './auth.dto';
import { Actor, CurrentUser, Public, Roles } from '../common/security';

// RUTAS DE IDENTIDAD: los servicios ejecutan hashing y emisión de tokens.
@ApiTags('Autenticación') @Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Public() @Post('register') @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Registrar cliente; nunca crea cuentas internas' })
  register(@Body() dto: RegisterDto) { return this.auth.register(dto); }
  @Public() @Post('login') @HttpCode(200) @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Obtener JWT válido durante una hora' })
  login(@Body() dto: LoginDto) { return this.auth.login(dto); }
  @Get('me') @ApiBearerAuth() @ApiOperation({ summary: 'Consultar identidad del token actual' })
  me(@CurrentUser() user: Actor) { return user; }
}

@ApiTags('Usuarios internos') @ApiBearerAuth() @Roles('ADMIN') @Controller('users')
export class UsersController {
  constructor(private readonly auth: AuthService) {}
  @Post() @ApiOperation({ summary: 'Crear usuario por decisión del administrador' })
  create(@Body() dto: CreateStaffDto) { return this.auth.register(dto, dto.role); }
  @Get() @ApiOperation({ summary: 'Listar cuentas sin hashes (máximo 100)' })
  list() { return this.auth.listUsers(); }
  @Patch(':id/active') @ApiOperation({ summary: 'Activar o desactivar una cuenta' })
  active(@Param('id', ParseIntPipe) id: number, @Body() dto: ActiveDto, @CurrentUser() user: Actor) {
    return this.auth.setActive(id, dto.active, user);
  }
}
