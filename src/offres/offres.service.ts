import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { OffreFinanciere, StatutOffre } from './entities/offre-financiere.entity';
import { RessourceOffre } from './entities/ressource-offre.entity';
import { Projet } from '../projets/entities/projet.entity';
import { Devise } from '../common/enums/devise.enum';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PDFParse } = require('pdf-parse');

@Injectable()
export class OffresService {
  constructor(
    @InjectRepository(OffreFinanciere)
    private offresRepository: Repository<OffreFinanciere>,
    @InjectRepository(RessourceOffre)
    private ressourcesRepository: Repository<RessourceOffre>,
    @InjectRepository(Projet)
    private projetsRepository: Repository<Projet>,
  ) {}

  private async getDeviseDuProjet(projetId: number): Promise<Devise> {
    const projet = await this.projetsRepository.findOne({
      where: { id: projetId },
      relations: { societe: true },
    });
    if (!projet) {
      throw new NotFoundException(`Projet avec l'id ${projetId} introuvable`);
    }
    return projet.societe?.devise ?? Devise.TND;
  }

  async importExcel(projetId: number, file: Express.Multer.File): Promise<OffreFinanciere> {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    const ressourcesExtraites = this.parseExcelFile(file.buffer);

    if (ressourcesExtraites.length === 0) {
      throw new BadRequestException('Le fichier ne contient aucune donnée exploitable');
    }

    const devise = await this.getDeviseDuProjet(projetId);

    const ancienneOffre = await this.offresRepository.findOne({
      where: { projet_id: projetId, statut: StatutOffre.ACTIVE },
      order: { version: 'DESC' },
    });

    const nouvelleVersion = ancienneOffre ? ancienneOffre.version + 1 : 1;

    if (ancienneOffre) {
      ancienneOffre.statut = StatutOffre.ARCHIVEE;
      await this.offresRepository.save(ancienneOffre);
    }

    const offre = this.offresRepository.create({
      projet_id: projetId,
      version: nouvelleVersion,
      nom_fichier_original: file.originalname,
      statut: StatutOffre.ACTIVE,
      devise,
    });
    const offreSauvegardee = await this.offresRepository.save(offre);

    const ressources = ressourcesExtraites.map((r) =>
      this.ressourcesRepository.create({
        ...r,
        offre_id: offreSauvegardee.id,
      }),
    );
    await this.ressourcesRepository.save(ressources);

    return this.findOne(offreSauvegardee.id);
  }

  private parseExcelFile(buffer: Buffer): Partial<RessourceOffre>[] {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);

    return rows
      .map((row) => this.mapRowToRessource(row))
      .filter((r): r is Partial<RessourceOffre> => r !== null);
  }

  private mapRowToRessource(row: any): Partial<RessourceOffre> | null {
    const ressourceCloud = this.findValue(row, ['Ressource Cloud', 'Ressource', 'ressource_cloud']);
    const typeService = this.findValue(row, ['Type de service', 'Type Service', 'type_service']);
    const quantite = this.findValue(row, ['Quantité', 'Quantite', 'quantite']);
    const unite = this.findValue(row, ['Unité', 'Unite', 'unite']);
    const prixUnitaire = this.findValue(row, ['Prix unitaire', 'Prix Unitaire', 'prix_unitaire']);
    const description = this.findValue(row, ['Description', 'description']);

    if (!ressourceCloud || quantite === undefined || !unite || prixUnitaire === undefined) {
      return null;
    }

    return {
      ressource_cloud: String(ressourceCloud),
      type_service: typeService ? String(typeService) : undefined,
      quantite: Number(quantite),
      unite: String(unite),
      prix_unitaire: Number(prixUnitaire),
      description: description ? String(description) : undefined,
    };
  }

  private findValue(row: any, possibleKeys: string[]): any {
    for (const key of possibleKeys) {
      if (row[key] !== undefined) {
        return row[key];
      }
    }
    return undefined;
  }

  async findOne(id: number): Promise<OffreFinanciere> {
    const offre = await this.offresRepository.findOne({
      where: { id },
      relations: { ressources: true },
    });
    if (!offre) {
      throw new NotFoundException(`Offre financière avec l'id ${id} introuvable`);
    }
    return offre;
  }

  async findActiveByProjet(projetId: number): Promise<OffreFinanciere | null> {
    return this.offresRepository.findOne({
      where: { projet_id: projetId, statut: StatutOffre.ACTIVE },
      relations: { ressources: true },
    });
  }

  async findHistoriqueByProjet(projetId: number): Promise<OffreFinanciere[]> {
    return this.offresRepository.find({
      where: { projet_id: projetId },
      order: { version: 'DESC' },
    });
  }

  async importPdf(projetId: number, file: Express.Multer.File): Promise<OffreFinanciere> {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    const ressourcesExtraites = await this.parsePdfFile(file.buffer);

    if (ressourcesExtraites.length === 0) {
      throw new BadRequestException('Aucune ressource exploitable trouvée dans le PDF');
    }

    const devise = await this.getDeviseDuProjet(projetId);

    const ancienneOffre = await this.offresRepository.findOne({
      where: { projet_id: projetId, statut: StatutOffre.ACTIVE },
      order: { version: 'DESC' },
    });

    const nouvelleVersion = ancienneOffre ? ancienneOffre.version + 1 : 1;

    if (ancienneOffre) {
      ancienneOffre.statut = StatutOffre.ARCHIVEE;
      await this.offresRepository.save(ancienneOffre);
    }

    const offre = this.offresRepository.create({
      projet_id: projetId,
      version: nouvelleVersion,
      nom_fichier_original: file.originalname,
      statut: StatutOffre.ACTIVE,
      devise,
    });
    const offreSauvegardee = await this.offresRepository.save(offre);

    const ressources = ressourcesExtraites.map((r) =>
      this.ressourcesRepository.create({
        ...r,
        offre_id: offreSauvegardee.id,
      }),
    );
    await this.ressourcesRepository.save(ressources);

    return this.findOne(offreSauvegardee.id);
  }

  private async parsePdfFile(buffer: Buffer): Promise<Partial<RessourceOffre>[]> {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const texte = result.text;

    const lignes = texte.split('\n').filter((l) => l.trim().length > 0);
    const ressources: Partial<RessourceOffre>[] = [];

    for (const ligne of lignes) {
      const ressource = this.parseLignePdf(ligne);
      if (ressource) {
        ressources.push(ressource);
      }
    }

    return ressources;
  }

  private parseLignePdf(ligne: string): Partial<RessourceOffre> | null {
    const regexRessource = /Ressource Cloud:\s*([^|]+)/i;
    const regexType = /Type:\s*([^|]+)/i;
    const regexQuantite = /Quantit[ée]:\s*([\d.,]+)/i;
    const regexUnite = /Unit[ée]:\s*([^|]+)/i;
    const regexPrix = /Prix unitaire:\s*([\d.,]+)/i;
    const regexDescription = /Description:\s*(.+)/i;

    const matchRessource = ligne.match(regexRessource);
    const matchQuantite = ligne.match(regexQuantite);
    const matchUnite = ligne.match(regexUnite);
    const matchPrix = ligne.match(regexPrix);

    if (!matchRessource || !matchQuantite || !matchUnite || !matchPrix) {
      return null;
    }

    const matchType = ligne.match(regexType);
    const matchDescription = ligne.match(regexDescription);

    return {
      ressource_cloud: matchRessource[1].trim(),
      type_service: matchType ? matchType[1].trim() : undefined,
      quantite: parseFloat(matchQuantite[1].replace(',', '.')),
      unite: matchUnite[1].trim(),
      prix_unitaire: parseFloat(matchPrix[1].replace(',', '.')),
      description: matchDescription ? matchDescription[1].trim() : undefined,
    };
  }
}