import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { TauxChangeService } from './taux-change.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { Devise } from '../common/enums/devise.enum';

@Controller('taux-change')
@UseGuards(JwtAuthGuard)
export class TauxChangeController {
  constructor(private readonly tauxChangeService: TauxChangeService) {}

  @Get()
  findAll() {
    return this.tauxChangeService.findAll();
  }

  @Patch(':devise')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('devise') devise: Devise, @Body('taux') taux: number) {
    return this.tauxChangeService.updateTaux(devise, taux);
  }
}