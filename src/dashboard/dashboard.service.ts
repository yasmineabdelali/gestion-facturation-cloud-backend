import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Societe } from '../societes/entities/societe.entity';
import { Projet } from '../projets/entities/projet.entity';
import { Facture, StatutFacture } from '../factures/entities/facture.entity';
import { TypePeriode } from '../factures/entities/type-periode.enum';
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

async getIndicateurs(typePeriode: TypePeriode = TypePeriode.MENSUELLE) {
      const nombreSocietes = await this.societesRepository.count();

    const nombreProjetsActifs = await this.projetsRepository.count({
      where: { statut: 'actif' as any },
    });

    const nombreFacturesEnAttente = await this.facturesRepository.count({
      where: { statut: StatutFacture.BROUILLON , type_periode: typePeriode},
    });

    const nombreFacturesValidees = await this.facturesRepository.count({
      where: { statut: StatutFacture.VALIDEE , type_periode: typePeriode },
    });

    const result = await this.facturesRepository
      .createQueryBuilder('facture')
      .select('SUM(facture.montant_total)', 'total')
      .where('facture.statut = :statut', { statut: StatutFacture.VALIDEE })
      .andWhere('facture.type_periode = :typePeriode', { typePeriode })
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

  async getRepartitionFactures() {
   const validees = await this.facturesRepository.count({
    where: { statut: StatutFacture.VALIDEE},
   }) ; 
      const enAttente = await this.facturesRepository.count({
    where: { statut: StatutFacture.BROUILLON},
   }) ; 
   return {
    labels: ['Validées','En attente'],
    series: [validees , enAttente],
   };
}

async getMontantParSociete(typePeriode: TypePeriode = TypePeriode.MENSUELLE) {
  const result = await this.facturesRepository
    .createQueryBuilder('facture')
    .innerJoin('facture.projet', 'projet')
    .innerJoin('projet.societe', 'societe')
    .select('societe.nom', 'nom')
    .addSelect('SUM(facture.montant_total)', 'total')
    .where('facture.statut = :statut', { statut: StatutFacture.VALIDEE })
    .andWhere('facture.type_periode = :typePeriode', { typePeriode })
    .groupBy('societe.id')
    .addGroupBy('societe.nom')
    .getRawMany();

  return {
    labels: result.map((r) => r.nom),
    series: result.map((r) => Number(r.total)),
  };
}
}