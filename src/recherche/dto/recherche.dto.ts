import { IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { TypePeriode } from '../../factures/entities/type-periode.enum';

export class RechercheDto {
  @IsOptional()
  @IsString()
  client?: string;

  @IsOptional()
  @IsString()
  so?: string;

  @IsOptional()
  @IsEnum(TypePeriode)
  typePeriode?: TypePeriode;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  annee?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  numeroPeriode?: number;
}