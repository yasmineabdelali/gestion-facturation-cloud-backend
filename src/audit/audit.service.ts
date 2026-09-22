import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

export interface CreateAuditLogPayload {
  user_id?: number;
  user_email?: string;
  action: string;
  entite: string;
  entite_id?: number;
  details?: string;
  ip_address?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditRepository: Repository<AuditLog>,
  ) {}

  async log(payload: CreateAuditLogPayload): Promise<void> {
    try {
      const entry = this.auditRepository.create(payload);
      await this.auditRepository.save(entry);
    } catch (error) {
      // Un échec de log ne doit JAMAIS faire échouer l'action métier elle-même
      console.error('Erreur lors de l\'enregistrement du journal d\'audit', error);
    }
  }

  async findAll(filtres: { userId?: number; action?: string; entite?: string; dateDebut?: string; dateFin?: string }) {
    const query = this.auditRepository.createQueryBuilder('audit');

    if (filtres.userId) {
      query.andWhere('audit.user_id = :userId', { userId: filtres.userId });
    }
    if (filtres.action) {
      query.andWhere('audit.action = :action', { action: filtres.action });
    }
    if (filtres.entite) {
      query.andWhere('audit.entite = :entite', { entite: filtres.entite });
    }
    if (filtres.dateDebut) {
      query.andWhere('audit.date_action >= :dateDebut', { dateDebut: filtres.dateDebut });
    }
    if (filtres.dateFin) {
      query.andWhere('audit.date_action <= :dateFin', { dateFin: filtres.dateFin });
    }

    return query.orderBy('audit.date_action', 'DESC').limit(200).getMany();
  }
}