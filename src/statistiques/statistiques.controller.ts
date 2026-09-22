import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatistiquesService } from './statistiques.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TypePeriode } from '../factures/entities/type-periode.enum';

@Controller('statistiques')
@UseGuards(JwtAuthGuard)
export class StatistiquesController {
  constructor(private readonly statistiquesService: StatistiquesService) {}

  @Get('consommation-par-client')
  getConsommationParClient(@Query('typePeriode') typePeriode?: TypePeriode) {
    return this.statistiquesService.getConsommationParClient(typePeriode);
  }

  @Get('consommation-par-ressource')
  getConsommationParRessource(@Query('typePeriode') typePeriode?: TypePeriode) {
    return this.statistiquesService.getConsommationParRessource(typePeriode);
  }
}