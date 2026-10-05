// Declara contratos de entrada, validadores y ejemplos Swagger. Un tipo TypeScript solo no valida un JSON recibido.

import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min } from 'class-validator';
// apertura es fondo inicial; cierre es el efectivo contado físicamente.

export class OpenCashDto {
  // Efectivo con el que se abre la caja.
  @ApiProperty({ example: 200 }) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(99999999) openingAmount: number;
}

export class CloseCashDto {
  // Efectivo contado al cerrar la caja.
  @ApiProperty({ example: 395 }) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(99999999) countedAmount: number;
}
