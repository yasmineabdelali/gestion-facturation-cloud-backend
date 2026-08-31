import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, OneToMany, Unique } from 'typeorm';
import { Projet } from '../../projets/entities/projet.entity';
import { LigneFacture } from './ligne-facture.entity';

export enum TypePeriode {
  MENSUELLE = 'mensuelle',
  TRIMESTRIELLE = 'trimestrielle',
  SEMESTRIELLE = 'semestrielle',
}

export enum StatutFacture {
  BROUILLON = 'brouillon',
  VALIDEE = 'validee',
}

@Entity('factures')
@Unique(['projet_id', 'type_periode', 'annee', 'numero_periode'])
export class Facture {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Projet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projet_id' })
  projet: Projet;

  @Column()
  projet_id: number;

  @Column({
    type: 'enum',
    enum: TypePeriode,
  })
  type_periode: TypePeriode;

  @Column()
  annee: number;

  @Column()
  numero_periode: number;

  @Column({
    type: 'enum',
    enum: StatutFacture,
    default: StatutFacture.BROUILLON,
  })
  statut: StatutFacture;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  montant_total: number;

  @Column({ type: 'timestamp', nullable: true })
  date_validation: Date | null;

  @OneToMany(() => LigneFacture, (ligne) => ligne.facture, { cascade: true })
  lignes: LigneFacture[];

  @CreateDateColumn()
  date_creation: Date;
}