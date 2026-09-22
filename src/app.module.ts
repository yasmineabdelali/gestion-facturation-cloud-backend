import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SocietesModule } from './societes/societes.module';
import { ProjetsModule } from './projets/projets.module';
import { OffresModule } from './offres/offres.module';
import { FacturesModule } from './factures/factures.module';
import { FacturesConsolideesModule } from './factures-consolidees/factures-consolidees.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { RechercheModule } from './recherche/recherche.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditModule } from './audit/audit.module';
import { AuditInterceptor } from './audit/audit.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { StatistiquesModule } from './statistiques/statistiques.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // rend process.env accessible partout sans réimporter
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
MailerModule.forRootAsync({
  useFactory: (configService: ConfigService) => ({
    transport: {
      service: 'gmail',
      auth: {
        user: configService.get('MAIL_USER'),
        pass: configService.get('MAIL_PASS'),
      },
    },
    defaults: {
      from: `"Facturation Cloud" <${configService.get('MAIL_USER')}>`,
    },
  }),
  inject: [ConfigService],
}),
    UsersModule,
    AuthModule,
    SocietesModule,
    ProjetsModule,
    OffresModule,
    FacturesModule,
    FacturesConsolideesModule,
    DashboardModule,
    RechercheModule,
    NotificationsModule,
    AuditModule,
    StatistiquesModule,
  ],
  controllers: [AppController],
  providers: [AppService,
        {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}