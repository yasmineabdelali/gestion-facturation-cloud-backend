import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { Facture } from '../factures/entities/facture.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Facture])],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}