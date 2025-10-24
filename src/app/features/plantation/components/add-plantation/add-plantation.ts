import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, map, Observable, startWith, Subject, takeUntil} from 'rxjs';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {Planter} from '../../../../core/models/planter-model';
import {Product} from '../../../../core/models/product-model';
import {KitProduct} from '../../../../core/models/kit-product-model';
import {PlanterService} from '../../../planter/services/planter-service';
import {NotificationService} from '../../../../core/services/notification-service';
import {ProductService} from '../../../setting/modules/product/services/product-service';
import {GoogleMapsService} from '../../services/google-maps-service';
import {catchError, tap} from 'rxjs/operators';
import {PlantationService} from '../../services/plantation-service';
import {GeocodingService} from '../../../../core/services/geocoding-service';
import {Location} from '../../../../core/models/location-model';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from "../../../auth/services/auth-service";
import {SupervisorProfile} from '../../../../core/enums/supervisor-profile';
import {PlantationStatus} from '../../../../core/enums/plantation-status-enum';
import {Plantation} from '../../../../core/models/plantation-model';

@Component({
  selector: 'app-add-plantation',
  standalone: false,
  templateUrl: './add-plantation.html',
  styleUrl: './add-plantation.scss'
})
export class AddPlantation implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  loading$!: Observable<boolean>;

  // Mode édition
  editMode: boolean = false;
  plantationId: number | null = null;
  planterId: number | null = null;


  //FormGroup & FormControl
  plantationForm!: FormGroup;
  addressCtrl!: FormControl;
  regionCtrl!: FormControl;
  gpsCtrl!: FormControl;
  gpsLocation!: Location;

  // Maps options
  mapZoom = 10;
  mapOptions!: google.maps.MapOptions;
  mapCenter!: Observable<google.maps.LatLngLiteral>
  isGoogleMapsReady = false;

  // datas fields
  private readonly regionsSubject = new BehaviorSubject<string[]>([]);
  planters$!: Observable<Planter[]>;
  plantation: Plantation | null = null;

  // Produits pour le kit
  availableProducts: Product[] = [];
  filteredProducts: Product[] = [];
  searchProduct!: FormControl;
  selectedProduct: Product | null = null;
  productQuantity!: FormControl;

  // Constructor
  constructor(
    private readonly fb: FormBuilder,
    private readonly planterService: PlanterService,
    private readonly plantationService: PlantationService,
    private readonly notifService: NotificationService,
    private readonly productService: ProductService,
    private readonly googleMapsService: GoogleMapsService,
    private readonly cdr: ChangeDetectorRef,
    private readonly geocodingService: GeocodingService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.initForms();
    this.initData();
    this.initGoogleMaps();
    this.loadProducts();
    this.checkEditMode();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize data
   */
  private initData() {
    this.loading$ = this.plantationService.loading$;

    const currentUser = AuthService.getCurrentUser();
    if (currentUser.profile === SupervisorProfile.ADMINISTRATOR) {
      this.planters$ = this.planterService.getAll();
    } else {
      this.planters$ = this.planterService.getAllPaged(undefined, 50).pipe(
        map(planters => planters.data)
      );
    }

    this.geocodingService.getRegions().pipe(
      tap(data => this.regionsSubject.next(data)),
    ).subscribe();
  }

  /**
   * Charge les produits disponibles
   */
  private loadProducts(): void {
    this.productService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (products) => {
          this.availableProducts = products;
          this.filteredProducts = products;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des produits:', error);
          this.notifService.showError('Erreur lors du chargement des produits');
        }
      });
  }

  /**
   * Vérifie si on est en mode édition
   */
  private checkEditMode(): void {
    this.route.queryParams.subscribe(params => {
      const plantationId = params['plantation'];
      this.planterId = Number.parseInt(params['planter']);

      // Gérer l'ID du planteur depuis l'URL
      if (this.planterId && !plantationId) {
        this.plantationForm.patchValue({ planterId: this.planterId });
      }

      // Gérer le mode édition
      if (plantationId) {
        this.plantationId = Number.parseInt(plantationId);
        this.editMode = true;
        this.loadPlantation(this.plantationId);
      }
    });
  }

  /**
   * Charge les données de la plantation à modifier
   */
  private loadPlantation(id: number): void {
    this.plantationService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (plantation) => {
          this.plantation = plantation;
          // Remplir les champs du formulaire
          this.plantationForm.patchValue({
            name: plantation.name,
            description: plantation.description,
            farmedArea: plantation.farmedArea,
            planterId: plantation.planterId,
            sector: plantation.sector,
          });

          // Remplir les coordonnées GPS
          this.gpsLocation = plantation.gpsLocation;
          this.gpsCtrl.setValue(`${plantation.gpsLocation.latitude}, ${plantation.gpsLocation.longitude}`);

          // Remplir l'adresse et la région
          const names = String(plantation.gpsLocation.displayName).split(',');
          this.addressCtrl.setValue(names[0]?.trim() || '');
          this.regionCtrl.setValue(names[1]?.trim() || '');

          // Charger les produits du kit
          if (plantation.kit?.kitProducts && plantation.kit.kitProducts.length > 0) {
            this.kitProducts.clear();
            for (const kp of plantation.kit.kitProducts) {
              this.addKitProduct(kp);
            }
          }

          // Mettre à jour la carte
          if (this.isGoogleMapsReady) {
            this.googleMapsService.updateMapCenter({
              lat: plantation.gpsLocation.latitude,
              lng: plantation.gpsLocation.longitude
            });
          }

          // Marquer le formulaire comme pristine
          this.plantationForm.markAsPristine();
          this.plantationForm.markAsUntouched();
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erreur lors du chargement de la plantation:', error);
          this.notifService.showError('Erreur lors du chargement de la plantation');
          this.router.navigate(['/plantations']);
        }
      });
  }

  /**
   * Initialize Google Maps
   */
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
   * Initialize forms
   */
  private initForms(): void {
    // Contrôles pour la recherche de produits
    this.searchProduct = this.fb.control('');
    this.productQuantity = this.fb.control(1, [Validators.required, Validators.min(1)]);

    // Formulaire principal
    this.plantationForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      sector: ['', Validators.required],
      farmedArea: [1, [Validators.required, Validators.min(0.1)]],
      planterId: [null, Validators.required],
      kitProducts: this.fb.array([], Validators.required)
    });

    // Contrôles GPS
    this.addressCtrl = this.fb.control('');
    this.regionCtrl = this.fb.control('');
    this.gpsCtrl = this.fb.control('', [Validators.required, this.validateGpsCoordinates()]);

    // Écouter les changements GPS
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
                this.plantationForm.patchValue({ sector: names.at(-1)!.trim() });
                console.log('last location names: ', names.at(-1));
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
   * Getter pour le FormArray des produits du kit
   */
  get kitProducts(): FormArray {
    return this.plantationForm.get('kitProducts') as FormArray;
  }

  /**
   * Filtre les produits selon la recherche
   */
  filterProducts(): void {
    const search = this.searchProduct.value.trim().toLowerCase();

    if (search) {
      this.filteredProducts = this.availableProducts.filter(p =>
        p.name.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search)
      );
    } else {
      this.filteredProducts = this.availableProducts;
    }
  }

  /**
   * Sélectionne un produit
   */
  selectProduct(product: Product): void {
    this.selectedProduct = product;
    this.productQuantity.setValue(1);
  }

  /**
   * Ajoute un produit au kit
   */
  addProductToKit(): void {
    if (!this.selectedProduct || this.productQuantity.value <= 0) {
      return;
    }

    // Vérifie si le produit existe déjà
    const existingIndex = this.kitProducts.controls.findIndex(
      control => control.value.product.id === this.selectedProduct!.id
    );

    if (existingIndex >= 0) {
      // Met à jour la quantité
      const existingControl = this.kitProducts.at(existingIndex);
      const newQuantity = existingControl.value.quantity + this.productQuantity.value;
      existingControl.patchValue({
        quantity: newQuantity,
        totalCost: this.selectedProduct.price * newQuantity
      });
    } else {
      // Ajoute un nouveau produit
      const kitProduct: KitProduct = {
        product: this.selectedProduct,
        quantity: this.productQuantity.value,
        totalCost: this.selectedProduct.price * this.productQuantity.value
      };
      this.addKitProduct(kitProduct);
    }

    // Réinitialise la sélection
    this.selectedProduct = null;
    this.productQuantity.setValue(1);
    this.searchProduct.setValue('');
    this.filteredProducts = this.availableProducts;
  }

  /**
   * Ajoute un KitProduct au FormArray
   */
  private addKitProduct(kitProduct: KitProduct): void {
    const kitProductGroup = this.fb.group({
      id: [kitProduct.id],
      product: [kitProduct.product, Validators.required],
      quantity: [kitProduct.quantity, [Validators.required, Validators.min(1)]],
      totalCost: [kitProduct.totalCost]
    });

    this.kitProducts.push(kitProductGroup);
  }

  /**
   * Supprime un produit du kit
   */
  removeProductFromKit(index: number): void {
    if (confirm('Voulez-vous vraiment retirer ce produit ?')) {
      this.kitProducts.removeAt(index);
    }
  }

  /**
   * Met à jour la quantité d'un produit
   */
  updateProductQuantity(index: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeProductFromKit(index);
      return;
    }

    const kitProductControl = this.kitProducts.at(index);
    const product = kitProductControl.value.product;
    const newTotalCost = product.price * quantity;

    kitProductControl.patchValue({
      quantity: quantity,
      totalCost: newTotalCost
    });
  }

  /**
   * Calcule le coût total du kit
   */
  calculateTotalCost(): number {
    return this.kitProducts.controls.reduce((sum, control) => {
      return sum + (control.value.totalCost || 0);
    }, 0);
  }

  /**
   * Calcule le nombre total de produits
   */
  getTotalProducts(): number {
    return this.kitProducts.controls.reduce((sum, control) => {
      return sum + (control.value.quantity || 0);
    }, 0);
  }

  /**
   * Formate le prix
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(price);
  }

  /**
   * Validate GPS coordinates
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
   * Create or update a plantation
   */
  createPlantation() {
    if (this.plantationForm.valid && this.gpsCtrl.valid) {
      if (this.kitProducts.length === 0) {
        this.notifService.showError('Veuillez ajouter au moins un produit au kit');
        return;
      }

      const plantationData = {
        ...this.plantationForm.value,
        gpsLocation: this.gpsLocation,
        status: PlantationStatus.ACTIVE,
        kit: {
          id: this.plantation?.kit.id,
          name: `Kit ${this.plantationForm.value.name}`,
          description: `Kit pour la plantation ${this.plantationForm.value.name}`,
          totalCost: this.calculateTotalCost(),
          kitProducts: this.kitProducts.value
        }
      };

      const request$ = this.editMode && this.plantationId
        ? this.plantationService.partialUpdate(this.plantationId, { ...plantationData, id: this.plantationId })
        : this.plantationService.create(plantationData);

      request$.pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.notifService.showSuccess(
            this.editMode ? 'Plantation modifiée avec succès' : 'Plantation créée avec succès'
          );
          if (this.editMode) {
            this.router.navigate(['/plantations']);
          } else {
            this.resetForm();
          }
        },
        error: error => {
          console.error('Erreur lors de l\'enregistrement:', error);
          this.notifService.showError(
            error.message || 'Erreur lors de l\'enregistrement de la plantation'
          );
        },
      });
    } else {
      this.markFormGroupTouched();
      this.notifService.showError('Veuillez corriger les erreurs dans le formulaire');
    }
  }

  /**
   * Mark all form controls as touched
   */
  private markFormGroupTouched() {
    for (let key of Object.keys(this.plantationForm.controls)) {
      const control = this.plantationForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    }
    for(let ctrl of [this.gpsCtrl, this.addressCtrl, this.regionCtrl]){
      ctrl.markAsTouched();
    }
  }

  /**
   * Reset form
   */
  private resetForm() {
    setTimeout(() => {
      this.plantationForm.reset({
        name: '',
        description: '',
        sector: '',
        farmedArea: 1,
        planterId: this.planterId,
      });

      this.kitProducts.clear();

      this.gpsCtrl.reset('');
      this.addressCtrl.reset('');
      this.regionCtrl.reset('');

      for (let key of Object.keys(this.plantationForm.controls)) {
        const control = this.plantationForm.get(key);
        if (control) {
          control.setErrors(null);
          control.markAsUntouched();
          control.markAsPristine();
        }
      }

      for(let ctrl of [this.gpsCtrl, this.addressCtrl, this.regionCtrl]){
        ctrl.setErrors(null);
        ctrl.markAsUntouched();
        ctrl.markAsPristine();
      }

      this.plantationForm.markAsPristine();
      this.plantationForm.markAsUntouched();

      this.gpsLocation = { latitude: 0, longitude: 0, displayName: '' };
      this.selectedProduct = null;
      this.searchProduct.setValue('');
      this.filteredProducts = this.availableProducts;

      this.cdr.detectChanges();
    }, 0);
  }

  /**
   * Annule et retourne à la liste
   */
  cancel(): void {
    if (this.plantationForm.dirty || this.kitProducts.length > 0) {
      if (confirm('Voulez-vous vraiment annuler ? Les modifications seront perdues.')) {
        this.router.navigate(['/plantations']).then(() => null);
      }
    } else {
      this.router.navigate(['/plantations']).then(() => null);
    }
  }

  /**
   * Handle map click
   */
  onMapClick(event: google.maps.MapMouseEvent): void {
    const lat = event.latLng?.lat();
    const lng = event.latLng?.lng();
    if (lat !== undefined && lng !== undefined) {
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
