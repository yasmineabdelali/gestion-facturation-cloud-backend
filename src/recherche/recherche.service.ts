import { Injectable } from '@nestjs/common';
import { FacturesService } from '../factures/factures.service';
import { FacturesConsolideesService } from '../factures-consolidees/factures-consolidees.service';
import { RechercheDto } from './dto/recherche.dto';

@Injectable()
export class RechercheService {
  constructor(
    private facturesService: FacturesService,
    private facturesConsolideesService: FacturesConsolideesService,
  ) {}
                                                             
  async rechercher(dto: RechercheDto) {                             //await — chaque requête attend que la précédente se termine avant de démarrer.
    const [factures, facturesConsolidees] = await Promise.all([    //Promise.all() permet de lancer plusieurs requêtes en parallèle,
      this.facturesService.search({
        client: dto.client,
        so: dto.so,
        typePeriode: dto.typePeriode,
        annee: dto.annee,
        numeroPeriode: dto.numeroPeriode,
      }),
      this.facturesConsolideesService.search({
        client: dto.client,
        typePeriode: dto.typePeriode,
        annee: dto.annee,
        numeroPeriode: dto.numeroPeriode,
      }),
    ]);

    return { factures, facturesConsolidees };
  }
}