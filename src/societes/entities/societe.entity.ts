import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { Devise } from '../../common/enums/devise.enum';

@Entity('societes')
export class Societe {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 ,unique: true})
  nom: string;

  @Column({ length: 255, nullable: true })
  adresse: string;

  @Column({ length: 20, nullable: true })
  telephone: string;

  @Column({ length: 150, nullable: true , unique: true})
  email: string;

  @Column({ length: 100, nullable: true })
  personne_contact: string;
  
  @Column({ type: 'enum', enum: Devise, default: Devise.TND })
  devise: Devise;

  @CreateDateColumn()
  date_creation: Date;
}