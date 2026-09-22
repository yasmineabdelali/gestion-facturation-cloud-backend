import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { SocietesService } from './societes.service';
import { CreateSocieteDto } from './dto/create-societe.dto';
import { UpdateSocieteDto } from './dto/update-societe.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Audit } from '../audit/audit.decorator';

@Controller('societes')
@UseGuards(JwtAuthGuard)
export class SocietesController {
  constructor(private readonly societesService: SocietesService) {}
@Audit('CREATE', 'Societe')
  @Post()
  create(@Body() dto: CreateSocieteDto) {
    return this.societesService.create(dto);
  }

  @Get()
  findAll() {
    return this.societesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.societesService.findOne(id);
  }
@Audit('UPDATE', 'Societe')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSocieteDto) {
    return this.societesService.update(id, dto);
  }
@Audit('DELETE', 'Societe')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.societesService.remove(id);
  }
}