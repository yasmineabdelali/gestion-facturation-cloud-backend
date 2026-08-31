import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocietesService } from './societes.service';
import { SocietesController } from './societes.controller';
import { Societe } from './entities/societe.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Societe])],
  controllers: [SocietesController],
  providers: [SocietesService],
  exports: [SocietesService],
})
export class SocietesModule {}
