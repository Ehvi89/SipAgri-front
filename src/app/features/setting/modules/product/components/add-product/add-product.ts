import { Component, OnInit } from '@angular/core';
import {Observable, Subject, takeUntil} from 'rxjs';
import { Product } from "../../../../../../core/models/product-model";
import { NotificationService } from "../../../../../../core/services/notification-service";
import {ProductService} from '../../services/product-service';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-add-product',
  standalone: false,
  templateUrl: './add-product.html',
  styleUrl: './add-product.scss'
})
export class AddProduct implements OnInit{
  loading$!: Observable<boolean>;

  private destroy$ = new Subject<void>();

  // Form controls
  nameCtrl!: FormControl<string | null>;
  descriptionCtrl!: FormControl<string | null>;
  priceCtrl!: FormControl<number | null>;

  productForm!: FormGroup;

  // Mode édition
  editMode: boolean = false;
  productId: string | null = null;
  currentProduct: Product | null = null;

  constructor(
    private productService: ProductService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private notifService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.loading$ = this.productService.loading$;
    this.initializeForm();
    this.checkEditMode();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialise le formulaire
   */
  private initializeForm(): void {
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

    this.priceCtrl = this.formBuilder.control(null, [
      Validators.required,
      Validators.min(0.01),
      Validators.max(999999.99)
    ]);

    this.productForm = this.formBuilder.group({
      name: this.nameCtrl,
      description: this.descriptionCtrl,
      price: this.priceCtrl
    });
  }

  /**
   * Vérifie si on est en mode édition
   */
  private checkEditMode(): void {
     this.route.queryParams.subscribe(params => {
       this.productId = params['product'];
    });


    if (this.productId) {
      this.editMode = true;
      this.loadProduct(this.productId);
    }
  }

  /**
   * Charge les données du produit à modifier
   */
  private loadProduct(id: string): void {
    this.productService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (product) => {
          this.currentProduct = product;
          this.productForm.patchValue({
            name: product.name,
            description: product.description,
            price: product.price
          });
        },
        error: (error) => {
          console.error('Erreur lors du chargement du produit:', error);
          this.router.navigateByUrl('products');
        }
      });
  }

  /**
   * Soumet le formulaire
   */
  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const productData: Product = {
      ...this.productForm.value,
      price: parseFloat(this.priceCtrl.value?.toString() || '0')
    };

    const request$ = this.editMode && this.productId
      ? this.productService.update(this.productId, {...productData, id: this.productId})
      : this.productService.create(productData);

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.notifService.showSuccess(`Produit ${this.editMode ? 'modifié' : 'créé'} avec succès`);
        this.router.navigateByUrl('/settings/products');
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
    if (this.productForm.dirty) {
      if (confirm('Voulez-vous vraiment annuler ? Les modifications seront perdues.')) {
        this.router.navigateByUrl('products');
      }
    } else {
      this.router.navigateByUrl('/settings/products');
    }
  }

  /**
   * Réinitialise le formulaire
   */
  resetForm(): void {
    if (confirm('Voulez-vous vraiment réinitialiser le formulaire ?')) {
      if (this.editMode && this.currentProduct) {
        this.productForm.patchValue({
          name: this.currentProduct.name,
          description: this.currentProduct.description,
          price: this.currentProduct.price
        });
      } else {
        this.productForm.reset();
      }
      this.productForm.markAsUntouched();
    }
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

  get priceError(): string {
    if (this.priceCtrl.hasError('required')) {
      return 'Le prix est requis';
    }
    if (this.priceCtrl.hasError('min')) {
      return 'Le prix doit être supérieur à 0';
    }
    if (this.priceCtrl.hasError('max')) {
      return 'Le prix ne peut pas dépasser 999 999,99 €';
    }
    return '';
  }

  /**
   * Compteur de caractères pour la description
   */
  get descriptionCharCount(): string {
    const length = this.descriptionCtrl.value?.length || 0;
    return `${length} / 500`;
  }
}
