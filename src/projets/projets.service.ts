import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Projet } from './entities/projet.entity';
import { CreateProjetDto } from './dto/create-projet.dto';
import { UpdateProjetDto } from './dto/update-projet.dto';

@Injectable()
export class ProjetsService {
  constructor(
    @InjectRepository(Projet)
    private projetsRepository: Repository<Projet>,
  ) {}

  async create(dto: CreateProjetDto): Promise<Projet> {
    const existing = await this.projetsRepository.findOne({ where: { numero_so: dto.numero_so } });
    if (existing) {
      throw new ConflictException('Un projet avec ce numéro SO existe déjà');
    }

    const projet = this.projetsRepository.create(dto);
    return this.projetsRepository.save(projet);
  }

  async findAll(): Promise<Projet[]> {
    return this.projetsRepository.find({
      relations: { societe: true },
      order: { date_creation: 'DESC' },
    });
  }

  async findBySociete(societeId: number): Promise<Projet[]> {
    return this.projetsRepository.find({
      where: { societe_id: societeId },
      relations: { societe: true },
      order: { date_creation: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Projet> {
    const projet = await this.projetsRepository.findOne({
      where: { id },
      relations: { societe: true },
    });
    if (!projet) {
      throw new NotFoundException(`Projet avec l'id ${id} introuvable`);
    }
    return projet;
  }

  async update(id: number, dto: UpdateProjetDto): Promise<Projet> {
    const projet = await this.findOne(id);

    if (dto.numero_so && dto.numero_so !== projet.numero_so) {
      const existing = await this.projetsRepository.findOne({ where: { numero_so: dto.numero_so } });
      if (existing) {
        throw new ConflictException('Un projet avec ce numéro SO existe déjà');
      }
    }

    await this.projetsRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const projet = await this.findOne(id);
    await this.projetsRepository.remove(projet);
  }
}