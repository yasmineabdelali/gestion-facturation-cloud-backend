import { Controller, Get, Post, Patch, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { FacturesService } from './factures.service';
import { CreateFactureDto } from './dto/create-facture.dto';
import { UpdateLignesDto } from './dto/update-lignes.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { Res } from '@nestjs/common';
import type { Response } from 'express';@Controller('factures')
@UseGuards(JwtAuthGuard)
export class FacturesController {
  constructor(private readonly facturesService: FacturesService) {}

  @Post()
  create(@Body() dto: CreateFactureDto) {
    return this.facturesService.create(dto);
  }

  @Get('projet/:projetId')
  findByProjet(@Param('projetId', ParseIntPipe) projetId: number) {
    return this.facturesService.findByProjet(projetId);
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
  //telechargement facture pdf
  @Get(':id/pdf')
async downloadPdf(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
  await this.facturesService.genererPdf(id, res);
}
//exportation liste des facture  en excel
@Get(':id/excel')
async downloadExcel(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
  const facture = await this.facturesService.findOne(id);
  const buffer = await this.facturesService.genererExcel(id);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=facture-${facture.type_periode}-${facture.numero_periode}-${facture.annee}.xlsx`);
  res.send(buffer);
}
}