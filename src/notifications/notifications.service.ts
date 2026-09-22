import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Facture, StatutFacture } from '../factures/entities/facture.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Facture)
    private facturesRepository: Repository<Facture>,
  ) {}

  async getFacturesEnAttente() {
    const factures = await this.facturesRepository.find({
      where: { statut: StatutFacture.BROUILLON },
      relations: { projet: { societe: true } },
      order: { annee: 'DESC', numero_periode: 'DESC' },
    });

    const maintenant = new Date();
    const dernierJourDuMois = new Date(maintenant.getFullYear(), maintenant.getMonth() + 1, 0).getDate();
    const jourActuel = maintenant.getDate();
const estFinDeMois = jourActuel >= dernierJourDuMois - 15; // test large, à remettre à -4 après
    return {
      estFinDeMois,
      count: factures.length,
      factures,
    };
  }
}