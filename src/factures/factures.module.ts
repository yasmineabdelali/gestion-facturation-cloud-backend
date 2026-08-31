import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacturesService } from './factures.service';
import { FacturesController } from './factures.controller';
import { Facture } from './entities/facture.entity';
import { LigneFacture } from './entities/ligne-facture.entity';
import { OffreFinanciere } from '../offres/entities/offre-financiere.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Facture,LigneFacture,OffreFinanciere])],
  providers: [FacturesService],
  controllers: [FacturesController],
  exports: [FacturesService],
})
export class FacturesModule {}
