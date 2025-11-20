import {ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {Planter} from '../../../../core/models/planter-model';
import {GeocodingService} from '../../../../core/services/geocoding-service';
import {finalize, forkJoin, map, Observable, of, Subject, take, tap} from 'rxjs';
import {PlanterService} from '../../services/planter-service';
import {NotificationService} from '../../../../core/services/notification-service';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogService} from '../../../../share/services/dialog-service';
import {MaritalStatus} from '../../../../core/enums/marital-status-enum';
import {SupervisorProfile} from '../../../../core/enums/supervisor-profile';
import {Gender} from '../../../../core/enums/gender-enum';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Supervisor} from '../../../../core/models/supervisor-model';
import {SupervisorService} from '../../../setting/modules/supervisor/services/supervisor-service';
import {MatDialog} from '@angular/material/dialog';
import {SAError} from '../../../../core/services/error-service';
import {AuthService} from '../../../auth/services/auth-service';
import {catchError, debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {PaymentMethod} from '../../../../core/enums/payment-method-enum';

@Component({
  selector: 'app-planter-details',
  standalone: false,
  templateUrl: './planter-details.html',
  styleUrl: './planter-details.scss'
})
export class PlanterDetails implements OnInit {
  /**
   * Represents a reference to an Angular template that defines a dialog for modifications.
   * It is typically used to render dynamic content within the dialog.
   * This property must be assigned an Angular `TemplateRef` object.
   *
   * The `modificationDialog` is useful for managing and displaying
   * modifiable content in a dialog format, such as forms or configuration options.
   *
   * @type {TemplateRef<any>}
   */
  @ViewChild('modificationDialog') modificationDialog!: TemplateRef<any>;

  /**
   * Represents a planter instance used to manage and interface
   * with planter-specific operations or functionality.
   *
   * This variable is declared as non-null with the TypeScript
   * definite assignment assertion modifier (`!`), indicating that
   * it is expected to be initialized before use.
   *
   * @type {Planter}
   */
  planter!: Planter;
  /**
   * Represents a collection of plantations associated with their respective villages.
   *
   * This variable is expected to hold an array where each element represents a specific plantation
   * along with its related village information. The structure of the elements in the array
   * is not explicitly defined and can vary depending on the application's needs.
   *
   * The variable is initialized as an empty array and can be populated dynamically
   * during the application's runtime with relevant data.
   */
  plantationsWithVillage: any[] = [];
  /**
   * A boolean variable indicating the loading state of an application or process.
   *
   * `true` indicates that the application or process is currently loading.
   * `false` indicates that the loading operation is not active.
   */
  loading = false;
  /**
   * Represents an observable that emits boolean values indicating the loading state.
   * The loading state is typically used to display or hide a loading indicator in the UI.
   */
  loadingUpdate!: Observable<boolean>
  /**
   * Represents the reactive form group for the planter.
   * This FormGroup is used to manage and validate the form controls
   * associated with a planter, such as fields for user input.
   */
  planterForm!: FormGroup;
  /**
   * Represents an observable stream of supervisors.
   *
   * The observable emits an array of `Supervisor` objects, which can be
   * used to access information about the supervisors in the system.
   */
  supervisors$!: Observable<Supervisor[]>;
  filteredVillages$!: Observable<NominatimResult[]>;
  private readonly searchTerms = new Subject<string>();
  geoLoading$!: Observable<boolean>;
  /**
   * Represents the list of options for marital status.
   *
   * Each option is an object containing:
   * - `value`: A reference to the corresponding `MaritalStatus` enumeration value.
   * - `label`: The display label for the marital status, in French.
   *
   * Available options:
   * - Single (Célibataire)
   * - Married (Marié(e))
   * - Divorced (Divorcé(e))
   * - Widowed (Veuf/Veuve)
   */
  maritalStatusOptions = [
    { value: MaritalStatus.SINGLE, label: 'Célibataire' },
    { value: MaritalStatus.MARRIED, label: 'Marié(e)' },
    { value: MaritalStatus.DIVORCED, label: 'Divorcé(e)' },
    { value: MaritalStatus.WIDOWED, label: 'Veuf/Veuve' }
  ];
  /**
   * Represents a list of payment method options available in the system.
   * Each option includes a value representing the specific payment method
   * and a corresponding label for display purposes.
   *
   * @constant {Array<Object>} paymentMethodOptions
   * @property {PaymentMethod} value - The value of the payment method, represented as an enum.
   * @property {string} label - The label of the payment method, used for display.
   */
  paymentMethodOptions = [
    { value: PaymentMethod.CHEQUE, label: 'Chèque' },
    { value: PaymentMethod.WAVE, label: 'Wave' },
    { value: PaymentMethod.ORANGE_MONEY, label: 'Orange Money' },
    { value: PaymentMethod.MOOV_MONEY, label: 'Moov Money' },
    { value: PaymentMethod.MTN_MONEY, label: 'MTN Money' }
  ];
  /**
   * A variable representing the gender of an individual.
   * It can hold values defined within the Gender enumeration, which is used to specify
   * gender types consistently across the application.
   *
   * @type {Gender}
   */
  gender = Gender;
  currentUser = AuthService.getCurrentUser();

  /**
   * Initializes a new instance of the class.
   *
   * @param {GeocodingService} geocodingService - Service for geocoding operations.
   * @param {PlanterService} planterService - Service for planter-related operations.
   * @param {ChangeDetectorRef} cdr - Change detector reference for Angular views.
   * @param {NotificationService} notifService - Service for displaying notifications.
   * @param {Router} router - Angular router for navigation.
   * @param {DialogService} dialogService - Service for managing dialogs.
   * @param {SupervisorService} supervisorService - Service for supervisor feature management.
   * @param {MatDialog} dialog - Material dialog for managing dialog windows.
   * @param {FormBuilder} formBuilder - Service for building Angular reactive forms.
   * @param {ActivatedRoute} route - Provides information about the active route.
   *
   * @return {void} No return value.
   */
  constructor(private readonly geocodingService: GeocodingService,
              private readonly planterService: PlanterService,
              private readonly cdr: ChangeDetectorRef,
              private readonly notifService: NotificationService,
              private readonly router: Router,
              private readonly dialogService: DialogService,
              private readonly supervisorService: SupervisorService,
              private readonly dialog: MatDialog,
              private readonly formBuilder: FormBuilder,
              private readonly route: ActivatedRoute) {}

  /**
   * Initializes the component and sets up required subscriptions and data fetching operations.
   *
   * This method is called once the component is initialized. It performs the following tasks:
   * - Subscribes to query parameters from the route to retrieve and process a planter's data by its ID.
   * - Sets up the loading state and initiates asynchronous geocoding requests for retrieving village names based on the GPS locations of plantations associated with the planter.
   * - Subscribes to changes in the supervisor field of the planter form to react to updates.
   * - Handles necessary UI updates such as triggering change detection and managing the loading state.
   *
   * @return {void}
   */
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const planterId: string = params['planter'];
      if (planterId) {
        this.planterService.getById(planterId)
          .subscribe(planter => this.planter = planter);
      }
    });
    this.loadingUpdate = this.planterService.loading$;
    if (this.planter?.plantations) {
      this.loading = true;
      const villageRequests = this.planter.plantations.map(plantation =>
        this.geocodingService.getPlaceName(plantation.gpsLocation).pipe(
          map(village => ({
            ...plantation,
            village: village
          })) ?? []
        )
      );

      forkJoin(villageRequests).pipe(
        take(1),
        tap(results => {
          this.plantationsWithVillage = results;
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      ).subscribe();
    }
  }

  /**
   * Initializes the planter form with predefined controls, values, and validations.
   * The form is created using FormBuilder and includes fields such as firstname, lastname, birthday, gender, marital status, children number, and others.
   * Each field is configured with its respective validators, ensuring data integrity and format.
   *
   * @return {void} Returns nothing as this method is used to initialize the form structure.
   */
  initForm(): void {
    console.log(this.planter)
    this.planterForm = this.formBuilder.group({
      firstname: [this.planter?.firstname, [Validators.required, Validators.minLength(2)]],
      lastname: [this.planter?.lastname, [Validators.required, Validators.minLength(2)]],
      birthday: [this.planter?.birthday, Validators.required],
      gender: [this.planter?.gender, Validators.required],
      maritalStatus: [this.planter?.maritalStatus, Validators.required],
      childrenNumber: [this.planter?.childrenNumber, [Validators.required, Validators.min(0)]],
      village: [this.planter?.village, Validators.required],
      supervisor: [this.planter.supervisor, Validators.required],
      phoneNumber: [this.planter.phoneNumber, [Validators.minLength(10), Validators.maxLength(10)]],
      paymentMethod: [this.planter.paymentMethod, Validators.required],
    });
    const currentUser = AuthService.getCurrentUser();
    if (currentUser.profile === 'SUPERVISOR') {
      this.planterForm.get('supervisor')?.disable();
    }
  }

  /**
   * Modifies the current planter data. Initializes the form, retrieves the list of supervisors,
   * and opens a dialog for user confirmation. If confirmed, the planter is partially updated with the new data
   * and the changes are applied. Displays success or error notifications based on the operation's outcome.
   *
   * @return {void} This method does not return any value.
   */
  modifyPlanter(): void {
    this.supervisors$ = this.supervisorService.getAll();
    this.initForm();
    const currentUser = AuthService.getCurrentUser();
    this.planterForm.get('supervisor')?.patchValue(currentUser);
    this.dialog.open(this.modificationDialog).afterClosed().subscribe((result: boolean) => {
      if (result) {
        const planter = {
          id: this.planter?.id,
          ...this.planterForm.value,
        }
        this.planterService.partialUpdate(planter.id, planter).pipe(
          tap((planter: Planter) => {
            this.planter = planter;
            this.cdr.detectChanges();
          })
        ).subscribe({
          next: () => this.notifService.showSuccess("Planteur mis à jour"),
          error: (error: SAError) => this.notifService.showError(error.message),
        });
      }
    })
  }

  /**
   * Calculates the total surface area of all plantations within the planter.
   * It iterates through the plantations, summing up their farmed areas.
   *
   * @return {number} The total surface area of all plantations. Returns 0 if there are no plantations or if the planter is undefined.
   */
  getTotalSurface(): number {
    let total = 0;
    if (this.planter?.plantations != null && this.planter?.plantations?.length > 0) {
      for (let plantation of this.planter.plantations) {
        total += plantation.farmedArea;
      }
    }

    return total;
  }

  /**
   * Calculates the average annual production in kilograms based on the production data
   * provided for different plantations and years.
   * If no production data is available, the method returns 0.
   *
   * @return {number} The average annual production in kilograms,
   * or 0 if there is no production data.
   */
  getAnnualProduction(): number {
    if (!this.planter?.plantations?.length) return 0;

    const yearlyTotals: { [year: number]: number } = {};

    for (const plantation of this.planter.plantations) {
      if (!plantation.productions?.length) continue;

      for (const production of plantation.productions) {
        // Normaliser l'année en number
        const year = production.year instanceof Date
          ? production.year.getFullYear()
          : +production.year;

        if (!yearlyTotals[year]) yearlyTotals[year] = 0;
        yearlyTotals[year] += production.productionInKg;
      }
    }

    // Calcul de la moyenne annuelle
    const years = Object.keys(yearlyTotals);
    if (years.length === 0) return 0;

    const total = years.reduce((sum, y) => sum + yearlyTotals[+y], 0);
    return total / years.length;
  }

  /**
   * Initiates the process to delete a planter. Displays a confirmation dialog to the user.
   * If the user confirms, deletes the planter associated with the current instance.
   * On a successful deletion, redirects the user to the "planters" page. If an error occurs during deletion,
   * displays an error notification.
   *
   * @return {void} Does not return a value.
   */
  deletePlanter(): void {
    this.dialogService.showDialog({
      title: 'Confirmation',
      message: 'Voulez-vous vraiment supprimer ce planteur ?',
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      deletion: true
    }).subscribe((result: boolean) => {
      if (result) {
        this.planterService.delete(this.planter.id!).subscribe({
          next:() => this.router.navigateByUrl('/planters').then(() => null),
          error:() => this.notifService.showError("Une erreur est survenue lors de la suppression du planteur")
        });
      }
    });
  }



  /**
   * Returns a string label representing the marital status.
   *
   * @param {MaritalStatus | undefined} value - The marital status value or undefined.
   * @return {string} The corresponding label for the marital status, or an empty string if the value is undefined or unrecognized.
   */
  getMaritalStatusLabel(value: MaritalStatus | undefined): string {
    switch (value) {
      case MaritalStatus.MARRIED:
        return 'Marié(e)';
      case MaritalStatus.DIVORCED:
        return 'Divorcé(e)';
      case MaritalStatus.SINGLE:
        return 'Célibataire';
      case MaritalStatus.WIDOWED:
        return 'Veuf/Veuve';
      default:
        return '';
    }
  }
  /**
   * Navigates to the "add plantation" page with a query parameter for the current planter's ID.
   * The navigation is performed using the router's `navigate` method.
   * @return {Promise<boolean>} A promise that resolves to `true` if navigation is successful, or `false` otherwise.
   */
  async addPlantation(): Promise<boolean> {
    return this.router.navigate(['/plantations/add'], {
      queryParams: {planter: this.planter.id}
    });
  }

  // Méthode pour déclencher la recherche
  onVillageInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerms.next(input.value);
  }

  // Méthode pour afficher le nom du village dans l'input
  displayVillage(village: NominatimResult | string): string {
    if (!village) return '';

    if (typeof village === 'string') {
      return village;
    }

    // Afficher un format plus lisible
    const address = village.address;
    if (address?.village) {
      return `${address.village}, ${address.county || address.state || 'Côte d\'Ivoire'}`;
    } else if (address?.town) {
      return `${address.town}, ${address.county || address.state || 'Côte d\'Ivoire'}`;
    }

    return village.display_name;
  }

  private setupVillageAutocomplete(): void {
    this.filteredVillages$ = this.searchTerms.pipe(
      debounceTime(300), // Attendre 300ms après la dernière frappe
      distinctUntilChanged(), // Ignorer si la valeur n'a pas changé
      switchMap((term: string) => {
        if (term.length < 3) {
          return of([]); // Ne pas rechercher si moins de 3 caractères
        }
        return this.searchVillages(term);
      })
    );
  }

  private searchVillages(searchTerm: string): Observable<NominatimResult[]> {
    return this.geocodingService.searchLocations(searchTerm).pipe(
      map((results: NominatimResult[]) => {
        // Filtrer et prioriser les résultats
        return results
          .filter(result =>
            result.type === 'village' ||
            result.type === 'town' ||
            result.type === 'city' ||
            result.address?.village ||
            result.address?.town
          )
          .slice(0, 8)
      }),
      catchError(error => {
        console.error('Erreur de recherche Nominatim:', error);
        this.notifService.showError('Erreur lors de la recherche des villages');
        return of([]);
      })
    );
  }
}

// Todo: Faire en sorte que les information tel que le superviseur ne puisse pas être sélectionné
