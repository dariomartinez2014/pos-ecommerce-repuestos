// Registra controladores y servicios para que NestJS pueda construir sus dependencias.

import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { AuthController, UsersController } from './auth.controller';
// conecta Passport, JWT y las rutas de identidad.

@Module({ imports: [PassportModule, JwtModule.registerAsync({ inject: [ConfigService], useFactory: (config: ConfigService) => ({ secret: config.getOrThrow<string>('JWT_SECRET'), signOptions: { expiresIn: '1h', algorithm: 'HS256' } }) })], providers: [AuthService, JwtStrategy], controllers: [AuthController, UsersController] })
export class AuthModule {}
