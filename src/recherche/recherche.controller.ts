import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RechercheService } from './recherche.service';
import { RechercheDto } from './dto/recherche.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('recherche')
@UseGuards(JwtAuthGuard)
export class RechercheController {
  constructor(private readonly rechercheService: RechercheService) {}

  @Get()
  rechercher(@Query() dto: RechercheDto) {
    return this.rechercheService.rechercher(dto);
  }
}