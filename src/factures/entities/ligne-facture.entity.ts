import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Facture } from './facture.entity';

@Entity('lignes_facture')
export class LigneFacture {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Facture, (facture) => facture.lignes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'facture_id' })
  facture: Facture;

  @Column()
  facture_id: number;

  // Référence à la ressource d'offre d'origine (pour traçabilité), mais on garde
  // aussi une copie figée des infos, au cas où l'offre change plus tard
  @Column({ nullable: true })
  ressource_offre_id: number;

  @Column({ length: 150 })
  ressource_cloud: string;

  @Column({ length: 30 })
  unite: string;

  @Column('decimal', { precision: 10, scale: 4 })
  prix_unitaire: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  quantite_consommee: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  montant_ligne: number;
}