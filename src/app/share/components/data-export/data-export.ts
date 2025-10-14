import {Component, OnInit} from '@angular/core';
import {
  DataExportService, ExportFormat,
  PlantationFilters,
  PlanterFilters,
  ProductionFilters
} from '../../../core/services/data-export-service';
import {NotificationService} from '../../../core/services/notification-service';

@Component({
  selector: 'app-data-export',
  standalone: false,
  templateUrl: './data-export.html',
  styleUrl: './data-export.scss'
})
export class DataExport implements OnInit {
  dataType: 'planters' | 'plantations' | 'productions' = 'planters';
  exportFormat: ExportFormat = 'csv';
  showFilters = false;

  // Filtres pour Planteurs
  planterFilters: PlanterFilters = {
    gender: undefined,
    maritalStatus: undefined,
    village: undefined,
    minChildrenNumber: undefined,
    maxChildrenNumber: undefined,
    minAge: undefined,
    maxAge: undefined
  };

  // Filtres pour Plantations
  plantationFilters: PlantationFilters = {
    minFarmedArea: undefined,
    maxFarmedArea: undefined,
    village: undefined
  };

  // Filtres pour Productions
  productionFilters: ProductionFilters = {
    year: undefined,
    minProductionInKg: undefined,
    maxProductionInKg: undefined,
    minPurchasePrice: undefined,
    maxPurchasePrice: undefined,
    mustBePaid: undefined
  };


  constructor(private readonly exportService: DataExportService,
              private readonly notificationService: NotificationService,) {}

  ngOnInit() {
    this.exportService.initializeData();
  }

  selectDataType(type: 'planters' | 'plantations' | 'productions'): void {
    this.dataType = type;
  }

  selectExportFormat(format: 'csv' | 'json' | 'pdf' | 'excel'): void {
    this.exportFormat = format;
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  resetFilters(): void {
    this.planterFilters = {
      gender: undefined,
      maritalStatus: undefined,
      village: undefined,
      minChildrenNumber: undefined,
      maxChildrenNumber: undefined,
      minAge: undefined,
      maxAge: undefined
    };

    this.plantationFilters = {
      minFarmedArea: undefined,
      maxFarmedArea: undefined,
      village: undefined
    };

    this.productionFilters = {
      year: undefined,
      minProductionInKg: undefined,
      maxProductionInKg: undefined,
      minPurchasePrice: undefined,
      maxPurchasePrice: undefined,
      mustBePaid: undefined
    };
  }

  handleExport(): void {
    // Ici vous devez injecter vos données réelles
    // Pour l'exemple, je montre comment appeler le service

    // Exemple d'appel au service (à adapter avec vos vraies données)
    let data: any[] = [];
    if (this.dataType === 'planters') {
      data = this.exportService.exportPlanters(this.planterFilters);
    }
    else if (this.dataType === 'plantations') {
      data = this.exportService.exportPlantations(this.plantationFilters);
    }

    else if (this.dataType === 'productions') {
      data = this.exportService.exportProductions(this.productionFilters);
    }

    if (data.length > 0) {
      switch(this.exportFormat) {
        case 'csv':
          this.exportService.exportToCSV(data, this.getDataTypeLabel());
          break;
        case 'json':
          this.exportService.exportToJSON(data, this.getDataTypeLabel());
          break;
        case 'excel':
          this.exportService.exportToExcel(data, this.getDataTypeLabel());
          break;
        case 'pdf':
          this.exportService.exportToPDF(data, this.dataType, `Liste des ${this.getDataTypeLabel()}`);
          break;
      }

      this.notificationService.showSuccess(`Export ${this.getDataTypeLabel()} en ${this.exportFormat.toUpperCase()} lancé !`);
    } else {
      this.notificationService.showWarning('Aucune données à exporter !')
    }
  }

  private getActiveFilters(): any {
    if (this.dataType === 'planters') {
      return this.cleanFilters(this.planterFilters);
    } else if (this.dataType === 'plantations') {
      return this.cleanFilters(this.plantationFilters);
    } else {
      return this.cleanFilters(this.productionFilters);
    }
  }

  private cleanFilters(filters: any): any {
    const cleaned: any = {};
    for (const key in filters) {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        cleaned[key] = filters[key];
      }
    }
    return cleaned;
  }

  getDataTypeLabel(): string {
    switch(this.dataType) {
      case 'planters': return 'Planteurs';
      case 'plantations': return 'Plantations';
      case 'productions': return 'Productions';
    }
  }
}
