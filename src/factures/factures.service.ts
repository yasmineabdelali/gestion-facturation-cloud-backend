import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Facture, StatutFacture, TypePeriode } from './entities/facture.entity';
import { LigneFacture } from './entities/ligne-facture.entity';
import { OffreFinanciere, StatutOffre } from '../offres/entities/offre-financiere.entity';
import { CreateFactureDto } from './dto/create-facture.dto';
import { UpdateLignesDto } from './dto/update-lignes.dto';

@Injectable()
export class FacturesService {
  constructor(
    @InjectRepository(Facture)
    private facturesRepository: Repository<Facture>,
    @InjectRepository(LigneFacture)
    private lignesRepository: Repository<LigneFacture>,
    @InjectRepository(OffreFinanciere)
    private offresRepository: Repository<OffreFinanciere>,
  ) {}

  async create(dto: CreateFactureDto): Promise<Facture> {
    const existing = await this.facturesRepository.findOne({
      where: {
        projet_id: dto.projet_id,
        type_periode: dto.type_periode,
        annee: dto.annee,
        numero_periode: dto.numero_periode,
      },
    });

    if (existing) {
      throw new ConflictException('Une facture existe déjà pour cette période');
    }

    // Chercher la période précédente du même type pour reprise automatique (section 7)
    const periodePrecedente = await this.findPeriodePrecedente(dto.projet_id, dto.type_periode, dto.annee, dto.numero_periode);

    const facture = this.facturesRepository.create({
      projet_id: dto.projet_id,
      type_periode: dto.type_periode,
      annee: dto.annee,
      numero_periode: dto.numero_periode,
      statut: StatutFacture.BROUILLON,
    });
    const factureSauvegardee = await this.facturesRepository.save(facture);

    let lignes: LigneFacture[];

    if (periodePrecedente) {
      // Reprise automatique : on copie les lignes de la période précédente
      lignes = periodePrecedente.lignes.map((l) =>
        this.lignesRepository.create({
          facture_id: factureSauvegardee.id,
          ressource_offre_id: l.ressource_offre_id,
          ressource_cloud: l.ressource_cloud,
          unite: l.unite,
          prix_unitaire: l.prix_unitaire,
          quantite_consommee: l.quantite_consommee,
          montant_ligne: Number(l.quantite_consommee) * Number(l.prix_unitaire),
        }),
      );
    } else {
      // Pas de période précédente : on préremplit depuis l'offre financière active
      const offreActive = await this.offresRepository.findOne({
        where: { projet_id: dto.projet_id, statut: StatutOffre.ACTIVE },
        relations: { ressources: true },
      });

      if (!offreActive || offreActive.ressources.length === 0) {
        throw new BadRequestException("Aucune offre financière active pour ce projet — impossible de créer la facture");
      }

      lignes = offreActive.ressources.map((r) =>
        this.lignesRepository.create({
          facture_id: factureSauvegardee.id,
          ressource_offre_id: r.id,
          ressource_cloud: r.ressource_cloud,
          unite: r.unite,
          prix_unitaire: r.prix_unitaire,
          quantite_consommee: 0,
          montant_ligne: 0,
        }),
      );
    }

    await this.lignesRepository.save(lignes);

    return this.findOne(factureSauvegardee.id);
  }

  private async findPeriodePrecedente(
    projetId: number,
    typePeriode: TypePeriode,
    annee: number,
    numeroPeriode: number,
  ): Promise<Facture | null> {
    // On cherche la dernière facture du même type, avant la période demandée (triée par année/numéro décroissant)
    const factures = await this.facturesRepository.find({
      where: { projet_id: projetId, type_periode: typePeriode },
      relations: { lignes: true },
      order: { annee: 'DESC', numero_periode: 'DESC' },
    });

    return (
      factures.find((f) => f.annee < annee || (f.annee === annee && f.numero_periode < numeroPeriode)) || null
    );
  }

  async findByProjet(projetId: number): Promise<Facture[]> {
    return this.facturesRepository.find({
      where: { projet_id: projetId },
      order: { annee: 'DESC', numero_periode: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Facture> {
    const facture = await this.facturesRepository.findOne({
      where: { id },
      relations: { lignes: true, projet: true },
    });
    if (!facture) {
      throw new NotFoundException(`Facture avec l'id ${id} introuvable`);
    }
    return facture;
  }

  async updateLignes(id: number, dto: UpdateLignesDto): Promise<Facture> {
    const facture = await this.findOne(id);

    if (facture.statut === StatutFacture.VALIDEE) {
      throw new ForbiddenException('Cette facture est validée et ne peut plus être modifiée');
    }

    for (const ligneDto of dto.lignes) {
      const ligne = facture.lignes.find((l) => l.id === ligneDto.id);
      if (ligne) {
        ligne.quantite_consommee = ligneDto.quantite_consommee;
        ligne.montant_ligne = ligneDto.quantite_consommee * Number(ligne.prix_unitaire);
        await this.lignesRepository.save(ligne);
      }
    }

    const montantTotal = await this.calculerMontantTotal(id);
    await this.facturesRepository.update(id, { montant_total: montantTotal });

    return this.findOne(id);
  }

  async valider(id: number): Promise<Facture> {
    const facture = await this.findOne(id);

    if (facture.statut === StatutFacture.VALIDEE) {
      throw new ConflictException('Cette facture est déjà validée');
    }

    const montantTotal = await this.calculerMontantTotal(id);

    await this.facturesRepository.update(id, {
      statut: StatutFacture.VALIDEE,
      montant_total: montantTotal,
      date_validation: new Date(),
    });

    return this.findOne(id);
  }

  async devaliderAdmin(id: number): Promise<Facture> {
    // Réservé aux admins : permet de rouvrir une facture validée (section 8 : "sauf autorisation administrateur")
    await this.facturesRepository.update(id, {
      statut: StatutFacture.BROUILLON,
      date_validation: null,
    });
    return this.findOne(id);
  }

  private async calculerMontantTotal(factureId: number): Promise<number> {
    const facture = await this.findOne(factureId);
    return facture.lignes.reduce((sum, l) => sum + Number(l.quantite_consommee) * Number(l.prix_unitaire), 0);
  }
}