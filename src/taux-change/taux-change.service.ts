import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TauxChange } from './entities/taux-change.entity';
import { Devise } from '../common/enums/devise.enum';

@Injectable()
export class TauxChangeService implements OnModuleInit {
  constructor(
    @InjectRepository(TauxChange)
    private tauxRepository: Repository<TauxChange>,
  ) {}

  // Initialise des taux par défaut si la table est vide (première utilisation)
  async onModuleInit() {
    const count = await this.tauxRepository.count();
    if (count === 0) {
      await this.tauxRepository.save([
        this.tauxRepository.create({ devise: Devise.TND, taux_vers_tnd: 1 }),
        this.tauxRepository.create({ devise: Devise.EUR, taux_vers_tnd: 3.4 }),
        this.tauxRepository.create({ devise: Devise.USD, taux_vers_tnd: 3.1 }),
      ]);
    }
  }

  async findAll(): Promise<TauxChange[]> {
    return this.tauxRepository.find();
  }

  async updateTaux(devise: Devise, taux: number): Promise<TauxChange> {
    let entry = await this.tauxRepository.findOne({ where: { devise } });
    if (!entry) {
      entry = this.tauxRepository.create({ devise, taux_vers_tnd: taux });
    } else {
      entry.taux_vers_tnd = taux;
    }
    return this.tauxRepository.save(entry);
  }

  async convertirVersTnd(montant: number, devise: Devise): Promise<number> {
    const taux = await this.tauxRepository.findOne({ where: { devise } });
    if (!taux) return montant;
    return montant * Number(taux.taux_vers_tnd);
  }
}