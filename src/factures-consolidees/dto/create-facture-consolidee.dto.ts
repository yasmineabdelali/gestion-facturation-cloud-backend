import { IsNotEmpty, IsEnum, IsNumber, Min } from 'class-validator';
import { TypePeriode } from '../../factures/entities/type-periode.enum';

export class CreateFactureConsolideeDto {
  @IsNotEmpty()
  @IsNumber()
  societe_id: number;

  @IsEnum(TypePeriode)
  type_periode: TypePeriode;

  @IsNumber()
  @Min(2020)
  annee: number;

  @IsNumber()
  @Min(1)
  numero_periode: number;
}