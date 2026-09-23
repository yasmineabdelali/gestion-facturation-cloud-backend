import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Devise } from '../../common/enums/devise.enum';

@Entity('taux_change')
export class TauxChange {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: Devise, unique: true })
  devise: Devise;

  @Column('decimal', { precision: 12, scale: 6 })
  taux_vers_tnd: number;

  @UpdateDateColumn()
  date_maj: Date;
}