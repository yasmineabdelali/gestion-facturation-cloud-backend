import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Societe } from '../societes/entities/societe.entity';
import { Projet } from '../projets/entities/projet.entity';
import { Facture, StatutFacture } from '../factures/entities/facture.entity';
import { TypePeriode } from '../factures/entities/type-periode.enum';
import { TauxChangeService } from '../taux-change/taux-change.service';
import { Devise } from '../common/enums/devise.enum';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Societe)
    private societesRepository: Repository<Societe>,
    @InjectRepository(Projet)
    private projetsRepository: Repository<Projet>,
    @InjectRepository(Facture)
    private facturesRepository: Repository<Facture>,
    private tauxChangeService: TauxChangeService,
  ) {}

  async getIndicateurs(typePeriode: TypePeriode = TypePeriode.MENSUELLE) {
    const nombreSocietes = await this.societesRepository.count();

    const nombreProjetsActifs = await this.projetsRepository.count({
      where: { statut: 'actif' as any },
    });

    const nombreFacturesEnAttente = await this.facturesRepository.count({
      where: { statut: StatutFacture.BROUILLON, type_periode: typePeriode },
    });

    const nombreFacturesValidees = await this.facturesRepository.count({
      where: { statut: StatutFacture.VALIDEE, type_periode: typePeriode },
    });

    // Conversion multi-devises : on récupère chaque facture validée avec sa devise propre
const facturesValidees = await this.facturesRepository.find({
  where: { statut: StatutFacture.VALIDEE, type_periode: typePeriode },
  select: { montant_total: true, devise: true },
});

    let montantTotalFacture = 0;
    for (const f of facturesValidees) {
      montantTotalFacture += await this.tauxChangeService.convertirVersTnd(Number(f.montant_total), f.devise as Devise);
    }

    return {
      nombreSocietes,
      nombreProjetsActifs,
      nombreFacturesEnAttente,
      nombreFacturesValidees,
      montantTotalFacture,
      deviseAffichage: 'TND', // indique au front que ce montant agrégé est toujours en TND
    };
  }

  async getRepartitionFactures() {
    const validees = await this.facturesRepository.count({
      where: { statut: StatutFacture.VALIDEE },
    });
    const enAttente = await this.facturesRepository.count({
      where: { statut: StatutFacture.BROUILLON },
    });
    return {
      labels: ['Validées', 'En attente'],
      series: [validees, enAttente],
    };
  }

  async getMontantParSociete(typePeriode: TypePeriode = TypePeriode.MENSUELLE) {
    const result = await this.facturesRepository
      .createQueryBuilder('facture')
      .innerJoin('facture.projet', 'projet')
      .innerJoin('projet.societe', 'societe')
      .select('societe.nom', 'nom')
      .addSelect('facture.montant_total', 'montant')
      .addSelect('facture.devise', 'devise')
      .where('facture.statut = :statut', { statut: StatutFacture.VALIDEE })
      .andWhere('facture.type_periode = :typePeriode', { typePeriode })
      .getRawMany();

    const totauxParSociete = new Map<string, number>();

    for (const row of result) {
      const montantConverti = await this.tauxChangeService.convertirVersTnd(Number(row.montant), row.devise as Devise);
      totauxParSociete.set(row.nom, (totauxParSociete.get(row.nom) ?? 0) + montantConverti);
    }

    return {
      labels: Array.from(totauxParSociete.keys()),
      series: Array.from(totauxParSociete.values()),
    };
  }
}