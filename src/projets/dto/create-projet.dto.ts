import { IsNotEmpty, IsString, IsEnum, IsDateString, IsNumber, MaxLength } from 'class-validator';
import { StatutProjet } from '../entities/projet.entity';

export class CreateProjetDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  numero_so: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  nom_projet: string;

  @IsNotEmpty()
  @IsDateString()
  date_debut: string;

  @IsEnum(StatutProjet)
  statut: StatutProjet;

  @IsNotEmpty()
  @IsNumber()
  societe_id: number;
}