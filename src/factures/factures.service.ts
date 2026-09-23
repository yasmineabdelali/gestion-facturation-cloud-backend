import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Facture, StatutFacture } from './entities/facture.entity';
import { TypePeriode } from './entities/type-periode.enum';
import { LigneFacture } from './entities/ligne-facture.entity';
import { OffreFinanciere, StatutOffre } from '../offres/entities/offre-financiere.entity';
import { CreateFactureDto } from './dto/create-facture.dto';
import { UpdateLignesDto } from './dto/update-lignes.dto';
import PDFDocument from 'pdfkit';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';
import { Devise } from '../common/enums/devise.enum';
@Injectable()
export class FacturesService {
  constructor(
    @InjectRepository(Facture)
    private facturesRepository: Repository<Facture>,
    @InjectRepository(LigneFacture)
    private lignesRepository: Repository<LigneFacture>,
    @InjectRepository(OffreFinanciere)
    private offresRepository: Repository<OffreFinanciere>,
  ) {}

async create(dto: CreateFactureDto): Promise<Facture> {
  const existing = await this.facturesRepository.findOne({
    where: {
      projet_id: dto.projet_id,
      type_periode: dto.type_periode,
      annee: dto.annee,
      numero_periode: dto.numero_periode,
    },
  });

  if (existing) {
    throw new ConflictException('Une facture existe déjà pour cette période');
  }

  const periodePrecedente = await this.findPeriodePrecedente(dto.projet_id, dto.type_periode, dto.annee, dto.numero_periode);

  const facture = this.facturesRepository.create({
    projet_id: dto.projet_id,
    type_periode: dto.type_periode,
    annee: dto.annee,
    numero_periode: dto.numero_periode,
    statut: StatutFacture.BROUILLON,
  });
  const factureSauvegardee = await this.facturesRepository.save(facture);

  let lignes: LigneFacture[];
  let devise: Devise;

  if (periodePrecedente && periodePrecedente.lignes.length > 0) {
    devise = periodePrecedente.devise;
    lignes = periodePrecedente.lignes.map((l) =>
      this.lignesRepository.create({
        facture_id: factureSauvegardee.id,
        ressource_offre_id: l.ressource_offre_id,
        ressource_cloud: l.ressource_cloud,
        unite: l.unite,
        prix_unitaire: l.prix_unitaire,
        quantite_consommee: l.quantite_consommee,
        montant_ligne: Number(l.quantite_consommee) * Number(l.prix_unitaire),
      }),
    );
  } else {
    const offreActive = await this.offresRepository.findOne({
      where: { projet_id: dto.projet_id, statut: StatutOffre.ACTIVE },
      relations: { ressources: true },
    });

    if (!offreActive || offreActive.ressources.length === 0) {
      throw new BadRequestException("Aucune offre financière active pour ce projet — impossible de créer la facture");
    }

    devise = offreActive.devise;

    lignes = offreActive.ressources.map((r) =>
      this.lignesRepository.create({
        facture_id: factureSauvegardee.id,
        ressource_offre_id: r.id,
        ressource_cloud: r.ressource_cloud,
        unite: r.unite,
        prix_unitaire: r.prix_unitaire,
        quantite_consommee: Number(r.quantite),
        montant_ligne: Number(r.quantite) * Number(r.prix_unitaire),
      }),
    );
  }

  await this.lignesRepository.save(lignes);
  await this.facturesRepository.update(factureSauvegardee.id, { devise });

  return this.findOne(factureSauvegardee.id);
}

private async findPeriodePrecedente(
  projetId: number,
  typePeriode: TypePeriode,
  annee: number,
  numeroPeriode: number,
): Promise<Facture | null> {
  const factures = await this.facturesRepository.find({
    where: { projet_id: projetId, type_periode: typePeriode },
    relations: { lignes: true },
    order: { annee: 'DESC', numero_periode: 'DESC' },
  });


  const resultat = factures.find((f) =>
    Number(f.annee) < annee || (Number(f.annee) === annee && Number(f.numero_periode) < numeroPeriode)
  ) || null;


  return resultat;
}

  async findByProjet(projetId: number): Promise<Facture[]> {
    return this.facturesRepository.find({
      where: { projet_id: projetId },
      order: { annee: 'DESC', numero_periode: 'DESC' },
    });
  }
  async findAll(): Promise<Facture[]> {
  return this.facturesRepository.find({
    relations: { projet: { societe: true } },
    order: { date_creation: 'DESC' },
  });
}

  async findOne(id: number): Promise<Facture> {
    const facture = await this.facturesRepository.findOne({
      where: { id },
      relations: { lignes: true, projet: true },
    });
    if (!facture) {
      throw new NotFoundException(`Facture avec l'id ${id} introuvable`);
    }
    return facture;
  }

  async updateLignes(id: number, dto: UpdateLignesDto): Promise<Facture> {
    const facture = await this.findOne(id);

    if (facture.statut === StatutFacture.VALIDEE) {
      throw new ForbiddenException('Cette facture est validée et ne peut plus être modifiée');
    }

    for (const ligneDto of dto.lignes) {
      const ligne = facture.lignes.find((l) => l.id === ligneDto.id);
      if (ligne) {
        ligne.quantite_consommee = ligneDto.quantite_consommee;
        ligne.montant_ligne = ligneDto.quantite_consommee * Number(ligne.prix_unitaire);
        await this.lignesRepository.save(ligne);
      }
    }

    const montantTotal = await this.calculerMontantTotal(id);
    await this.facturesRepository.update(id, { montant_total: montantTotal });

    return this.findOne(id);
  }

  async valider(id: number): Promise<Facture> {
    const facture = await this.findOne(id);

    if (facture.statut === StatutFacture.VALIDEE) {
      throw new ConflictException('Cette facture est déjà validée');
    }

    const montantTotal = await this.calculerMontantTotal(id);

    await this.facturesRepository.update(id, {
      statut: StatutFacture.VALIDEE,
      montant_total: montantTotal,
      date_validation: new Date(),
    });

    return this.findOne(id);
  }

  async devaliderAdmin(id: number): Promise<Facture> {
    // Réservé aux admins : permet de rouvrir une facture validée (section 8 : "sauf autorisation administrateur")
    await this.facturesRepository.update(id, {
      statut: StatutFacture.BROUILLON,
      date_validation: null,
    });
    return this.findOne(id);
  }

  private async calculerMontantTotal(factureId: number): Promise<number> {
    const facture = await this.findOne(factureId);
    return facture.lignes.reduce((sum, l) => sum + Number(l.quantite_consommee) * Number(l.prix_unitaire), 0);
  }

  
  async genererPdf(id: number, res: Response): Promise<void> {
  const facture = await this.findOne(id);

  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=facture-${facture.type_periode}-${facture.numero_periode}-${facture.annee}.pdf`);
  doc.pipe(res);

  doc.fontSize(20).text('Facture de facturation Cloud', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12).text(`Projet : ${facture.projet.nom_projet} (${facture.projet.numero_so})`);
  doc.text(`Période : ${facture.type_periode} - ${facture.numero_periode}/${facture.annee}`);
  doc.text(`Statut : ${facture.statut}`);
  if (facture.date_validation) {
    doc.text(`Validée le : ${new Date(facture.date_validation).toLocaleString('fr-FR')}`);
  }
  doc.moveDown();

  const tableTop = doc.y;
  const colWidths = [150, 60, 80, 90, 90];
  const headers = ['Ressource Cloud', 'Unité', 'Prix unitaire', 'Consommation', 'Montant'];

  let x = 50;
  headers.forEach((header, i) => {
    doc.fontSize(10).font('Helvetica-Bold').text(header, x, tableTop, { width: colWidths[i] });
    x += colWidths[i];
  });

  doc.moveTo(50, tableTop + 15).lineTo(520, tableTop + 15).stroke();

  let y = tableTop + 20;
  doc.font('Helvetica');

  for (const ligne of facture.lignes) {
    x = 50;
    const values = [
      ligne.ressource_cloud,
      ligne.unite,
      Number(ligne.prix_unitaire).toFixed(4),
      Number(ligne.quantite_consommee).toFixed(2),
      Number(ligne.montant_ligne).toFixed(2),
    ];
    values.forEach((val, i) => {
      doc.fontSize(9).text(val, x, y, { width: colWidths[i] });
      x += colWidths[i];
    });
    y += 20;
  }

  doc.moveTo(50, y + 5).lineTo(520, y + 5).stroke();
  doc.fontSize(12).font('Helvetica-Bold').text(`Montant total : ${Number(facture.montant_total).toFixed(2)}`, 50, y + 15, { align: 'right', width: 470 });

  doc.end();
}

async genererExcel(id: number): Promise<ExcelJS.Buffer> {
  const facture = await this.findOne(id);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Facture');

  sheet.addRow([`Facture ${facture.type_periode} - Période ${facture.numero_periode}/${facture.annee}`]);
  sheet.addRow([`Projet : ${facture.projet.nom_projet} (${facture.projet.numero_so})`]);
  sheet.addRow([`Statut : ${facture.statut}`]);
  sheet.addRow([]);

  const headerRow = sheet.addRow(['Ressource Cloud', 'Unité', 'Prix unitaire', 'Consommation', 'Montant']);
  headerRow.font = { bold: true };

  for (const ligne of facture.lignes) {
    sheet.addRow([
      ligne.ressource_cloud,
      ligne.unite,
      Number(ligne.prix_unitaire),
      Number(ligne.quantite_consommee),
      Number(ligne.montant_ligne),
    ]);
  }

  sheet.addRow([]);
  const totalRow = sheet.addRow(['', '', '', 'Montant total', Number(facture.montant_total)]);
  totalRow.font = { bold: true };

  sheet.columns.forEach((column) => {
    column.width = 20;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

//methode de rechereche des factures individuelles 
async search(filtres: { client?: string; so?: string; typePeriode?: TypePeriode; annee?: number; numeroPeriode?: number }) {
  const query = this.facturesRepository
    .createQueryBuilder('facture')
    .leftJoinAndSelect('facture.projet', 'projet')
    .leftJoinAndSelect('projet.societe', 'societe');

  if (filtres.client) {
    query.andWhere('societe.nom LIKE :client', { client: `%${filtres.client}%` });
  }

  if (filtres.so) {
    query.andWhere('(projet.numero_so LIKE :so OR projet.nom_projet LIKE :so)', { so: `%${filtres.so}%` });
  }

  if (filtres.typePeriode) {
    query.andWhere('facture.type_periode = :typePeriode', { typePeriode: filtres.typePeriode });
  }

  if (filtres.annee) {
    query.andWhere('facture.annee = :annee', { annee: filtres.annee });
  }

  if (filtres.numeroPeriode) {
    query.andWhere('facture.numero_periode = :numeroPeriode', { numeroPeriode: filtres.numeroPeriode });
  }

  return query.orderBy('facture.annee', 'DESC').addOrderBy('facture.numero_periode', 'DESC').getMany();
}

async comparaisonPrevueReelle(projetId: number, typePeriode?: TypePeriode, annee?: number, numeroPeriode?: number) {
  const offreActive = await this.offresRepository.findOne({
    where: { projet_id: projetId, statut: StatutOffre.ACTIVE },
    relations: { ressources: true },
  });

  if (!offreActive) {
    throw new BadRequestException('Aucune offre financière active pour ce projet');
  }

  let facture: Facture | null;

  if (typePeriode && annee && numeroPeriode) {
    facture = await this.facturesRepository.findOne({
      where: { projet_id: projetId, type_periode: typePeriode, annee, numero_periode: numeroPeriode },
      relations: { lignes: true },
    });
  } else {
    facture = await this.facturesRepository.findOne({
      where: { projet_id: projetId },
      relations: { lignes: true },
      order: { date_creation: 'DESC' },
    });
  }

  const comparaison = offreActive.ressources.map((ressource) => {
    const ligne = facture?.lignes.find((l) => l.ressource_offre_id === ressource.id);
    return {
      ressource_cloud: ressource.ressource_cloud,
      unite: ressource.unite,
      quantite_prevue: Number(ressource.quantite),
      quantite_reelle: ligne ? Number(ligne.quantite_consommee) : 0,
    };
  });

  return {
    facture: facture
      ? { id: facture.id, type_periode: facture.type_periode, annee: facture.annee, numero_periode: facture.numero_periode }
      : null,
    comparaison,
  };
}



}