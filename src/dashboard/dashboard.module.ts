import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Societe } from '../societes/entities/societe.entity';
import { Projet } from '../projets/entities/projet.entity';
import { Facture } from '../factures/entities/facture.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Societe, Projet, Facture])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
