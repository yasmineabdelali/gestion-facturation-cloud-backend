import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FactureConsolidee } from './entities/facture-consolidee.entity';
import { Facture, StatutFacture } from '../factures/entities/facture.entity';
import { Societe } from '../societes/entities/societe.entity';
import { CreateFactureConsolideeDto } from './dto/create-facture-consolidee.dto';
import { TypePeriode } from '../factures/entities/type-periode.enum';
@Injectable()
export class FacturesConsolideesService {
  constructor(
    @InjectRepository(FactureConsolidee)
    private consolideesRepository: Repository<FactureConsolidee>,
    @InjectRepository(Facture)
    private facturesRepository: Repository<Facture>,
    @InjectRepository(Societe)
    private societesRepository: Repository<Societe>,
  ) {}

  async create(dto: CreateFactureConsolideeDto): Promise<FactureConsolidee> {
    // 1. Vérifier que la société existe
    const societe = await this.societesRepository.findOne({ where: { id: dto.societe_id } });
    if (!societe) {
      throw new NotFoundException(`Société avec l'id ${dto.societe_id} introuvable`);
    }

    // 2. Vérifier qu'une consolidation n'existe pas déjà pour cette période
    const existing = await this.consolideesRepository.findOne({
      where: {
        societe_id: dto.societe_id,
        type_periode: dto.type_periode,
        annee: dto.annee,
        numero_periode: dto.numero_periode,
      },
    });
    if (existing) {
      throw new ConflictException('Une facture consolidée existe déjà pour cette période');
    }

    // 3. Trouver toutes les factures VALIDÉES des projets de cette société, pour cette période
    const facturesValidees = await this.facturesRepository
      .createQueryBuilder('facture')
      .innerJoin('facture.projet', 'projet')
      .where('projet.societe_id = :societeId', { societeId: dto.societe_id })
      .andWhere('facture.type_periode = :typePeriode', { typePeriode: dto.type_periode })
      .andWhere('facture.annee = :annee', { annee: dto.annee })
      .andWhere('facture.numero_periode = :numeroPeriode', { numeroPeriode: dto.numero_periode })
      .andWhere('facture.statut = :statut', { statut: StatutFacture.VALIDEE })
      .andWhere('facture.facture_consolidee_id IS NULL')
      .getMany();

    if (facturesValidees.length === 0) {
      throw new BadRequestException(
        'Aucune facture validée trouvée pour cette société et cette période — impossible de créer la consolidation',
      );
    }

    // 4. Calculer le montant total
    const montantTotal = facturesValidees.reduce((sum, f) => sum + Number(f.montant_total), 0);

    // 5. Créer la facture consolidée
    const consolidee = this.consolideesRepository.create({
      societe_id: dto.societe_id,
      type_periode: dto.type_periode,
      annee: dto.annee,
      numero_periode: dto.numero_periode,
      montant_total: montantTotal,
    });
    const consolideeSauvegardee = await this.consolideesRepository.save(consolidee);

    // 6. Lier chaque facture individuelle à cette consolidation
    for (const facture of facturesValidees) {
      facture.facture_consolidee_id = consolideeSauvegardee.id;
      await this.facturesRepository.save(facture);
    }

    return this.findOne(consolideeSauvegardee.id);
  }

  async findBySociete(societeId: number): Promise<FactureConsolidee[]> {
    return this.consolideesRepository.find({
      where: { societe_id: societeId },
      relations: { factures: true },
      order: { annee: 'DESC', numero_periode: 'DESC' },
    });
  }

  async findOne(id: number): Promise<FactureConsolidee> {
    const consolidee = await this.consolideesRepository.findOne({
      where: { id },
      relations: { factures: { projet: true }, societe: true },
    });
    if (!consolidee) {
      throw new NotFoundException(`Facture consolidée avec l'id ${id} introuvable`);
    }
    return consolidee;
  }
//recherche des factures consolides 
async search(filtres: { client?: string; typePeriode?: TypePeriode; annee?: number; numeroPeriode?: number }) {
  const query = this.consolideesRepository
    .createQueryBuilder('consolidee')
    .leftJoinAndSelect('consolidee.societe', 'societe');

  if (filtres.client) {
    query.andWhere('societe.nom LIKE :client', { client: `%${filtres.client}%` });
  }

  if (filtres.typePeriode) {
    query.andWhere('consolidee.type_periode = :typePeriode', { typePeriode: filtres.typePeriode });
  }

  if (filtres.annee) {
    query.andWhere('consolidee.annee = :annee', { annee: filtres.annee });
  }

  if (filtres.numeroPeriode) {
    query.andWhere('consolidee.numero_periode = :numeroPeriode', { numeroPeriode: filtres.numeroPeriode });
  }

  return query.orderBy('consolidee.annee', 'DESC').addOrderBy('consolidee.numero_periode', 'DESC').getMany();
}

}