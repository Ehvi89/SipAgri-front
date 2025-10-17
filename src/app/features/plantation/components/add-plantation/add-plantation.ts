import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, map, Observable, startWith, Subject, takeUntil} from 'rxjs';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {Planter} from '../../../../core/models/planter-model';
import {Kit} from '../../../../core/models/kit-model';
import {PlanterService} from '../../../planter/services/planter-service';
import {NotificationService} from '../../../../core/services/notification-service';
import {KitService} from '../../../setting/modules/kit/services/kit-service';
import {GoogleMapsService} from '../../services/google-maps-service';
import {catchError, tap} from 'rxjs/operators';
import {PlantationService} from '../../services/plantation-service';
import {GeocodingService} from '../../../../core/services/geocoding-service';
import {Location} from '../../../../core/models/location-model';
import {ActivatedRoute} from '@angular/router';
import {AuthService} from "../../../auth/services/auth-service";
import {SupervisorProfile} from '../../../../core/enums/supervisor-profile';

@Component({
  selector: 'app-add-plantation',
  standalone: false,
  templateUrl: './add-plantation.html',
  styleUrl: './add-plantation.scss'
})
export class AddPlantation implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  loading$!: Observable<boolean>;

  //FormGroup & FormControl
  plantationForm!: FormGroup;
  addressCtrl!: FormControl;
  regionCtrl!: FormControl;
  gpsCtrl!: FormControl;
  gpsLocation!: Location;

  // Maps options
  mapZoom = 10; // Valeur par défaut
  mapOptions!: google.maps.MapOptions;
  mapCenter!: Observable<google.maps.LatLngLiteral>
  isGoogleMapsReady = false;

  // datas fields
  private readonly regionsSubject = new BehaviorSubject<string[]>([]);
  regions$ = this.regionsSubject.asObservable();
  planters$!: Observable<Planter[]>;
  kits$!: Observable<Kit[]>;

  // Constructor
  constructor(
    private readonly fb: FormBuilder,
    private readonly planterService: PlanterService,
    private readonly plantationService: PlantationService,
    private readonly notifService: NotificationService,
    private readonly kitService: KitService,
    private readonly googleMapsService: GoogleMapsService,
    private readonly cdr: ChangeDetectorRef,
    private readonly geocodingService: GeocodingService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.initForms();
    this.initData();
    this.initGoogleMaps();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize data
   * @return void
   * */
  private initData() {
    this.loading$ = this.plantationService.loading$;

    // get planters data
    const currentUser = AuthService.getCurrentUser();
    if (currentUser.profile === SupervisorProfile.ADMINISTRATOR) {
      this.planters$ = this.planterService.getAll();
    } else {
      this.planters$ = this.planterService.getAllPaged(undefined, 50).pipe(
        map(planters => planters.data)
      );
    }
    // get kits data
    this.kits$ = this.kitService.getAll();

    // Initialiser les régions si vous avez un service pour cela
    this.geocodingService.getRegions().pipe(
      tap(data => this.regionsSubject.next(data)),
    ).subscribe();
  }

  /**
   * Initialize Google Maps call load method of ../plantation/services/googleMapsService
   * @return void
   * */
  private initGoogleMaps(): void {
    try {
      this.googleMapsService.load().pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this.mapZoom = this.googleMapsService.mapZoom;
          this.mapCenter = this.googleMapsService.mapCenter$;
          this.mapOptions = this.googleMapsService.mapOptions;
          this.isGoogleMapsReady = true;
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

  /**
   * Initialize the formGroup and formControls
   * @return void
   * */
  private initForms(): void {
    // initialize the parcel information form
    this.plantationForm = this.fb.group({
      name: [''],
      description: [''],
      farmedArea: [1, [Validators.required, Validators.min(0.1)]],
      kit: [null, Validators.required],
      planterId: [null, Validators.required],
    });

    // check url to verify if it contains the planter's id
    this.route.queryParams.subscribe(params => {
      const planterId:string = params['planter'];
      if (planterId) {
        this.plantationForm.patchValue({ planterId: Number.parseInt(planterId) });
      }
    });

    // initialize the gps location controls
    this.addressCtrl = this.fb.control('');
    this.regionCtrl = this.fb.control('');
    this.gpsCtrl = this.fb.control('', [Validators.required, this.validateGpsCoordinates]);

    this.gpsCtrl.valueChanges.pipe(
      takeUntil(this.destroy$),
      startWith(''),
      tap((value: string) => {
        if (value && this.isValidGpsFormat(value)) {
          const coordinates = value.split(",");
          const lat = Number.parseFloat(coordinates[0].trim());
          const lng = Number.parseFloat(coordinates[1].trim());

          if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
            this.geocodingService.getPlaceName({
              latitude: lat,
              longitude: lng,
              displayName: '',
            }).pipe(
              takeUntil(this.destroy$),
              map((placeName: string) => ({
                latitude: lat,
                longitude: lng,
                displayName: placeName,
              })),
              tap(location => {
                this.gpsLocation = location;
                if (!this.plantationForm.get('name')?.value) {
                  this.plantationForm.patchValue({ name: location.displayName });
                }
                const names = String(location.displayName).split(',');

                this.addressCtrl.setValue(names[0].trim());
                if (!this.regionsSubject.value.includes(names[1].trim())) {
                  this.regionsSubject.next([...this.regionsSubject.value, names[1].trim()])
                }
                this.regionCtrl.patchValue(`${names[1].trim()}`);
              }),
              catchError(error => {
                console.error('Erreur lors de la géolocalisation:', error);
                return [];
              })
            ).subscribe();
          }
        }
      })
    ).subscribe();
  }

  /**
   * Validate GPS coordinates format
   */
  private validateGpsCoordinates(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const coordinates = value.split(',');
      if (coordinates.length !== 2) {
        return { invalidFormat: true };
      }

      const lat = Number.parseFloat(coordinates[0].trim());
      const lng = Number.parseFloat(coordinates[1].trim());

      if (Number.isNaN(lat) || Number.isNaN(lng)) {
        return { invalidCoordinates: true };
      }

      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return { outOfRange: true };
      }

      return null;
    };
  }
  /**
   * Check if a GPS format is valid
   */
  private isValidGpsFormat(value: string): boolean {
    const coordinates = value.split(',');
    if (coordinates.length !== 2) return false;

    const lat = Number.parseFloat(coordinates[0].trim());
    const lng = Number.parseFloat(coordinates[1].trim());

    return !Number.isNaN(lat) && !Number.isNaN(lng) &&
      lat >= -90 && lat <= 90 &&
      lng >= -180 && lng <= 180;
  }

  /**
   * Register the new plantation
   * @return void
   * */
  createPlantation() {
    if (this.plantationForm.valid && this.gpsCtrl.valid) {
      const plantation = {
        ...this.plantationForm.value,
        gpsLocation: this.gpsLocation
      };
      // console.log(plantation)

      this.plantationService.create(plantation).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.notifService.showSuccess("Plantation créée avec succès");
          this.resetForm();
        },
        error: error => {
          console.error('Erreur lors de la création:', error);
          this.notifService.showError(error.message || 'Erreur lors de la création de la plantation');
        },
      });
    } else {
      this.markFormGroupTouched();
      this.notifService.showError('Veuillez corriger les erreurs dans le formulaire');
    }
  }

  /**
   * Mark all form controls as touched to show validation errors
   */
  private markFormGroupTouched() {
    Object.keys(this.plantationForm.controls).forEach(key => {
      this.plantationForm.get(key)?.markAsTouched();
    });
    this.gpsCtrl.markAsTouched();
  }

  /**
   * Reset form after successful creation
   */
  private resetForm() {
    this.plantationForm.reset({
      name: '',
      description: '',
      planter: null,
      farmedArea: 1,
      kit: null,
      planterId: null,
    });
    this.gpsCtrl.reset();
    this.addressCtrl.reset();
    this.regionCtrl.reset();
  }

  /**
   * Handle map click: set GPS coordinates into the control
   */
  onMapClick(event: google.maps.MapMouseEvent): void {
    const lat = event.latLng?.lat();
    const lng = event.latLng?.lng();
    if (lat !== undefined && lng !== undefined) {
      // Formater à 6 décimales (modifiable selon besoin)
      this.gpsCtrl.setValue(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      this.gpsCtrl.markAsDirty();
      this.gpsCtrl.updateValueAndValidity();
    }
  }

  /**
   * Handle planter selection change
   */
  onPlanterChange(planterId: number) {
    this.plantationForm.patchValue({ planterId });
  }
}
