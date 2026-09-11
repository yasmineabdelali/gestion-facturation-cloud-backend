import { Controller, Get, Post, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { FacturesConsolideesService } from './factures-consolidees.service';
import { CreateFactureConsolideeDto } from './dto/create-facture-consolidee.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('factures-consolidees')
@UseGuards(JwtAuthGuard)
export class FacturesConsolideesController {
  constructor(private readonly facturesConsolideesService: FacturesConsolideesService) {}

  @Post()
  create(@Body() dto: CreateFactureConsolideeDto) {
    return this.facturesConsolideesService.create(dto);
  }

  @Get('societe/:societeId')
  findBySociete(@Param('societeId', ParseIntPipe) societeId: number) {
    return this.facturesConsolideesService.findBySociete(societeId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.facturesConsolideesService.findOne(id);
  }
}