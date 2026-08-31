import { IsNotEmpty, IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class RessourceOffreDto {
  @IsNotEmpty()
  @IsString()
  ressource_cloud: string;

  @IsOptional()
  @IsString()
  type_service?: string;

  @IsNumber()
  @Min(0)
  quantite: number;

  @IsNotEmpty()
  @IsString()
  unite: string;

  @IsNumber()
  @Min(0)
  prix_unitaire: number;

  @IsOptional()
  @IsString()
  description?: string;
}