import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { OffreFinanciere } from './offre-financiere.entity';

@Entity('ressources_offre')
export class RessourceOffre {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => OffreFinanciere, (offre) => offre.ressources, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'offre_id' })
  offre: OffreFinanciere;

  @Column()
  offre_id: number;

  @Column({ length: 150 })
  ressource_cloud: string;

  @Column({ length: 100, nullable: true })
  type_service: string;

  @Column('decimal', { precision: 10, scale: 2 })
  quantite: number;

  @Column({ length: 30 })
  unite: string;

  @Column('decimal', { precision: 10, scale: 4 })
  prix_unitaire: number;

  @Column({ type: 'text', nullable: true })
  description: string;
}