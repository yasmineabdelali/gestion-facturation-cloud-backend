import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm' ;
import { FacturesConsolideesService } from './factures-consolidees.service';
import { FacturesConsolideesController } from './factures-consolidees.controller';
import { FactureConsolidee } from './entities/facture-consolidee.entity';
import { Facture } from '../factures/entities/facture.entity';
import { Societe } from '../societes/entities/societe.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FactureConsolidee, Facture, Societe])],
  controllers: [FacturesConsolideesController],
  providers: [FacturesConsolideesService],
  exports: [FacturesConsolideesService],
})
export class FacturesConsolideesModule {}
