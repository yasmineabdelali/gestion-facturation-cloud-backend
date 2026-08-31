import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Societe } from './entities/societe.entity';
import { CreateSocieteDto } from './dto/create-societe.dto';
import { UpdateSocieteDto } from './dto/update-societe.dto';

@Injectable()
export class SocietesService {
  constructor(
    @InjectRepository(Societe)
    private societesRepository: Repository<Societe>,
  ) {}

  async create(dto: CreateSocieteDto): Promise<Societe> {
        const existingNom = await this.societesRepository.findOne({ where: { nom: dto.nom } });
       if (existingNom) {
      throw new ConflictException('Une société avec ce nom existe déjà');
    }
    const existing = await this.societesRepository.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Une société avec cet email existe déjà');
    }

    const societe = this.societesRepository.create(dto);
    return this.societesRepository.save(societe);
  }

  async findAll(): Promise<Societe[]> {
    return this.societesRepository.find({
      order: { date_creation: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Societe> {
    const societe = await this.societesRepository.findOne({ where: { id } });
    if (!societe) {
      throw new NotFoundException(`Société avec l'id ${id} introuvable`);
    }
    return societe;
  }

  async update(id: number, dto: UpdateSocieteDto): Promise<Societe> {
    const societe = await this.findOne(id);
        if (dto.nom && dto.nom !== societe.nom) {
      const existingNom = await this.societesRepository.findOne({ where: { nom: dto.nom } });
      if (existingNom) {
        throw new ConflictException('Une société avec ce nom existe déjà');
      }
    }

    if (dto.email && dto.email !== societe.email) {
      const existing = await this.societesRepository.findOne({ where: { email: dto.email } });
      if (existing) {
        throw new ConflictException('Une société avec cet email existe déjà');
      }
    }

    await this.societesRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const societe = await this.findOne(id);
    await this.societesRepository.remove(societe);
  }
}