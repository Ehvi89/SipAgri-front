import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, of, Subject, switchMap, takeUntil} from 'rxjs';
import {Plantation} from '../../../../core/models/plantation-model';
import {PlantationService} from '../../services/plantation-service';
import {GoogleMapsService} from '../../services/google-maps-service';
import {catchError, tap} from 'rxjs/operators';
import {NotificationService} from '../../../../core/services/notification-service';
import {ActivatedRoute} from '@angular/router';
import {Planter} from '../../../../core/models/planter-model';
import {PlanterService} from '../../../planter/services/planter-service';

@Component({
  selector: 'app-planation-details',
  standalone: false,
  templateUrl: './plantation-details.html',
  styleUrl: './plantation-details.scss'
})
export class PlantationDetails implements OnInit{
  private destroy$ = new Subject<void>();

  loading$!: Observable<boolean>
  private plantation = new BehaviorSubject<Plantation | null>(null);
  private planter = new BehaviorSubject<Planter | null>(null);
  plantation$!: Observable<Plantation | null>
  planter$!: Observable<Planter | null>

  // Google Maps
  isGoogleMapsReady: boolean = false;
  mapZoom!: number
  mapCenter$!: Observable<google.maps.LatLngLiteral>
  mapMarkers!: google.maps.marker.AdvancedMarkerElementOptions
  mapOptions!: google.maps.MapOptions

  constructor(private plantationService: PlantationService,
              private googleMapsService: GoogleMapsService,
              private cdr: ChangeDetectorRef,
              private notifService: NotificationService,
              private route: ActivatedRoute,
              private planterService: PlanterService,) {}


  ngOnInit() {
    this.initData();
  }

  private initGoogleMaps(): void {
    try {
      this.googleMapsService.load().pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this.mapZoom = this.googleMapsService.mapZoom;
          this.mapCenter$ = this.googleMapsService.mapCenter$;
          this.mapOptions = this.googleMapsService.mapOptions;
          this.isGoogleMapsReady = true;
          this.mapMarkers = this.googleMapsService.selectedMarkerOptions;
          this.cdr.detectChanges();
        }),
        catchError(error => {
          console.error('Erreur lors du chargement de Google Maps:', error);
          this.notifService.showError('Erreur lors du chargement de la carte');
          throw error;
        })
      ).subscribe();
    } catch (error) {
      console.error('Erreur lors du chargement de Google Maps:', error);
      this.notifService.showError('Erreur lors du chargement de la carte');
    }
  }

  private initData() {
    this.loading$ = this.plantationService.loading$;
    this.route.queryParams.subscribe(params => {
      const plantationId = params['plantation'];
      this.plantationService.getById(plantationId).pipe(
        tap(plantation => {
          if (plantation) {
            this.plantation.next(plantation);
          }
        }),
        switchMap(plantation => {
          if (plantation && plantation.planterId) {
            return this.planterService.getById(plantation.planterId).pipe(
              tap(planter => {
                if (planter) {
                  this.planter.next(planter);
                }
              }),
              catchError(error => {
                console.error('Erreur lors du chargement du planteur:', error);
                // Optionnel: mettre un planteur par défaut ou null
                this.planter.next(null);
                return of(null);
              })
            );
          } else {
            this.planter.next(null);
            console.log("no data")
            return of(null);
          }
        }),
        catchError(error => {
          console.error('Erreur lors du chargement de la plantation:', error);
          this.plantation.next(null);
          this.planter.next(null);
          return of(null);
        }),
        takeUntil(this.destroy$) // Ajout important pour éviter les memory leaks
      ).subscribe();
      this.plantation$ = this.plantation.asObservable();
      this.planter$ = this.planter.asObservable();
      this.initGoogleMaps();
    });
  }
}
