import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import {Observable, Subject, BehaviorSubject } from 'rxjs';
import { map, startWith, takeUntil, shareReplay, tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Plantation } from '../../../../core/models/plantation-model';
import { PlantationService } from '../../services/plantation-service';
import { PaginationResponse } from '../../../../core/models/pagination-response-model';
import { PlanterService } from '../../../planter/services/planter-service';
import { Planter } from '../../../../core/models/planter-model';
import { GoogleMapsService } from '../../services/google-maps-service';
import { Router } from '@angular/router';

/**
 * Represents an extended plantation interface that extends the basic functionality
 * of the Plantation interface by including an optional observable for a planter.
 *
 * This interface can be used to enrich the plantation data with reactive streams
 * for handling planter information.
 *
 * Properties:
 * - `planter$` (optional): An Observable of Planter providing reactive updates
 *   or data flow related to the planter associated with the plantation.
 */
interface ExtendedPlantation extends Plantation {
  planter$?: Observable<Planter>;
}

/**
 * The PlantationList component is responsible for managing and displaying a list of plantations.
 * It supports pagination, search functionality, filtering by culture and village, and interactions
 * such as selecting a plantation or viewing planter profiles. The component also integrates with
 * Google Maps to display and interact with plantation locations on a map.
 */
@Component({
  selector: 'app-plantation-list',
  standalone: false,
  templateUrl: './plantation-list.html',
  styleUrl: './plantation-list.scss'
})
export class PlantationList implements OnInit, OnDestroy {
  private readonly plantationService = inject(PlantationService);
  private readonly planterService = inject(PlanterService);
  private readonly googleMapsService = inject(GoogleMapsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);

  loading$!: Observable<boolean>;

  searchControl = new FormControl('');
  searchSubject = new BehaviorSubject<string>('');

  plantations$!: Observable<PaginationResponse<Plantation> | null>;
  filteredPlantations$!: Observable<ExtendedPlantation[]>;

  listSizeCtrl = new FormControl(10);
  villageFilter = new FormControl('');

  selectedPlantation: ExtendedPlantation | null = null;
  isGoogleMapsReady = false;
  mapZoom!: number;
  mapOptions!: google.maps.MapOptions;
  mapCenter!: Observable<google.maps.LatLngLiteral>;
  selectedMarkerOptions!: google.maps.marker.AdvancedMarkerElementOptions;

  villages: { id: undefined|number, value: string }[]= [];

  private readonly destroy$ = new Subject<void>();

  /**
   * The ngOnInit lifecycle hook is called once the component is initialized.
   * This method initializes component data, sets up search functionality,
   * configures filters, and initializes Google Maps integration.
   *
   * @return {void} This method does not return a value.
   */
  ngOnInit(): void {
    this.initializeData();
    this.setupSearch();
    this.setupFilters();
    this.initializeGoogleMaps().then();
  }

  /**
   * Handles the cleanup logic when the component or directive is destroyed.
   * This ensures that any ongoing subscriptions or resources are properly terminated to avoid memory leaks.
   *
   * @return {void} This method does not return anything.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initializes the necessary data for the component.
   *
   * This method sets up the loading stream and subscribes to the service
   * to load paged data. It also prepares the observable for plantation data.
   *
   * @return {void} Does not return any value.
   */
  private initializeData(): void {
    this.loading$ = this.plantationService.loading$;

    // Charger les données initiales
    this.plantationService.getAllPaged().pipe(
      takeUntil(this.destroy$),
    ).subscribe();

    this.plantations$ = this.plantationService.pagedData$;
  }

  /**
   * Initializes the search setup by subscribing to value changes from the search control.
   * Applies debouncing, distinct value filtering, and ensures cleanup when the component is destroyed.
   * The processed search term is emitted to the searchSubject and the plantationService for handling.
   *
   * @return {void} No return value.
   */
  private setupSearch(): void {
    // Débounce pour la recherche
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.searchSubject.next(searchTerm || '');
      this.plantationService.search(searchTerm || '');
    });
  }

  /**
   * Initializes the Google Maps service and sets up related configurations
   * such as map zoom, center, options, and marker options. Also updates
   * the state to indicate Google Maps readiness and triggers change detection.
   * Uses observables for tracking the lifecycle of the component.
   *
   * @return {Promise<void>} A promise that resolves when the Google Maps
   * initialization process is initiated.
   */
  private async initializeGoogleMaps(): Promise<void> {
    try {
      this.googleMapsService.load().pipe(
        tap(() => {
          this.mapZoom = this.googleMapsService.mapZoom;
          this.mapCenter = this.googleMapsService.mapCenter$;
          this.mapOptions = this.googleMapsService.mapOptions;
          this.selectedMarkerOptions = this.googleMapsService.selectedMarkerOptions;
          this.isGoogleMapsReady = true;
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroy$)
      ).subscribe();
    } catch (error) {
      console.error('Erreur lors du chargement de Google Maps:', error);
    }
  }

  /**
   * Sets up filters for the plantation data by combining observables for plantations,
   * village filter, and search input. Filters and processes the plantation data based
   * on provided criteria, enriching the plantations with additional observables.
   * Also triggers centering of the map based on processed plantations.
   *
   * @return {void} This method does not return a value.
   */
  private setupFilters(): void {
    this.filteredPlantations$ = this.plantations$.pipe(
      map(data => data?.data || []),
      map(plantations => {
        return plantations.map(plantation => this.enrichPlantationWithObservables(plantation));
      }),
      shareReplay(1),
      takeUntil(this.destroy$)
    );

    this.villageFilter.valueChanges.pipe(
      startWith(''),
      tap(value => this.plantationService.search(value!, 0, 10, true))
    ).subscribe();

    this.searchSubject.asObservable().pipe(
      startWith(''),
      tap(value => this.plantationService.search(value, 0, 10))
    ).subscribe();

    this.listSizeCtrl.valueChanges.pipe(
      startWith(10),
      tap(value => this.plantationService.getAllPaged(0, value!).pipe(
        takeUntil(this.destroy$),
        tap(data => {
          this.villages = data.data.map(plantation => ({
            id: plantation.id,
            value: plantation.gpsLocation.displayName
          })).filter((village, index, self) =>
            index === self.findIndex(v => v.value.toLowerCase() === village.value.toLowerCase())
          );
        })).subscribe()
      )
    ).subscribe()
  }
  /**
   * Enriches the given plantation object with additional observable properties.
   *
   * @param {Plantation} plantation - The original plantation object that needs to be enriched.
   * @return {ExtendedPlantation} A new plantation object that includes observable properties, specifically for the planter data.
   */
  private enrichPlantationWithObservables(plantation: Plantation): ExtendedPlantation {
    return {
      ...plantation,
      planter$: this.planterService.getById(plantation.planterId),
    };
  }

  /**
   * Selects a plantation and updates the selected plantation property.
   * If the plantation has GPS location data, it also passes the location information
   * to the Google Maps service for selection and display on the map.
   *
   * @param plantation The plantation object of type ExtendedPlantation, containing details such as GPS location, ID, and farmed area.
   * @return void
   */
  selectPlantation(plantation: ExtendedPlantation): void {
    this.selectedPlantation = plantation;
    if (plantation.gpsLocation) {
      this.googleMapsService.selectPlantation(
        plantation.gpsLocation.latitude,
        plantation.gpsLocation.longitude,
        `Plantation ${plantation.id} - ${plantation.farmedArea} ha`
      );
    }
  }



  /**
   * Loads the data for the previous page by invoking the respective
   * service method. This method interacts with the plantationService
   * to retrieve and load the relevant data from the previous dataset.
   *
   * @return {void} Does not return a value.
   */
  loadPreviousPage(): void {
    this.plantationService.loadPreviousData();
  }

  /**
   * Triggers the loading of the next set of data by invoking the appropriate service method.
   *
   * @return {void} This method does not return any value.
   */
  loadNextPage(): void {
    this.plantationService.loadNextData();
  }

  /**
   * Handles the search functionality by setting the search term in the control.
   * This method is triggered when the user enters a search term in the search input.
   * The search term is passed to the searchSubject and the plantationService for handling.
   * Search plantation by his name.
   *
   * @param {string} searchTerm - The term to search for.
   * @return {void} This method does not return a value.
   */
  onSearch(searchTerm: string): void {
    this.searchControl.setValue(searchTerm);
  }

  /**
   * Navigates to the planter's profile page using the provided planter's details.
   *
   * @param {Planter} planter - The planter object containing the details of the planter, including its ID.
   * @return {void} This method does not return a value.
   */
  viewPlanter(planter: Planter): void {
    this.router.navigate(['/planters/profile'], {
      queryParams: {planter: planter.id}
    }).then();
  }
}
