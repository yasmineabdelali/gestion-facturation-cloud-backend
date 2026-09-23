import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TauxChange } from './entities/taux-change.entity';
import { TauxChangeService } from './taux-change.service';
import { TauxChangeController } from './taux-change.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([TauxChange])],
  controllers: [TauxChangeController],
  providers: [TauxChangeService],
  exports: [TauxChangeService],
})
export class TauxChangeModule {}