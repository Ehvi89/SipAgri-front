import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {BehaviorSubject, Observable, of, Subject, switchMap, takeUntil} from 'rxjs';
import { Plantation } from '../../../../core/models/plantation-model';
import { PlantationService } from '../../services/plantation-service';
import { GoogleMapsService } from '../../services/google-maps-service';
import { catchError, tap } from 'rxjs/operators';
import { NotificationService } from '../../../../core/services/notification-service';
import { ActivatedRoute } from '@angular/router';
import { Planter } from '../../../../core/models/planter-model';
import { PlanterService } from '../../../planter/services/planter-service';
import {PlantationStatus} from '../../../../core/enums/plantation-status-enum';

@Component({
  selector: 'app-plantation-details',
  standalone: false,
  templateUrl: './plantation-details.html',
  styleUrl: './plantation-details.scss'
})
export class PlantationDetails implements OnInit {
  private readonly destroy$ = new Subject<void>();

  loading$!: Observable<boolean>;
  private readonly plantation = new BehaviorSubject<Plantation | null>(null);
  private readonly planter = new BehaviorSubject<Planter | null>(null);
  plantation$!: Observable<Plantation | null>;
  planter$!: Observable<Planter | null>;

  // Google Maps
  isGoogleMapsReady = false;
  mapZoom!: number;
  mapCenter!: google.maps.LatLngLiteral;
  mapMarkers!: google.maps.marker.AdvancedMarkerElementOptions;
  mapOptions!: google.maps.MapOptions;

  constructor(
    private readonly plantationService: PlantationService,
    private readonly googleMapsService: GoogleMapsService,
    private readonly cdr: ChangeDetectorRef,
    private readonly notifService: NotificationService,
    private readonly route: ActivatedRoute,
    private readonly planterService: PlanterService
  ) {}

  ngOnInit() {
    this.initData();
  }

  private initGoogleMaps(center?: google.maps.LatLngLiteral): void {
    this.googleMapsService.load().pipe(
      takeUntil(this.destroy$),
      tap(() => {
        this.mapZoom = this.googleMapsService.mapZoom;
        this.mapOptions = this.googleMapsService.mapOptions;
        this.isGoogleMapsReady = true;

        if (center) {
          this.mapCenter = center;
          this.mapMarkers =
            {
              position: center,
              title: 'Emplacement de la plantation'
            }
        } else {
          this.googleMapsService.mapCenter$.subscribe({next: center => this.mapCenter = center});
        }

        this.cdr.detectChanges();
      }),
      catchError(error => {
        console.error('Erreur lors du chargement de Google Maps:', error);
        this.notifService.showError('Erreur lors du chargement de la carte');
        return of(null);
      })
    ).subscribe();
  }

  private initData() {
    this.loading$ = this.plantationService.loading$;

    this.route.queryParams.subscribe(params => {
      const plantationId = params['plantation'];

      this.plantationService.getById(plantationId).pipe(
        tap(plantation => {
          if (plantation) {
            this.plantation.next(plantation);

            if (plantation.gpsLocation?.latitude && plantation.gpsLocation?.longitude) {
              const center = {
                lat: Number(plantation.gpsLocation.latitude),
                lng: Number(plantation.gpsLocation.longitude)
              };
              this.initGoogleMaps(center);
            } else {
              this.initGoogleMaps();
            }
          }
        }),
        switchMap(plantation => {
          if (plantation?.planterId) {
            return this.planterService.getById(plantation.planterId).pipe(
              tap(planter => this.planter.next(planter || null)),
              catchError(error => {
                console.error('Erreur lors du chargement du planteur:', error);
                this.planter.next(null);
                return of(null);
              })
            );
          } else {
            this.planter.next(null);
            return of(null);
          }
        }),
        catchError(error => {
          console.error('Erreur lors du chargement de la plantation:', error);
          this.plantation.next(null);
          this.planter.next(null);
          return of(null);
        }),
        takeUntil(this.destroy$)
      ).subscribe();

      this.plantation$ = this.plantation.asObservable();
      this.planter$ = this.planter.asObservable();
    });
  }

  protected readonly PlantationStatus = PlantationStatus;
}
