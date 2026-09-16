import { Module } from '@nestjs/common';
import { RechercheService } from './recherche.service';
import { RechercheController } from './recherche.controller';
import { FacturesModule } from '../factures/factures.module';
import { FacturesConsolideesModule } from '../factures-consolidees/factures-consolidees.module';

@Module({
  imports: [FacturesModule, FacturesConsolideesModule],
  controllers: [RechercheController],
  providers: [RechercheService],
})
export class RechercheModule {}