import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ProjetsService } from './projets.service';
import { CreateProjetDto } from './dto/create-projet.dto';
import { UpdateProjetDto } from './dto/update-projet.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('projets')
@UseGuards(JwtAuthGuard)
export class ProjetsController {
  constructor(private readonly projetsService: ProjetsService) {}

  @Post()
  create(@Body() dto: CreateProjetDto) {
    return this.projetsService.create(dto);
  }

  @Get()
  findAll(@Query('societe_id') societeId?: string) {
    if (societeId) {
      return this.projetsService.findBySociete(+societeId);
    }
    return this.projetsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.projetsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProjetDto) {
    return this.projetsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.projetsService.remove(id);
  }
}