import { IsNotEmpty, IsOptional, IsString,IsEnum, IsEmail, MaxLength } from 'class-validator';
import { Devise } from '../../common/enums/devise.enum';

export class CreateSocieteDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  nom: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  adresse?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  telephone: string;

  @IsNotEmpty()
  @IsEmail()
  @MaxLength(150)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  personne_contact?: string;

  @IsOptional()
  @IsEnum(Devise)
  devise?: Devise;
}