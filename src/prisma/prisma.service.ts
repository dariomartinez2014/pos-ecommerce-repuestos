// Conecta Prisma con PostgreSQL mediante adapter-pg y comparte el cliente entre módulos.

import { Global, Injectable, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

// todos los módulos reutilizan este cliente y su pool.

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  
  constructor(config: ConfigService) {
    super({ adapter: new PrismaPg({ connectionString: config.getOrThrow<string>('DATABASE_URL') }) });
  }
  // Abre la conexión al iniciar el módulo de Prisma.
  async onModuleInit() { await this.$connect(); }
  // Cierra la conexión al destruir la aplicación.
  async onModuleDestroy() { await this.$disconnect(); }
}

@Global()
@Module({ providers: [PrismaService], exports: [PrismaService] })
export class PrismaModule {}
