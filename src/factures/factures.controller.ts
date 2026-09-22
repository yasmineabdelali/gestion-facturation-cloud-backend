import { Controller, Get, Post, Patch, Param, Body, ParseIntPipe, Query, UseGuards, Res } from '@nestjs/common';
import { FacturesService } from './factures.service';
import { CreateFactureDto } from './dto/create-facture.dto';
import { UpdateLignesDto } from './dto/update-lignes.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { TypePeriode } from './entities/type-periode.enum';
import type { Response } from 'express';

@Controller('factures')
@UseGuards(JwtAuthGuard)
export class FacturesController {
  constructor(private readonly facturesService: FacturesService) {}

  @Post()
  create(@Body() dto: CreateFactureDto) {
    return this.facturesService.create(dto);
  }

  // Routes spécifiques AVANT les routes génériques (:id), pour éviter tout conflit
  @Get('projet/:projetId/comparaison')
  getComparaison(
    @Param('projetId', ParseIntPipe) projetId: number,
    @Query('typePeriode') typePeriode?: TypePeriode,
    @Query('annee') annee?: string,
    @Query('numeroPeriode') numeroPeriode?: string,
  ) {
    return this.facturesService.comparaisonPrevueReelle(
      projetId,
      typePeriode,
      annee ? Number(annee) : undefined,
      numeroPeriode ? Number(numeroPeriode) : undefined,
    );
  }

  @Get('projet/:projetId')
  findByProjet(@Param('projetId', ParseIntPipe) projetId: number) {
    return this.facturesService.findByProjet(projetId);
  }

  @Get()
  findAll() {
    return this.facturesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.facturesService.findOne(id);
  }

  @Patch(':id/lignes')
  updateLignes(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLignesDto) {
    return this.facturesService.updateLignes(id, dto);
  }

  @Patch(':id/valider')
  valider(@Param('id', ParseIntPipe) id: number) {
    return this.facturesService.valider(id);
  }

  @Patch(':id/devalider')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  devalider(@Param('id', ParseIntPipe) id: number) {
    return this.facturesService.devaliderAdmin(id);
  }

  @Get(':id/pdf')
  async downloadPdf(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    await this.facturesService.genererPdf(id, res);
  }

  @Get(':id/excel')
  async downloadExcel(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const facture = await this.facturesService.findOne(id);
    const buffer = await this.facturesService.genererExcel(id);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=facture-${facture.type_periode}-${facture.numero_periode}-${facture.annee}.xlsx`);
    res.send(buffer);
  }
}