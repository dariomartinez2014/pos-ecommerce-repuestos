import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min } from 'class-validator';
// MONTOS: apertura es fondo inicial; cierre es el efectivo contado físicamente.
export class OpenCashDto {
  @ApiProperty({ example: 200 }) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(99999999) openingAmount: number;
}
export class CloseCashDto {
  @ApiProperty({ example: 395 }) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(99999999) countedAmount: number;
}
