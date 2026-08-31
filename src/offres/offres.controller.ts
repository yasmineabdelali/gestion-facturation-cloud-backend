import {
  Controller,
  Post,
  Get,
  Param,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OffresService } from './offres.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('offres')
@UseGuards(JwtAuthGuard)
export class OffresController {
  constructor(private readonly offresService: OffresService) {}

  @Post('import/:projetId')
  @UseInterceptors(FileInterceptor('file'))
  importOffre(@Param('projetId', ParseIntPipe) projetId: number, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Aucun fichier reçu');
    }

    const extension = file.originalname.split('.').pop()?.toLowerCase();
    //import excel
    if (extension === 'xlsx' || extension === 'xls') {
      return this.offresService.importExcel(projetId, file);
    }
    //import pdf
      if (extension === 'pdf') {
    return this.offresService.importPdf(projetId, file);
  }

    throw new BadRequestException('Format de fichier non supporté pour le moment (Excel uniquement)');
  }

  @Get('projet/:projetId/active')
  findActive(@Param('projetId', ParseIntPipe) projetId: number) {
    return this.offresService.findActiveByProjet(projetId);
  }

  @Get('projet/:projetId/historique')
  findHistorique(@Param('projetId', ParseIntPipe) projetId: number) {
    return this.offresService.findHistoriqueByProjet(projetId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.offresService.findOne(id);
  }
}