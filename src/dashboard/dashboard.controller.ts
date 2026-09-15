import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TypePeriode } from '../factures/entities/type-periode.enum';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('indicateurs')
  getIndicateurs(@Query('typePeriode') typePeriode?: TypePeriode) {
    return this.dashboardService.getIndicateurs(typePeriode);
  }

  @Get('repartition-factures')
  getRepartitionFactures() {
    return this.dashboardService.getRepartitionFactures();
  }

  @Get('montant-par-societe')
  getMontantParSociete(@Query('typePeriode') typePeriode?: TypePeriode) {
    return this.dashboardService.getMontantParSociete(typePeriode);
  }
}