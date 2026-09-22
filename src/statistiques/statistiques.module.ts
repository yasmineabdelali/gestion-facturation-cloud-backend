import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatistiquesService } from './statistiques.service';
import { StatistiquesController } from './statistiques.controller';
import { LigneFacture } from '../factures/entities/ligne-facture.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LigneFacture])],
  controllers: [StatistiquesController],
  providers: [StatistiquesService],
})
export class StatistiquesModule {}