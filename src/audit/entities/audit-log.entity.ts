import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  user_id: number;

  @Column({ nullable: true })
  user_email: string;

  @Column()
  action: string; // ex: 'CREATE', 'VALIDER', 'IMPORT_OFFRE', 'DEVALIDER'

  @Column()
  entite: string; // ex: 'Facture', 'Offre', 'Societe', 'Projet'

  @Column({ nullable: true })
  entite_id: number;

  @Column({ type: 'text', nullable: true })
  details: string;

  @Column({ nullable: true })
  ip_address: string;

  @CreateDateColumn()
  date_action: Date;
}