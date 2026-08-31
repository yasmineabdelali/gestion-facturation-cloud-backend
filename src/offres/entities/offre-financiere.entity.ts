import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Projet } from '../../projets/entities/projet.entity';
import { RessourceOffre } from './ressource-offre.entity';

export enum StatutOffre {
  ACTIVE = 'active',
  ARCHIVEE = 'archivee',
}

@Entity('offres_financieres')
export class OffreFinanciere {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Projet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projet_id' })
  projet: Projet;

  @Column()
  projet_id: number;

  @Column({ default: 1 })
  version: number;

  @Column({ length: 255 })
  nom_fichier_original: string;

  @Column({
    type: 'enum',
    enum: StatutOffre,
    default: StatutOffre.ACTIVE,
  })
  statut: StatutOffre;

  @OneToMany(() => RessourceOffre, (ressource) => ressource.offre)
  ressources: RessourceOffre[];

  @CreateDateColumn()
  date_import: Date;
}