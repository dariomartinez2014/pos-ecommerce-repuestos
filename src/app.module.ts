// Reúne los módulos, valida variables con Joi y registra Guards globales. Incluye la ruta de salud que consulta PostgreSQL.

import { Controller, Get, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import Joi from 'joi';
import { PrismaModule, PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { JwtGuard, Public, RolesGuard } from './common/security';
import { CatalogModule } from './catalog/catalog.module';
import { AddressesModule } from './addresses/addresses.module';
import { SalesModule } from './sales/sales.module';
import { CashModule } from './cash/cash.module';
import { MockPayModule } from './mockpay/mockpay.module';


@ApiTags('Estado') @Controller('health')
class HealthController {
  
  constructor(private readonly prisma: PrismaService, private readonly config: ConfigService) {}
  // Ejecuta SELECT 1 para comprobar la conexión y devuelve estado, tienda y moneda.
  @Public() @Get() @ApiOperation({ summary: 'Comprobar disponibilidad del backend y PostgreSQL' })
  async health() { await this.prisma.$queryRaw`SELECT 1`; return { status: 'ok', store: 'Repuestos', currency: this.config.get('STORE_CURRENCY') }; }
}

// valida configuración al iniciar; protege todas las rutas por defecto.

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, validationSchema: Joi.object({
    DATABASE_URL: Joi.string().required(), JWT_SECRET: Joi.string().min(32).required(),
    PORT: Joi.number().port().default(3000), NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    CORS_ORIGINS: Joi.string().allow('').default(''), STORE_CURRENCY: Joi.string().valid('GTQ').default('GTQ'),
    MOCKPAY_API_URL: Joi.string().uri().default('https://mockpay-backend.onrender.com'), MOCKPAY_SECRET_KEY: Joi.string().allow('').optional(),
    MOCKPAY_NEW_API_URL: Joi.string().uri().default('https://api-mock-payment.funvaltech.cloud'), MOCKPAY_NEW_SECRET_KEY: Joi.string().allow('').optional(),
  }) }), ThrottlerModule.forRoot([{ ttl: 60000, limit: 300 }]), PrismaModule, AuthModule, CatalogModule, AddressesModule, SalesModule, CashModule, MockPayModule],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }, { provide: APP_GUARD, useClass: JwtGuard }, { provide: APP_GUARD, useClass: RolesGuard }],
})
export class AppModule {}
