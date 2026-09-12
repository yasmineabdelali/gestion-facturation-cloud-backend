import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Societe } from '../societes/entities/societe.entity';
import { Projet } from '../projets/entities/projet.entity';
import { Facture, StatutFacture } from '../factures/entities/facture.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Societe)
    private societesRepository: Repository<Societe>,
    @InjectRepository(Projet)
    private projetsRepository: Repository<Projet>,
    @InjectRepository(Facture)
    private facturesRepository: Repository<Facture>,
  ) {}

  async getIndicateurs() {
    const nombreSocietes = await this.societesRepository.count();

    const nombreProjetsActifs = await this.projetsRepository.count({
      where: { statut: 'actif' as any },
    });

    const nombreFacturesEnAttente = await this.facturesRepository.count({
      where: { statut: StatutFacture.BROUILLON },
    });

    const nombreFacturesValidees = await this.facturesRepository.count({
      where: { statut: StatutFacture.VALIDEE },
    });

    const result = await this.facturesRepository
      .createQueryBuilder('facture')
      .select('SUM(facture.montant_total)', 'total')
      .where('facture.statut = :statut', { statut: StatutFacture.VALIDEE })
      .getRawOne();

    const montantTotalFacture = Number(result?.total) || 0;

    return {
      nombreSocietes,
      nombreProjetsActifs,
      nombreFacturesEnAttente,
      nombreFacturesValidees,
      montantTotalFacture,
    };
  }
}