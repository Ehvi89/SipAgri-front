import { Planter } from '../models/planter-model';
import { Plantation } from '../models/plantation-model';
import { Production } from '../models/production-model';
import { Gender } from '../enums/gender-enum';
import { MaritalStatus } from '../enums/marital-status-enum';
import {Injectable} from '@angular/core';
import {tap} from 'rxjs/operators';
import {PlantationService} from '../../features/plantation/services/plantation-service';
import {PlanterService} from '../../features/planter/services/planter-service';
import {ProductionService} from '../../features/production/services/production-service';
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


/**
 * Represents an export planter that extends the base planter functionality,
 * specifically designed to manage plantations intended for export.
 *
 * This interface provides an optional list of export plantations, allowing
 * implementations to handle export-specific plantation details while maintaining
 * compatibility with the core planter structure.
 *
 * The `plantations` property may contain multiple `ExportPlantation` objects,
 * each describing the details of an individual plantation for export purposes.
 */
export interface ExportPlanter extends Planter {
  plantations?: ExportPlantation[];
}

/**
 * Represents a plantation object with additional export-specific details,
 * extending the base `Plantation` interface.
 *
 * This interface includes optional information about the planter associated
 * with the plantation, as well as details of the related productions.
 *
 * @interface ExportPlantation
 * @extends Plantation
 *
 * @property {Object} [planter] - Optional information about the planter.
 * @property {number} planter.id - Unique identifier for the planter.
 * @property {string} planter.firstname - First name of the planter.
 * @property {string} planter.lastname - Last name of the planter.
 * @property {number} planter.phoneNumber - Contact phone number of the planter.
 * @property {string} planter.village - Village or location of the planter.
 *
 * @property {ExportProduction[]} productions - A list of export-related production details.
 */
export interface ExportPlantation extends Plantation {
  planter?: {
    id: number;
    firstname: string;
    lastname: string;
    phoneNumber: number;
    village: string;
  };
  productions: ExportProduction[];
}

/**
 * The ExportProduction interface extends the Production interface and represents the export details
 * of production data. It includes optional information about the plantation associated with the
 * production.
 *
 * Properties:
 * - plantation: An optional object that provides details about the plantation related to the
 *   production. The object includes:
 *   - id: A unique identifier for the plantation.
 *   - name: The name of the plantation.
 *   - farmedArea: The total area farmed in the plantation.
 *   - planterName: The name of the planter associated with the plantation.
 */
export interface ExportProduction extends Production {
  plantation?: {
    id: number;
    name: string;
    farmedArea: number;
    planterName: string;
  };
}

/**
 * Represents the filtering criteria for planters.
 *
 * This interface defines a set of optional properties that can be used to filter planter data based on demographics, supervisory relationships, and personal attributes.
 *
 * Properties:
 * - gender: Specifies the gender of the planter if filtering by gender is required. The value must be of the type `Gender`.
 * - maritalStatus: Specifies the marital status of the planter if filtering by marital status is required. The value must be of the type `MaritalStatus`.
 * - village: Specifies the village of the planter if filtering by geographic location is required. The value must be a string.
 * - minChildrenNumber: Specifies the minimum number of children the planter must have to be included in the filter. The value must be a number.
 * - maxChildrenNumber: Specifies the maximum number of children the planter may have to be included in the filter. The value must be a number.
 * - supervisorId: Specifies the ID of the supervisor associated with the planter, if filtering by supervisor is required. The value must be a number.
 * - minAge: Specifies the minimum age of the planter to be included in the filter. The value must be a number.
 * - maxAge: Specifies the maximum age of the planter to be included in the filter. The value must be a number.
 *
 * All properties are optional; any combination can be used for filtering.
 */
export interface PlanterFilters {
  gender?: Gender;
  maritalStatus?: MaritalStatus;
  village?: string;
  minChildrenNumber?: number;
  maxChildrenNumber?: number;
  supervisorId?: number;
  minAge?: number;
  maxAge?: number;
}

/**
 * Interface representing the filters for querying plantation data.
 *
 * This interface is intended to be used to specify optional filtering criteria
 * when working with plantation-related data.
 *
 * Properties:
 * - minFarmedArea: An optional number specifying the minimum farmed area.
 * - maxFarmedArea: An optional number specifying the maximum farmed area.
 * - village: An optional string specifying the village name for filtering.
 * - planterId: An optional number representing the ID of the planter for filtering.
 * - kitId: An optional number representing the ID of the kit for filtering.
 */
export interface PlantationFilters {
  minFarmedArea?: number;
  maxFarmedArea?: number;
  village?: string;
  planterId?: number;
  kitId?: number;
}

/**
 * Represents a set of filters that can be applied to query production data.
 *
 * Properties:
 * - `year` (optional): Filter results by the specified year.
 * - `minProductionInKg` (optional): Minimum production yield in kilograms.
 * - `maxProductionInKg` (optional): Maximum production yield in kilograms.
 * - `minPurchasePrice` (optional): Minimum purchase price for the production.
 * - `maxPurchasePrice` (optional): Maximum purchase price for the production.
 * - `mustBePaid` (optional): Indicates if production entries should only include paid items.
 * - `plantationId` (optional): Filter results to a specific plantation identified by its ID.
 */
export interface ProductionFilters {
  year?: number;
  minProductionInKg?: number;
  maxProductionInKg?: number;
  minPurchasePrice?: number;
  maxPurchasePrice?: number;
  mustBePaid?: boolean;
  plantationId?: number;
}

/**
 * Represents the allowed export formats for data output.
 *
 * This type defines a union of string literals, each corresponding to a supported file format.
 * It can be used to specify or restrict the export options provided within a system.
 *
 * The available formats are:
 * - 'csv': Comma-Separated Values file format, suitable for tabular data.
 * - 'json': JavaScript Object Notation format, commonly used for structured data interchange.
 * - 'pdf': Portable Document Format, ideal for fixed-layout documents.
 * - 'excel': Microsoft Excel file format, suitable for spreadsheet data.
 */
export type ExportFormat = 'csv' | 'json' | 'pdf' | 'excel';

@Injectable({providedIn: 'root'})
export class DataExportService {
  private planters: Planter[] = [];
  private plantations: Plantation[] = [];
  private productions: Production[] = [];

  constructor(private readonly plantationService: PlantationService,
              private readonly planterService: PlanterService,
              private readonly productionService: ProductionService,) {
  }

  initializeData() {
    this.planterService.getAll().pipe(
      tap(data => this.planters = data)
    ).subscribe()

    this.plantationService.getAll().pipe(
      tap(data => this.plantations = data)
    ).subscribe();

    this.productionService.getAll().pipe(
      tap(data => this.productions = data)
    ).subscribe()
  }


  /**
   * Exports a list of planters with their associated plantations and productions, optionally filtered.
   *
   * @param {PlanterFilters} [filters] - Optional filters to apply to the planters before exporting.
   * @return {ExportPlanter[]} A list of planters with their enriched plantations and production data.
   */
  exportPlanters(filters?: PlanterFilters): ExportPlanter[] {
    let filteredPlanters = this.planters;

    if (filters) {
      filteredPlanters = this.applyPlanterFilters(this.planters, filters);
    }

    return this.preparePlanterExport(filteredPlanters.map(planter => {
      const planterPlantations = this.plantations.filter(
        p => p.planterId === planter.id
      );

      const enrichedPlantations = planterPlantations.map(plantation =>
        this.enrichPlantation(plantation, this.productions, planter)
      );

      return {
        ...planter,
        plantations: enrichedPlantations
      };
    }));
  }

  /**
   * Exports a list of plantations with their associated planters and production details,
   * applying optional filters if provided.
   *
   * @param {PlantationFilters} [filters] - Optional filters to apply to the plantations before exporting.
   * @return {ExportPlantation[]} The exported plantations, enriched with planter and production details.
   */
  exportPlantations(filters?: PlantationFilters): ExportPlantation[] {
    let filteredPlantations = this.plantations;

    if (filters) {
      filteredPlantations = this.applyPlantationFilters(this.plantations, this.planters, filters);
    }

    return this.preparePlantationExport(filteredPlantations.map(plantation => {
      const planter = this.planters.find(p => p.id === plantation.planterId);

      const plantationProductions = this.productions.filter(
        prod => prod.plantationId === plantation.id
      );

      const enrichedProductions = plantationProductions.map(prod => ({
        ...prod,
        plantation: {
          id: plantation.id!,
          name: plantation.name,
          farmedArea: plantation.farmedArea,
          planterName: planter ? `${planter.firstname} ${planter.lastname}` : 'Inconnu'
        }
      }));

      return {
        ...plantation,
        planter: planter ? {
          id: planter.id!,
          firstname: planter.firstname,
          lastname: planter.lastname,
          phoneNumber: planter.phoneNumber,
          village: planter.village
        } : undefined,
        productions: enrichedProductions
      };
    }));
  }

  /**
   * Exports a list of production data with additional details, including associated plantations and planters.
   *
   * @param {ProductionFilters} [filters] - Optional filters to apply to the production data before exporting.
   * @return {ExportProduction[]} The array of exported production objects, each enhanced with plantation and planter details where applicable.
   */
  exportProductions(filters?: ProductionFilters): ExportProduction[] {
    let filteredProductions = this.productions;

    if (filters) {
      filteredProductions = this.applyProductionFilters(this.productions, filters);
    }

    return this.prepareProductionExport(filteredProductions.map(production => {
      const plantation = this.plantations.find(p => p.id === production.plantationId);
      const planter = plantation
        ? this.planters.find(p => p.id === plantation.planterId)
        : undefined;

      return {
        ...production,
        plantation: plantation && planter ? {
          id: plantation.id!,
          name: plantation.name,
          farmedArea: plantation.farmedArea,
          planterName: `${planter.firstname} ${planter.lastname}`
        } : undefined
      };
    }));
  }

  /**
   * Exports the given data array to a CSV file and initiates its download with the specified filename.
   *
   * @param {any[]} data - The array of data objects to be exported into a CSV format.
   * @param {string} filename - The desired name for the downloaded CSV file, including the file extension.
   * @return {void} This method does not return a value.
   */
  exportToCSV(data: any[], filename: string): void {
    const flattenedData = this.flattenData(data);
    const csv = this.convertToCSV(flattenedData);
    this.downloadCSV(csv, filename);
  }

  /**
   * Exports the provided data array as a JSON file and triggers a download.
   *
   * @param {any[]} data - The array of data to be converted to JSON format.
   * @param {string} filename - The name of the file to be downloaded, including the file extension.
   * @return {void} This method does not return a value.
   */
  exportToJSON(data: any[], filename: string): void {
    const json = JSON.stringify(data, null, 2);
    this.downloadJSON(json, filename);
  }

  /**
   * Exports the provided data to a PDF file with the specified filename and title.
   *
   * @param {any[]} data - The array of data to be included in the PDF document.
   * @param {string} filename - The name of the PDF file to be saved.
   * @param {string} title - The title to be displayed in the PDF document.
   * @return {void} This function does not return a value.
   */
  exportToPDF(data: any[], filename: string, title: string): void {
    if (!data || data.length === 0) {
      console.warn('Aucune donnée à exporter en PDF');
      return;
    }

    try {
      // Aplatir les données
      const flattenedData = this.flattenData(data);

      // Créer un document PDF
      const doc = new jsPDF({
        orientation: 'landscape', // utile pour les tableaux larges
        unit: 'pt',
        format: 'A4',
      });

      // Ajouter un titre
      doc.setFontSize(16);
      doc.text(title, 40, 40);

      // Ajouter des métadonnées
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Date d'export : ${new Date().toLocaleString('fr-FR')}`, 40, 60);
      doc.text(`Nombre d'enregistrements : ${flattenedData.length}`, 40, 75);

      // Générer les en-têtes et les lignes
      const headers = Object.keys(flattenedData[0]);
      const rows = flattenedData.map(obj => headers.map(h => String(obj[h] ?? '')));

      // Générer la table avec autoTable
      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 100,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [22, 160, 133] },
        alternateRowStyles: { fillColor: [240, 240, 240] },
      });

      // Sauvegarder le PDF
      doc.save(`${filename}.pdf`);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF :', error);
    }
  }


  /**
   * Exports the provided data to an Excel file and allows the user to download it.
   *
   * @param {any[]} data - An array of objects representing the data to be exported to Excel. Each object corresponds to a row in the Excel file.
   * @param {string} filename - The name of the file to be generated, including the extension (e.g., "data.xlsx").
   * @return {void} Does not return a value.
   */
  exportToExcel(data: any[], filename: string): void {
    // Vérification des données
    if (!data || data.length === 0) {
      console.warn('Aucune donnée à exporter');
      return;
    }

    try {
      // Aplatir les données pour Excel
      const flattenedData = this.flattenData(data);

      // Créer la feuille de calcul
      const worksheet = XLSX.utils.json_to_sheet(flattenedData);

      // Créer le classeur
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Données');

      // Télécharger le fichier
      this.downloadExcel(workbook, filename);
    } catch (error) {
      console.error('Erreur lors de l\'exportation Excel:', error);
    }
  }

  /**
   * Filters a list of planters based on the specified filters.
   *
   * @param {Planter[]} planters - The array of planters to be filtered.
   * @param {PlanterFilters} filters - The filter criteria to apply.
   * @return {Planter[]} - The filtered array of planters.
   */
  private applyPlanterFilters(planters: Planter[], filters: PlanterFilters): Planter[] {
      return planters.filter(planter => {
          return this.matchesDemographicFilters(planter, filters) &&
              this.matchesChildrenNumberRange(planter, filters) &&
              this.matchesAgeRange(planter, filters);
      });
  }

    /**
     * Determines if a planter matches the provided demographic filters.
     *
     * @param {Planter} planter - The planter object to evaluate.
     * @param {PlanterFilters} filters - The set of demographic filters to check against.
     * @return {boolean} True if the planter matches all the specified demographic filters, otherwise false.
     */
    private matchesDemographicFilters(planter: Planter, filters: PlanterFilters): boolean {
        if (filters.gender && planter.gender !== filters.gender) return false;
        if (filters.maritalStatus && planter.maritalStatus !== filters.maritalStatus) return false;
        if (filters.village && planter.village !== filters.village) return false;
        return !(filters.supervisorId && planter.supervisor.id !== filters.supervisorId);

    }

    /**
     * Determines if a given planter's number of children falls within the specified range defined in the filters.
     *
     * @param {Planter} planter - The planter whose children number is to be checked.
     * @param {PlanterFilters} filters - The filters containing the minimum and/or maximum range for the number of children.
     * @return {boolean} Returns true if the planter's children number is within the range, otherwise false.
     */
    private matchesChildrenNumberRange(planter: Planter, filters: PlanterFilters): boolean {
        if (filters.minChildrenNumber !== undefined && planter.childrenNumber < filters.minChildrenNumber) return false;
        return !(filters.maxChildrenNumber !== undefined && planter.childrenNumber > filters.maxChildrenNumber);

    }

    /**
     * Checks if a planter's age falls within the specified age range defined in the filters.
     *
     * @param {Planter} planter - The planter object containing the birthday information.
     * @param {PlanterFilters} filters - The filter object containing minimum and maximum age values.
     * @return {boolean} Returns true if the planter's age matches the specified age range, otherwise false.
     */
    private matchesAgeRange(planter: Planter, filters: PlanterFilters): boolean {
        if (filters.minAge === undefined && filters.maxAge === undefined) return true;

        const age = this.calculateAge(planter.birthday);
        if (filters.minAge !== undefined && age < filters.minAge) return false;
        return !(filters.maxAge !== undefined && age > filters.maxAge);

    }

  /**
   * Filters the list of plantations based on the specified filters.
   *
   * @param {Plantation[]} plantations - The array of plantation objects to filter.
   * @param {Planter[]} planters - The array of planter objects associated with the plantations.
   * @param {PlantationFilters} filters - The set of filters to apply to the plantations.
   * @return {Plantation[]} The filtered array of plantations that meet the specified criteria.
   */
  private applyPlantationFilters(
    plantations: Plantation[],
    planters: Planter[],
    filters: PlantationFilters
  ): Plantation[] {
    return plantations.filter(plantation => {
      if (filters.minFarmedArea !== undefined && plantation.farmedArea < filters.minFarmedArea) return false;
      if (filters.maxFarmedArea !== undefined && plantation.farmedArea > filters.maxFarmedArea) return false;
      if (filters.planterId && plantation.planterId !== filters.planterId) return false;
      if (filters.kitId && plantation.kit.id !== filters.kitId) return false;

      if (filters.village) {
        const planter = planters.find(p => p.id === plantation.planterId);
        if (!planter || planter.village !== filters.village) return false;
      }

      return true;
    });
  }

  /**
   * Applies the specified filters to a list of productions and returns the filtered results.
   *
   * @param {Production[]} productions - The list of productions to filter.
   * @param {ProductionFilters} filters - The filtering criteria to apply. Filters may include year, production range, purchase price range,
   *                                       payment status, and specific plantation ID.
   * @return {Production[]} The filtered list of productions that match all the specified criteria.
   */
  private applyProductionFilters(productions: Production[], filters: ProductionFilters): Production[] {
    return productions.filter(production => {
      if (filters.year) {
        const prodYear = new Date(production.year).getFullYear();
        if (prodYear !== filters.year) return false;
      }

      if (filters.minProductionInKg !== undefined && production.productionInKg < filters.minProductionInKg) return false;
      if (filters.maxProductionInKg !== undefined && production.productionInKg > filters.maxProductionInKg) return false;
      if (filters.minPurchasePrice !== undefined && production.purchasePrice < filters.minPurchasePrice) return false;
      if (filters.maxPurchasePrice !== undefined && production.purchasePrice > filters.maxPurchasePrice) return false;
      if (filters.mustBePaid !== undefined && production.mustBePaid !== filters.mustBePaid) return false;
      return !(filters.plantationId && production.plantationId !== filters.plantationId);


    });
  }

  // Méthodes privées

  /**
   * Calculates the age based on the provided birthdate.
   *
   * @param {Date} birthday - The birthdate of the person.
   * @return {number} The calculated age as a number.
   */
  private calculateAge(birthday: Date): number {
    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * Enriches a given plantation with its associated productions and planter details.
   *
   * @param {Plantation} plantation - The plantation to enrich.
   * @param {Production[]} productions - The list of productions to filter and associate with the plantation.
   * @param {Planter} planter - The planter whose details are included in the enrichment process.
   * @return {ExportPlantation} The enriched plantation object containing associated productions and planter details.
   */
  private enrichPlantation(
    plantation: Plantation,
    productions: Production[],
    planter: Planter
  ): ExportPlantation {
    const plantationProductions = productions.filter(
      prod => prod.plantationId === plantation.id
    );

    const enrichedProductions = plantationProductions.map(prod => ({
      ...prod,
      plantation: {
        id: plantation.id!,
        name: plantation.name,
        farmedArea: plantation.farmedArea,
        planterName: `${planter.firstname} ${planter.lastname}`
      }
    }));

    return {
      ...plantation,
      productions: enrichedProductions
    };
  }

  /**
   * Flattens an array of nested objects into an array of flattened objects.
   *
   * @param {any[]} data - The array of objects to be flattened.
   * @return {any[]} - A new array containing the flattened objects.
   */
  private flattenData(data: any[]): any[] {
    return data.map(item => this.flattenObject(item));
  }

  /**
   * Recursively flattens a nested object into a single-level object with keys representing the path to each value.
   *
   * @param {any} obj - The object to be flattened. It can contain nested objects, arrays, and other data types.
   * @param {string} [prefix=""] - Optional prefix used to build the keys of the flattened object representing the path.
   * @return {any} A new object with flattened keys and corresponding values based on the input object.
   */
  private flattenObject(obj: any, prefix: string = ''): any {
    const flattened: any = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (value === null || value === undefined) {
          flattened[newKey] = '';
        } else if (value instanceof Date) {
          flattened[newKey] = value.toISOString();
        } else if (Array.isArray(value)) {
          flattened[newKey] = JSON.stringify(value);
        } else if (typeof value === 'object') {
          Object.assign(flattened, this.flattenObject(value, newKey));
        } else {
          flattened[newKey] = value;
        }
      }
    }

    return flattened;
  }

  /**
   * Prépare les données des planteurs pour un export lisible (PDF, Excel, CSV).
   * - Fusionne le prénom et le nom du superviseur
   * - Résume les plantations sous forme de texte
   * - Supprime les champs inutiles
   */
  private preparePlanterExport(planters: ExportPlanter[]): any[] {
    return planters.map(planter => ({
      id: planter.id,
      nom: `${planter.firstname} ${planter.lastname}`,
      genre: this.getGender(planter.gender),
      statutMatrimonial: this.getMaritalStatus(planter.maritalStatus),
      village: planter.village,
      telephone: planter.phoneNumber,
      superviseur: planter.supervisor
        ? `${planter.supervisor.firstname} ${planter.supervisor.lastname}`
        : 'Aucun',
      nombreEnfants: planter.childrenNumber ?? 0,
      age: this.calculateAge(planter.birthday),
      plantations: planter.plantations && planter.plantations.length > 0
        ? planter.plantations.map(p => `${p.name} (${p.farmedArea} ha)`).join(', ')
        : 'Aucune',
    }));
  }

  /**
   * Prépare les données de production pour export (PDF, Excel, CSV)
   * Colonnes : Production en KG, Prix d'achat, À payer, Date, Id plantation, Nom plantation, Superficie, Nom planteur
   */
  private prepareProductionExport(productions: ExportProduction[]): any[] {
    return productions.map(prod => ({
      'Production (kg)': prod.productionInKg,
      "Prix d'achat": prod.purchasePrice,
      'A payer': prod.mustBePaid ? 'Oui' : 'Non',
      'Date de production': prod.year
        ? new Date(prod.year).toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
        : '',
      'Nom plantation': prod.plantation?.name ?? '',
      'Superficie (ha)': prod.plantation?.farmedArea ?? '',
      'Nom planteur': prod.plantation?.planterName ?? '',
    }));
  }

  /**
   * Prépare les données de plantation pour export (PDF, Excel, CSV)
   * Colonnes : Nom, Description, Latitude, Longitude, Superficie, Production totale, Nom planteur, Nom kit, Prix kit
   */
  private preparePlantationExport(plantations: ExportPlantation[]): any[] {
    return plantations.map(p => {
      // Calcul de la production totale
      const totalProduction = p.productions?.reduce(
        (sum, prod) => sum + (prod.productionInKg || 0),
        0
      ) ?? 0;

      return {
        'Nom': p.name,
        'Description': p.description ?? '',
        'Latitude': p.gpsLocation.latitude ?? '',
        'Longitude': p.gpsLocation.longitude ?? '',
        'Superficie (ha)': p.farmedArea ?? '',
        'Production totale (kg)': totalProduction,
        'Nom planteur': p.planter
          ? `${p.planter.firstname} ${p.planter.lastname}`
          : 'Inconnu',
        'Nom kit': p.kit?.name ?? '',
        'Prix du kit': p.kit?.totalCost ?? '',
      };
    });
  }

  /**
   * Converts an array of objects into a CSV-formatted string.
   * Each object in the array represents a row, and the keys of the first object are used as the header row.
   * Quotation marks in values are escaped appropriately.
   *
   * @param {Array<Object>} data - The array of objects to be converted into CSV format. Each object should have consistent keys.
   * @return {string} A CSV-formatted string representing the input data. Returns an empty string if the input array is empty.
   */
  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          const escaped = ('' + value).replaceAll('"', '""');
          return `"${escaped}"`;
        }).join(',')
      )
    ];

    return csvRows.join('\n');
  }

  /**
   * Triggers the download of a CSV file with the specified content and filename.
   *
   * @param {string} csv - The content of the CSV file to be downloaded.
   * @param {string} filename - The desired name for the downloaded file, excluding the extension.
   * @return {void} - Does not return a value.
   */
  private downloadCSV(csv: string, filename: string): void {
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  /**
   * Downloads the given JSON content as a file with the specified filename.
   *
   * @param {string} json - The JSON content to be downloaded.
   * @param {string} filename - The name of the file (without extension) to save the JSON data as.
   * @return {void} This method does not return a value.
   */
  private downloadJSON(json: string, filename: string): void {
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  /**
   * Downloads an Excel file generated from the provided workbook and saves it with the specified filename.
   *
   * @param {any} workbook - The Excel workbook object to be converted into a downloadable file.
   * @param {string} filename - The name to be used for the downloaded Excel file (without extension).
   * @return {void} No return value.
   */
  private downloadExcel(workbook: any, filename: string): void {
    try {
      // Générer le fichier Excel
      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
        cellStyles: true
      });

      // Créer le blob et déclencher le téléchargement
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.xlsx`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      link.remove();

      // Nettoyer l'URL
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Erreur lors du téléchargement du fichier Excel:', error);
    }
  }

  private getMaritalStatus(status: MaritalStatus){
    const maritalStatusOptions = [
      { value: MaritalStatus.SINGLE, label: 'Célibataire' },
      { value: MaritalStatus.MARRIED, label: 'Marié(e)' },
      { value: MaritalStatus.DIVORCED, label: 'Divorcé(e)' },
      { value: MaritalStatus.WIDOWED, label: 'Veuf/Veuve' }
    ];

    return maritalStatusOptions.find(option => option.value === status)?.label;
  }

  private getGender(gender: Gender) {
    const genderOptions = [
      { value: Gender.MALE, label: 'Homme' },
      { value: Gender.FEMALE, label: 'Femme' },
    ]

    return genderOptions.find(option => option.value === gender)?.label;
  }
}
