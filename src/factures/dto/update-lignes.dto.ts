import { IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

class LigneUpdateDto {
  @IsNumber()
  id: number;

  @IsNumber()
  @Min(0)
  quantite_consommee: number;
}

export class UpdateLignesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LigneUpdateDto)
  lignes: LigneUpdateDto[];
}