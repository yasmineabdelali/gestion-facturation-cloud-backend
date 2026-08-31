import { IsNotEmpty, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { TypePeriode } from '../entities/facture.entity';

export class CreateFactureDto {
  @IsNotEmpty()
  @IsNumber()
  projet_id: number;

  @IsEnum(TypePeriode)
  type_periode: TypePeriode;

  @IsNumber()
  @Min(2020)
  annee: number;

  @IsNumber()
  @Min(1)
  numero_periode: number;
}