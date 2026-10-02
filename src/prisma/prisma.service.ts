// ARCHIVO: Conecta Prisma con PostgreSQL mediante adapter-pg y comparte el cliente entre módulos.
// ESTUDIO: consulta docs/GUIA-CODIGO-COMPLETA.md para recorrer este archivo.
import { Global, Injectable, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

// CONEXIÓN ÚNICA: todos los módulos reutilizan este cliente y su pool.
// CLASE PrismaService: Conecta Prisma con PostgreSQL mediante adapter-pg y comparte el cliente entre módulos.
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // BLOQUE constructor: Inyecta las dependencias necesarias; NestJS proporciona estas instancias al construir la clase.
  constructor(config: ConfigService) {
    super({ adapter: new PrismaPg({ connectionString: config.getOrThrow<string>('DATABASE_URL') }) });
  }
  // BLOQUE onModuleInit: Abre la conexión al iniciar el módulo de Prisma.
  async onModuleInit() { await this.$connect(); }
  // BLOQUE onModuleDestroy: Cierra la conexión al destruir la aplicación.
  async onModuleDestroy() { await this.$disconnect(); }
}
// CLASE PrismaModule: Conecta Prisma con PostgreSQL mediante adapter-pg y comparte el cliente entre módulos.
@Global()
@Module({ providers: [PrismaService], exports: [PrismaService] })
export class PrismaModule {}
