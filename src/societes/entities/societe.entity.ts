import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

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

  @CreateDateColumn()
  date_creation: Date;
}