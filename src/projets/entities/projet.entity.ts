import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Societe } from '../../societes/entities/societe.entity';

export enum StatutProjet {
  ACTIF = 'actif',
  INACTIF = 'inactif',
  TERMINE = 'termine',
}

@Entity('projets')
export class Projet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  numero_so: string;

  @Column({ length: 150 })
  nom_projet: string;

  @Column({ type: 'date' })
  date_debut: Date;

  @Column({
    type: 'enum',
    enum: StatutProjet,
    default: StatutProjet.ACTIF,
  })
  statut: StatutProjet;

  @ManyToOne(() => Societe, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'societe_id' })
  societe: Societe;

  @Column()
  societe_id: number;

  @CreateDateColumn()
  date_creation: Date;
}