import {Component, OnInit} from '@angular/core';
import {
  DataExportService, ExportFormat,
  PlantationFilters,
  PlanterFilters,
  ProductionFilters
} from '../../../core/services/data-export-service';
import {NotificationService} from '../../../core/services/notification-service';
import {AuthService} from '../../../features/auth/services/auth-service';

@Component({
  selector: 'app-data-export',
  standalone: false,
  templateUrl: './data-export.html',
  styleUrl: './data-export.scss'
})
export class DataExport implements OnInit {
  /**
   * Specifies the type of agricultural data category.
   * This variable can contain one of the following string values: 'planters', 'plantations', or 'productions'.
   * The default value is set to 'planters'.
   *
   * - 'planters': Refers to data related to individuals or equipment involved in planting.
   * - 'plantations': Refers to data related to agricultural land designated for large-scale planting.
   * - 'productions': Refers to data associated with the output or yield of agricultural practices.
   */
  dataType: 'planters' | 'plantations' | 'productions' = 'planters';
  /**
   * Represents the format in which data will be exported.
   * The default format is set to 'csv'.
   *
   * This variable can be used to specify the desired output format
   * when exporting data in applications supporting multiple export options.
   *
   * Type: ExportFormat
   */
  exportFormat: ExportFormat = 'excel';
  /**
   * An array of objects representing the available export formats.
   *
   * Each object within the array contains the following properties:
   * - value: A string identifying the format (e.g., 'excel', 'pdf').
   * - label: A user-friendly name for the format (e.g., 'Excel', 'PDF').
   * - extension: The file extension associated with the format (e.g., '.xlsx', '.pdf').
   */
  exportFormats: { value: 'excel' | 'pdf' | 'csv' | 'json', label: string, extension: string }[] = [
    { value: 'excel', label: 'Excel', extension: '.xlsx' },
    { value: 'pdf', label: 'PDF', extension: '.pdf' }
  ];
  /**
   * A boolean variable that determines whether filters are displayed.
   *
   * When set to `true`, the filters will be shown to the user; when set to `false`,
   * the filters are hidden. This variable is typically used to control the visibility
   * of filtering options in a user interface.
   */
  showFilters = false;

  // Filtres pour Planteurs
  /**
   * Represents filtering criteria for planters.
   *
   * @typedef {Object} PlanterFilters
   * @property {string|undefined} gender - A filter based on the gender of the planter. Can be undefined if no gender filter is applied.
   * @property {string|undefined} maritalStatus - A filter based on the marital status of the planter. Can be undefined if no marital status filter is applied.
   * @property {string|undefined} village - A filter based on the village of the planter. Can be undefined if no village filter is applied.
   * @property {number|undefined} minChildrenNumber - Specifies the minimum number of children the planter has. Undefined if no minimum is set.
   * @property {number|undefined} maxChildrenNumber - Specifies the maximum number of children the planter has. Undefined if no maximum is set.
   * @property {number|undefined} minAge - Specifies the minimum age of the planter. Undefined if no minimum age is set.
   * @property {number|undefined} maxAge - Specifies the maximum age of the planter. Undefined if no maximum age is set.
   *
   * @type {PlanterFilters}
   */
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
  /**
   * Represents the filters used to refine searches or queries for plantations.
   *
   * @typedef {Object} PlantationFilters
   * @property {number|undefined} minFarmedArea - The minimum farmed area (in applicable measurement units) for filtering plantations. If undefined, no minimum restriction is applied.
   * @property {number|undefined} maxFarmedArea - The maximum farmed area (in applicable measurement units) for filtering plantations. If undefined, no maximum restriction is applied.
   * @property {string|undefined} village - The name of the village to filter plantations by. If undefined, no village restriction is applied.
   */
  plantationFilters: PlantationFilters = {
    minFarmedArea: undefined,
    maxFarmedArea: undefined,
    village: undefined
  };

  // Filtres pour Productions
  /**
   * An object representing the filters to be applied when querying production data.
   * The filters include constraints on production year, production amounts, purchase prices,
   * and payment requirements.
   *
   * @typedef {Object} ProductionFilters
   * @property {number|undefined} year - The specific year of production to filter results by. Undefined if no filter is applied for year.
   * @property {number|undefined} minProductionInKg - The minimum production in kilograms to filter results. Undefined if no minimum is specified.
   * @property {number|undefined} maxProductionInKg - The maximum production in kilograms to filter results. Undefined if no maximum is specified.
   * @property {number|undefined} minPurchasePrice - The minimum purchase price to filter results. Undefined if no minimum price is specified.
   * @property {number|undefined} maxPurchasePrice - The maximum purchase price to filter results. Undefined if no maximum price is specified.
   * @property {boolean|undefined} mustBePaid - A boolean indicating whether the production data must be paid. Undefined if no payment condition is applied.
   */
  productionFilters: ProductionFilters = {
    year: undefined,
    minProductionInKg: undefined,
    maxProductionInKg: undefined,
    minPurchasePrice: undefined,
    maxPurchasePrice: undefined,
    mustBePaid: undefined
  };


  /**
   * Constructs an instance of the class.
   *
   * @param {DataExportService} exportService - The service responsible for handling data export operations.
   * @param {NotificationService} notificationService - The service responsible for managing notifications.
   */
  constructor(private readonly exportService: DataExportService,
              private readonly notificationService: NotificationService,) {}

  /**
   * Angular lifecycle hook that is called after the component's view has been fully initialized.
   * This method initializes the necessary data for the component by invoking the `initializeData`
   * method of the export service and retrieves the information of the currently authenticated user
   * from the authorization service.
   *
   * @return {void} No return value.
   */
  ngOnInit(): void {
    this.exportService.initializeData();
    const currentUser = AuthService.getCurrentUser();
    if (currentUser.profile === "SUPER_ADMIN") {
      this.exportFormats.push(
        { value: 'json', label: 'JSON', extension: '.json' },
        { value: 'csv', label: 'CSV', extension: '.csv' }
      )
    }
  }

  /**
   * Selects and assigns the specified data type to the internal property `dataType`.
   *
   * @param {'planters'|'plantations'|'productions'} type - The type of data to be selected.
   * Must be one of the following values: 'planters', 'plantations', or 'productions'.
   * @return {void} This method does not return any value.
   */
  selectDataType(type: 'planters' | 'plantations' | 'productions'): void {
    this.dataType = type;
  }

  /**
   * Sets the export format for data.
   *
   * @param {'csv' | 'json' | 'pdf' | 'excel'} format - The format to which the data will be exported. Accepted values are 'csv', 'json', 'pdf', or 'excel'.
   * @return {void} Does not return any value.
   */
  selectExportFormat(format: 'csv' | 'json' | 'pdf' | 'excel'): void {
    this.exportFormat = format;
  }

  /**
   * Toggles the visibility state of filters.
   * Changes the value of the `showFilters` property to its opposite (true to false or false to true).
   *
   * @return {void} Does not return a value.
   */
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  /**
   * Resets all the filters for planters, plantations, and production to their default undefined values.
   *
   * @return {void} Does not return a value.
   */
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

  /**
   * Handles the export of data based on the specified data type and format.
   * Depending on the data type, retrieves the corresponding data and exports it
   * in the chosen format, such as CSV, JSON, Excel, or PDF. Displays a notification
   * indicating whether the export was successful or if there is no data to export.
   *
   * @return {void} This method does not return any value.
   */
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

  /**
   * Retrieves the label corresponding/**
   to * the Retrieves current the data label type corresponding.
   to *
   the * current @ datareturn type {.
   string *
   } * Returns @ thereturn label { forstring the} data The type label, for such the as current ' dataPl typeante,urs such', as ' 'PlantPlationsante',urs or', ' 'ProduPlantctionsations'.
   ', */
  getDataTypeLabel(): string {
    switch(this.dataType) {
      case 'planters': return 'Planteurs';
      case 'plantations': return 'Plantations';
      case 'productions': return 'Productions';
    }
  }
}
