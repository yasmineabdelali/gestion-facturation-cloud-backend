import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LigneFacture } from '../factures/entities/ligne-facture.entity';
import { StatutFacture } from '../factures/entities/facture.entity';
import { TypePeriode } from '../factures/entities/type-periode.enum';

@Injectable()
export class StatistiquesService {
  constructor(
    @InjectRepository(LigneFacture)
    private lignesRepository: Repository<LigneFacture>,
  ) {}

  async getConsommationParClient(typePeriode?: TypePeriode) {
    const query = this.lignesRepository  //construire la requete 
      .createQueryBuilder('ligne')
      .innerJoin('ligne.facture', 'facture')
      .innerJoin('facture.projet', 'projet')
      .innerJoin('projet.societe', 'societe')
      .select('societe.id', 'societeId')
      .addSelect('societe.nom', 'nom')
      .addSelect('SUM(ligne.quantite_consommee)', 'quantiteTotale')
      .addSelect('SUM(ligne.montant_ligne)', 'montantTotal')
      .where('facture.statut = :statut', { statut: StatutFacture.VALIDEE });

    if (typePeriode) {
      query.andWhere('facture.type_periode = :typePeriode', { typePeriode });
    }

    const result = await query
      .groupBy('societe.id')
      .addGroupBy('societe.nom')
      .orderBy('montantTotal', 'DESC')
      .getRawMany();  //exécute réellement la requête SQL et récupère les résultats

    return result.map((r) => ({
      societeId: r.societeId,
      nom: r.nom,
      quantiteTotale: Number(r.quantiteTotale) || 0,
      montantTotal: Number(r.montantTotal) || 0,
    }));
  }

  async getConsommationParRessource(typePeriode?: TypePeriode) {
    const query = this.lignesRepository
      .createQueryBuilder('ligne')
      .innerJoin('ligne.facture', 'facture')
      .select('ligne.ressource_cloud', 'ressourceCloud')
      .addSelect('ligne.unite', 'unite')
      .addSelect('SUM(ligne.quantite_consommee)', 'quantiteTotale')
      .addSelect('SUM(ligne.montant_ligne)', 'montantTotal')
      .where('facture.statut = :statut', { statut: StatutFacture.VALIDEE });

    if (typePeriode) {
      query.andWhere('facture.type_periode = :typePeriode', { typePeriode });
    }

    const result = await query
      .groupBy('ligne.ressource_cloud')
      .addGroupBy('ligne.unite')
      .orderBy('montantTotal', 'DESC')
      .getRawMany();

    return result.map((r) => ({
      ressourceCloud: r.ressourceCloud,
      unite: r.unite,
      quantiteTotale: Number(r.quantiteTotale) || 0,
      montantTotal: Number(r.montantTotal) || 0,
    }));
  }
}