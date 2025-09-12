import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import {combineLatest, Observable, Subject, of, BehaviorSubject} from 'rxjs';
import {map, startWith, takeUntil, catchError, shareReplay, tap} from 'rxjs/operators';
import { Plantation } from '../../../../core/models/plantation-model';
import { PlantationService } from '../../services/plantation-service';
import { PaginationResponse } from '../../../../core/models/pagination-response-model';
import { GeocodingService } from '../../../../core/services/geocoding-service';
import { PlanterService } from '../../../planter/services/planter-service';
import { Planter } from '../../../../core/models/planter-model';
import { GoogleMapsService } from '../../services/google-maps-service';
import {Router} from '@angular/router';

interface ExtendedPlantation extends Plantation {
  planter$?: Observable<Planter>;
  culture$?: Observable<string>;
  village$?: Observable<string>;
}

@Component({
  selector: 'app-plantation-list',
  standalone: false,
  templateUrl: './plantation-list.html',
  styleUrl: './plantation-list.scss'
})
export class PlantationList implements OnInit, OnDestroy {
  private readonly plantationService = inject(PlantationService);
  private readonly geocodingService = inject(GeocodingService);
  private readonly planterService = inject(PlanterService);
  private readonly googleMapsService = inject(GoogleMapsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);

  loading$!: Observable<boolean>;

  searchSubject = new BehaviorSubject<string>('');

  plantations$!: Observable<PaginationResponse<Plantation>>;
  filteredPlantations$!: Observable<ExtendedPlantation[]>;

  cultureFilter = new FormControl('');
  villageFilter = new FormControl('');

  selectedPlantation: ExtendedPlantation | null = null;
  isGoogleMapsReady = false;
  mapZoom!: number;
  mapOptions!: google.maps.MapOptions;
  mapCenter!: Observable<google.maps.LatLngLiteral>;
  selectedMarkerOptions!: google.maps.marker.AdvancedMarkerElementOptions;

  cultures: string[] = ['Cacao', 'Café', 'Palmier à huile', 'Hévéa', 'Anacardier'];
  villages: string[] = ['Bonoua', 'Samo', 'Anyama', 'Kokondékro', 'Nangassérégué'];

  private readonly destroy$ = new Subject<void>();

  async ngOnInit(): Promise<void> {
    await this.initializeGoogleMaps();
    this.initializeData();
    this.setupFilters();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async initializeGoogleMaps(): Promise<void> {
    try {
      this.googleMapsService.load().pipe(
        tap(() => {
          this.mapZoom = this.googleMapsService.mapZoom;
          this.mapCenter = this.googleMapsService.mapCenter$;
          this.mapOptions = this.googleMapsService.mapOptions;
          this.selectedMarkerOptions = this.googleMapsService.selectedMarkerOptions;
          this.isGoogleMapsReady = true;
        })
      ).subscribe();
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Erreur lors du chargement de Google Maps:', error);
    }
  }

  private initializeData(): void {
    this.loading$ = this.plantationService.loading$;
    this.plantations$ = this.plantationService.getAllPaged();
  }

  private setupFilters(): void {
    this.filteredPlantations$ = combineLatest([
      this.plantationService.getAll(),
      this.villageFilter.valueChanges.pipe(startWith('')),
      this.searchSubject.asObservable()
    ]).pipe(
      map(([plantations, villageFilter, search]) =>
        plantations
          .filter(p => (!search && p.gpsLocation.display_name?.toLowerCase().includes(search.toLowerCase())) &&
            this.matchesVillageFilter(p, villageFilter))
          .map(p => this.enrichPlantationWithObservables(p))
      ),
      shareReplay(1),
      takeUntil(this.destroy$)
    );

    this.centrerCarteSelonPlantations();
  }

  private matchesVillageFilter(_plantation: Plantation, _villageFilter: string | null): boolean {
    return !_villageFilter && _plantation.name.toLowerCase().includes(_villageFilter!.toLowerCase());
  }

  private enrichPlantationWithObservables(plantation: Plantation): ExtendedPlantation {
    return {
      ...plantation,
      planter$: this.planterService.getById(plantation.planterId).pipe(
        catchError(() => of({ firstname: 'Inconnu', lastname: '' } as Planter))
      ),
      culture$: of('Non spécifié'),
      village$: plantation.gpsLocation
        ? this.geocodingService.getPlaceName(plantation.gpsLocation).pipe(
          catchError(() => of('Non spécifié'))
        )
        : of('Non spécifié')
    };
  }

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

  clearSelection(): void {
    this.selectedPlantation = null;
    this.googleMapsService.resetMapView();
  }

  deletePlantation(plantationId: number): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette plantation ?')) return;

    this.plantationService.delete(plantationId).subscribe({
      next: () => {
        console.log('Plantation supprimée avec succès');
        if (this.selectedPlantation?.id === plantationId) {
          this.clearSelection();
        }
        this.plantations$ = this.plantationService.getAllPaged();
      },
      error: (error) => console.error('Erreur lors de la suppression:', error)
    });
  }

  private centrerCarteSelonPlantations(): void {
    this.plantations$.pipe(takeUntil(this.destroy$)).subscribe(plantations => {
      const validLocations = plantations.data
        .filter(p => p.gpsLocation?.latitude && p.gpsLocation?.longitude)
        .map(p => ({ lat: p.gpsLocation!.latitude, lng: p.gpsLocation!.longitude }));

      if (validLocations.length > 0 && !this.selectedPlantation) {
        this.googleMapsService.calculateMapBounds(validLocations);
      }
    });
  }

  loadPreviousPage() {
    this.plantationService.loadPreviousData()
  }

  loadNextPage() {
    this.plantationService.loadNextData()
  }

  onSearch($event: string) {
    this.searchSubject.next($event);
  }

  viewPlanter(planter: Planter) {
    this.router.navigate(['/planters/profile'], {queryParams: {planter: planter.id}}).then(() => null)
  }
}
