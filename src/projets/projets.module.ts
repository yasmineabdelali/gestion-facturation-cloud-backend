import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjetsService } from './projets.service';
import { ProjetsController } from './projets.controller';
import { Projet } from './entities/projet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Projet])],
  controllers: [ProjetsController],
  providers: [ProjetsService],
  exports: [ProjetsService],

})
export class ProjetsModule {}
