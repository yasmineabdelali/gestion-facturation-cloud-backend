import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OffresService } from './offres.service';
import { OffresController } from './offres.controller';
import { OffreFinanciere } from './entities/offre-financiere.entity';
import { RessourceOffre } from './entities/ressource-offre.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OffreFinanciere, RessourceOffre])],
  controllers: [OffresController],
  providers: [OffresService],
})
export class OffresModule {}
