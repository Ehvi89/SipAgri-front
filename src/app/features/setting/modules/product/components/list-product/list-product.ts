import {Component, OnInit} from '@angular/core';
import {Observable, Subject, takeUntil} from 'rxjs';
import { PaginationResponse } from "../../../../../../core/models/pagination-response-model";
import { Product } from "../../../../../../core/models/product-model";
import {ProductService} from '../../services/product-service';
import {Router} from '@angular/router';
import {tap} from 'rxjs/operators';
import {FormBuilder, FormControl} from '@angular/forms';

@Component({
  selector: 'app-list-product',
  standalone: false,
  templateUrl: './list-product.html',
  styleUrl: './list-product.scss'
})
export class ListProduct implements OnInit{
  loading$!: Observable<boolean>;
  products$!: Observable<PaginationResponse<Product> | null>;

  private destroy$ = new Subject<void>();

  // Filtres et recherche
  searchTerm!: FormControl;

  constructor(
    private productService: ProductService,
    private router: Router,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.loading$ = this.productService.loading$;
    this.loadProducts();
    this.products$ = this.productService.pagedData$;
    this.searchTerm = this.fb.control('');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charge la liste des produits
   */
  private loadProducts(): void {
    this.productService.getAllPaged().subscribe();
  }

  /**
   * Recherche de produits
   */
  onSearch(): void {
    if (this.searchTerm.value.trim()) {
      this.productService.search(this.searchTerm.value);
    } else {
      this.loadProducts();
    }
  }

  /**
   * Réinitialise la recherche
   */
  clearSearch(): void {
    this.searchTerm.setValue('');
    this.loadProducts();
  }

  /**
   * Actualise la liste
   */
  refresh(): void {
    this.loadProducts();
  }

  /**
   * Navigue vers la page d'ajout de produit
   */
  navigateToAdd(): void {
    this.router.navigate(['/settings/products/add']);
  }

  /**
   * Navigue vers la page de modification
   */
  editProduct(product: Product): void {
    this.router.navigate(['/settings/products/add'], { queryParams: { product: product.id } });
  }

  /**
   * Supprime un produit
   */
  deleteProduct(product: Product): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le produit "${product.name}" ?`)) {
      this.productService.delete(product.id!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadProducts();
            console.log('Produit supprimé avec succès');
          },
          error: (error) => {
            console.error('Erreur lors de la suppression:', error);
          }
        });
    }
  }

  /**
   * Navigation pagination
   */
  nextPage(): void {
    this.productService.loadNextData();
  }

  previousPage(): void {
    this.productService.loadPreviousData();
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
   * Tronque la description
   */
  truncateDescription(description: string, maxLength: number = 100): string {
    if (!description) return '-';
    return description.length > maxLength
      ? description.substring(0, maxLength) + '...'
      : description;
  }

  protected readonly Math = Math;
}
