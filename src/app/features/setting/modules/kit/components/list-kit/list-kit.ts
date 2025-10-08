import {Component, OnInit} from '@angular/core';
import {Observable, Subject, takeUntil} from 'rxjs';
import { Kit } from "../../../../../../core/models/kit-model";
import { PaginationResponse } from "../../../../../../core/models/pagination-response-model";
import {KitService} from '../../services/kit-service';
import {Router} from '@angular/router';
import {FormBuilder, FormControl} from '@angular/forms';
import { NotificationService } from "../../../../../../core/services/notification-service";

@Component({
  selector: 'app-list-kit',
  standalone: false,
  templateUrl: './list-kit.html',
  styleUrl: './list-kit.scss'
})
export class ListKit implements OnInit{
  loading$!: Observable<boolean>;
  kits$!: Observable<PaginationResponse<Kit> | null>;

  private destroy$ = new Subject<void>();

  // Filtres et recherche
  searchTerm!: FormControl;

  // Affichage détails
  expandedKitId: number | null = null;

  constructor(
    private kitService: KitService,
    private router: Router,
    private formBuilder: FormBuilder,
    private notifService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loading$ = this.kitService.loading$;
    this.loadKits();
    this.kits$ = this.kitService.pagedData$;
    this.searchTerm = this.formBuilder.control('');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charge la liste des kits
   */
  private loadKits(): void {
    this.kitService.getAllPaged().subscribe();
  }

  /**
   * Recherche de kits
   */
  onSearch(): void {
    if (this.searchTerm.value.trim()) {
      this.kitService.search(this.searchTerm.value);
    } else {
      this.loadKits();
    }
  }

  /**
   * Réinitialise la recherche
   */
  clearSearch(): void {
    this.searchTerm.setValue('');
    this.loadKits();
  }

  /**
   * Actualise la liste
   */
  refresh(): void {
    this.loadKits();
  }

  /**
   * Navigue vers la page d'ajout de kit
   */
  navigateToAdd(): void {
    this.router.navigate(['/settings/kits/add']);
  }

  /**
   * Navigue vers la page de modification
   */
  editKit(kit: Kit): void {
    this.router.navigate(['/settings/kits/add'], {queryParams: {kit: kit.id}});
  }

  /**
   * Toggle l'affichage des détails d'un kit
   */
  toggleKitDetails(kitId: number): void {
    this.expandedKitId = this.expandedKitId === kitId ? null : kitId;
  }

  /**
   * Vérifie si un kit est déplié
   */
  isExpanded(kitId: number): boolean {
    return this.expandedKitId === kitId;
  }

  /**
   * Supprime un kit
   */
  deleteKit(kit: Kit): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le kit "${kit.name}" et tous ses produits associés ?`)) {
      this.kitService.delete(kit.id!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadKits();
            console.log('Kit supprimé avec succès');
          },
          error: (error) => {
            console.error('Erreur lors de la suppression:', error);
          }
        });
    }
  }

  /**
   * Duplique un kit
   */
  duplicateKit(kit: Kit): void {
    if (confirm(`Voulez-vous dupliquer le kit "${kit.name}" ?`)) {
      const duplicatedKit = {
        ...kit,
        name: `${kit.name} (Copie)`,
        id: undefined,
        kitProducts: kit.kitProducts.map(kitProduct => ({
          ...kitProduct,
          id: undefined
        }))
      };

      this.kitService.create(duplicatedKit)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadKits();
            this.notifService.showSuccess('Kit dupliqué avec succès');
          },
          error: (error) => {
            console.error('Erreur lors de la duplication:', error);
            this.notifService.showError('Erreur lors de la duplication');
          }
        });
    }
  }

  /**
   * Navigation pagination
   */
  nextPage(): void {
    this.kitService.loadNextData();
  }

  previousPage(): void {
    this.kitService.loadPreviousData();
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
  truncateDescription(description: string, maxLength: number = 80): string {
    if (!description) return '-';
    return description.length > maxLength
      ? description.substring(0, maxLength) + '...'
      : description;
  }

  /**
   * Calcule le nombre total de produits dans un kit
   */
  getTotalProducts(kit: Kit): number {
    return kit.kitProducts.reduce((sum, kp) => sum + kp.quantity, 0);
  }

  /**
   * Obtient le badge de couleur selon le nombre de produits
   */
  getProductCountClass(count: number): string {
    if (count === 0) return 'empty';
    if (count <= 3) return 'low';
    if (count <= 7) return 'medium';
    return 'high';
  }

  protected readonly Math = Math;
}
