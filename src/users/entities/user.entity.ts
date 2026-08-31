import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  CONSULTANT = 'consultant',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nom: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // sera stocké hashé (bcrypt) — jamais en clair

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CONSULTANT,
  })
  role: UserRole;

  @CreateDateColumn()
  date_creation: Date;


 @Column({ nullable: true, type: 'varchar' })
resetPasswordToken: string | null;

@Column({ type: 'timestamp', nullable: true })
resetPasswordExpires: Date | null;

}