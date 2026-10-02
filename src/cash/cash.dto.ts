// ARCHIVO: Declara contratos de entrada, validadores y ejemplos Swagger. Un tipo TypeScript solo no valida un JSON recibido.
// ESTUDIO: consulta docs/GUIA-CODIGO-COMPLETA.md para recorrer este archivo.
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min } from 'class-validator';
// MONTOS: apertura es fondo inicial; cierre es el efectivo contado físicamente.
// CLASE OpenCashDto: contrato de entrada cuyos decoradores comprueban los datos recibidos.
export class OpenCashDto {
  // CAMPO openingAmount: number; declarado en el contrato. Los decoradores de abajo documentan y validan este valor.
  @ApiProperty({ example: 200 }) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(99999999) openingAmount: number;
}
// CLASE CloseCashDto: contrato de entrada cuyos decoradores comprueban los datos recibidos.
export class CloseCashDto {
  // CAMPO countedAmount: number; declarado en el contrato. Los decoradores de abajo documentan y validan este valor.
  @ApiProperty({ example: 395 }) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(99999999) countedAmount: number;
}
