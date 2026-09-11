import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Societe } from '../../societes/entities/societe.entity';
import { Facture } from '../../factures/entities/facture.entity';
import { TypePeriode } from '../../factures/entities/type-periode.enum';
@Entity('factures_consolidees')
export class FactureConsolidee {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Societe, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'societe_id' })
  societe: Societe;

  @Column()
  societe_id: number;

  @Column({
    type: 'enum',
    enum: TypePeriode,
  })
  type_periode: TypePeriode;

  @Column()
  annee: number;

  @Column()
  numero_periode: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  montant_total: number;

  @OneToMany(() => Facture, (facture) => facture.factureConsolidee)
  factures: Facture[];

  @CreateDateColumn()
  date_creation: Date;
}