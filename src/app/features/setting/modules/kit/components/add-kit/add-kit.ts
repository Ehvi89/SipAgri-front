import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Kit } from "../../../../../../core/models/kit-model";
import { KitService } from '../../services/kit-service';
import { ProductService } from '../../../product/services/product-service';
import { Product } from "../../../../../../core/models/product-model";
import { KitProduct } from "../../../../../../core/models/kit-product-model";
import { NotificationService } from "../../../../../../core/services/notification-service";

@Component({
  selector: 'app-add-kit',
  standalone: false,
  templateUrl: './add-kit.html',
  styleUrl: './add-kit.scss'
})
export class AddKit implements OnInit{
  loading$!: Observable<boolean>;

  private readonly destroy$ = new Subject<void>();

  // Form controls
  nameCtrl!: FormControl<string | null>;
  descriptionCtrl!: FormControl<string | null>;

  kitForm!: FormGroup;

  // Mode édition
  editMode: boolean = false;
  kitId: number | null = null;
  currentKit: Kit | null = null;

  // Produits disponibles
  availableProducts: Product[] = [];
  filteredProducts: Product[] = [];
  searchProduct!: FormControl;

  // Produit sélectionné pour ajout
  selectedProduct: Product | null = null;
  productQuantity!: FormControl;

  constructor(
    private readonly kitService: KitService,
    private readonly productService: ProductService,
    private readonly formBuilder: FormBuilder,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly notifService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.loading$ = this.kitService.loading$;
    this.initializeForm();
    this.loadProducts();
    this.checkEditMode();
  }

  /**
   * Initialise le formulaire
   */
  private initializeForm(): void {
    this.searchProduct = this.formBuilder.control('');
    this.productQuantity = this.formBuilder.control(1, [Validators.required, Validators.min(1)]);

    this.nameCtrl = this.formBuilder.control('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(100)
    ]);

    this.descriptionCtrl = this.formBuilder.control('', [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(500)
    ]);

    this.kitForm = this.formBuilder.group({
      name: this.nameCtrl,
      description: this.descriptionCtrl,
      kitProducts: this.formBuilder.array([])
    });
  }

  /**
   * Charge la liste des produits disponibles
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
        }
      });
  }

  /**
   * Vérifie si on est en mode édition
   */
  private checkEditMode(): void {
    this.route.queryParams.subscribe(params => {
      const id = params['kit'];

      if (id) {
        this.kitId = Number.parseInt(id);
        this.editMode = true;
        this.loadKit(this.kitId);
      }
    });
  }

  /**
   * Charge les données du kit à modifier
   */
  private loadKit(id: number): void {
    this.kitService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (kit) => {
          this.currentKit = kit;
          this.kitForm.patchValue({
            name: kit.name,
            description: kit.description
          });

          // Ajoute les produits existants
          for (const kp of kit.kitProducts) {
            this.addKitProduct(kp);
          }
        },
        error: (error) => {
          console.error('Erreur lors du chargement du kit:', error);
          this.router.navigate(['/settings/kits']).then();
        }
      });
  }

  /**
   * Getter pour le FormArray des produits
   */
  get kitProducts(): FormArray {
    return this.kitForm.get('kitProducts') as FormArray;
  }

  /**
   * Filtre les produits selon la recherche
   */
  filterProducts(): void {
    const search = this.searchProduct.value.trim().toLowerCase().trim();

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
   * Sélectionne un produit pour ajout
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

    // Vérifie si le produit est déjà dans le kit
    const existingIndex = this.kitProducts.controls.findIndex(
      control => control.value.product.id === this.selectedProduct!.id
    );

    if (existingIndex >= 0) {
      // Mise à jour de la quantité si le produit existe déjà
      const existingControl = this.kitProducts.at(existingIndex);
      const newQuantity = existingControl.value.quantity + this.productQuantity;
      existingControl.patchValue({
        quantity: newQuantity,
        totalCost: this.selectedProduct.price * newQuantity
      });
    } else {
      // Ajout d'un nouveau produit
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
    const kitProductGroup = this.formBuilder.group({
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
    if (confirm('Voulez-vous vraiment retirer ce produit du kit ?')) {
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
   * Soumet le formulaire
   */
  onSubmit(): void {
    if (this.kitForm.invalid) {
      this.kitForm.markAllAsTouched();
      return;
    }

    if (this.kitProducts.length === 0) {
      alert('Veuillez ajouter au moins un produit au kit');
      return;
    }

    const kitData: Kit = {
      name: this.nameCtrl.value!,
      description: this.descriptionCtrl.value!,
      totalCost: this.calculateTotalCost(),
      kitProducts: this.kitProducts.value
    };

    const request$ = this.editMode && this.kitId
      ? this.kitService.update(this.kitId, {...kitData, id: this.kitId})
      : this.kitService.create(kitData);

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.notifService.showSuccess(`Kit ${this.editMode ? 'modifié' : 'créé'} avec succès`);
        this.router.navigate(['settings/kits']);
      },
      error: (error) => {
        console.error('Erreur lors de l\'enregistrement:', error);
        this.notifService.showError('Erreur lors de l\'enregistrement');
      }
    });
  }

  /**
   * Annule et retourne à la liste
   */
  cancel(): void {
    if (this.kitForm.dirty || this.kitProducts.length > 0) {
      if (confirm('Voulez-vous vraiment annuler ? Les modifications seront perdues.')) {
        this.router.navigate(['/settings/kits']);
      }
    } else {
      this.router.navigate(['/settings/kits']);
    }
  }

  /**
   * Réinitialise le formulaire
   */
  resetForm(): void {
    if (confirm('Voulez-vous vraiment réinitialiser le formulaire ?')) {
      this.kitProducts.clear();

      if (this.editMode && this.currentKit) {
        this.kitForm.patchValue({
          name: this.currentKit.name,
          description: this.currentKit.description
        });
        for (const kp of this.currentKit.kitProducts) {
          this.addKitProduct(kp);
        }
      } else {
        this.kitForm.reset();
      }

      this.kitForm.markAsUntouched();
      this.selectedProduct = null;
      this.productQuantity.setValue(1);
      this.searchProduct.setValue('');
    }
  }

  /**
   * Formate le prix pour l'affichage
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(price);
  }

  /**
   * Getters pour les erreurs de validation
   */
  get nameError(): string {
    if (this.nameCtrl.hasError('required')) {
      return 'Le nom est requis';
    }
    if (this.nameCtrl.hasError('minlength')) {
      return 'Le nom doit contenir au moins 3 caractères';
    }
    if (this.nameCtrl.hasError('maxlength')) {
      return 'Le nom ne peut pas dépasser 100 caractères';
    }
    return '';
  }

  get descriptionError(): string {
    if (this.descriptionCtrl.hasError('required')) {
      return 'La description est requise';
    }
    if (this.descriptionCtrl.hasError('minlength')) {
      return 'La description doit contenir au moins 10 caractères';
    }
    if (this.descriptionCtrl.hasError('maxlength')) {
      return 'La description ne peut pas dépasser 500 caractères';
    }
    return '';
  }

  get descriptionCharCount(): string {
    const length = this.descriptionCtrl.value?.length || 0;
    return `${length} / 500`;
  }
}
