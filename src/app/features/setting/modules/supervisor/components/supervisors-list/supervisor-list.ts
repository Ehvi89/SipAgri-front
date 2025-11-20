import {Component, OnInit} from '@angular/core';
import {Observable, Subject, takeUntil} from 'rxjs';
import {Supervisor} from '../../../../../../core/models/supervisor-model';
import {SupervisorService} from '../../services/supervisor-service';
import {Router} from '@angular/router';
import { PaginationResponse } from "../../../../../../core/models/pagination-response-model";
import { SupervisorProfile } from "../../../../../../core/enums/supervisor-profile";
import {FormBuilder, FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'app-supervisors-list',
  standalone: false,
  templateUrl: './supervisor-list.html',
  styleUrl: './supervisor-list.scss'
})
export class SupervisorList implements OnInit {
  loading$!: Observable<boolean>;
  supervisors$!: Observable<PaginationResponse<Supervisor> | null>;

  private readonly destroy$ = new Subject<void>();

  // Filtres
  searchTerm!: FormControl;
  selectedProfile!: FormControl<SupervisorProfile | 'ALL' | null>;

  // Enum pour le template
  profiles = Object.values(SupervisorProfile);

  constructor(
    private readonly supervisorService: SupervisorService,
    private readonly router: Router,
    private readonly formBuilder: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.loading$ = this.supervisorService.loading$;
    this.loadSupervisors();
    this.selectedProfile = this.formBuilder.control('ALL', Validators.required);
    this.searchTerm = this.formBuilder.control('');
    this.supervisors$ = this.supervisorService.pagedData$;
  }

  /**
   * Charge la liste des superviseurs
   */
  private loadSupervisors(): void {
    this.supervisorService.getAllPaged().subscribe();
  }

  /**
   * Recherche de superviseurs
   */
  onSearch(): void {
    this.supervisorService.searchWithFilter(this.searchTerm.value, this.selectedProfile.value);
  }

  /**
   * Réinitialise les filtres
   */
  clearFilters(): void {
    this.searchTerm.setValue('');
    this.selectedProfile.setValue('ALL');
    this.loadSupervisors();
  }

  /**
   * Actualise la liste
   */
  refresh(): void {
    this.loadSupervisors();
  }

  /**
   * Navigue vers la page d'ajout
   */
  navigateToAdd(): void {
    this.router.navigate(['/settings/supervisors/add']);
  }
  /**
   * Navigue vers la page de modification du profil
   */
  changeProfile(supervisor: Supervisor): void {
    this.router.navigate(['/settings/supervisors/edit-profile', supervisor.id]);
  }
  /**
   * Supprime un superviseur
   */
  deleteSupervisor(supervisor: Supervisor): void {
    const confirmMsg = `Êtes-vous sûr de vouloir supprimer le superviseur "${supervisor.firstname} ${supervisor.lastname}" ?`;

    if (confirm(confirmMsg)) {
      this.supervisorService.delete(supervisor.id!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadSupervisors();
            console.log('Superviseur supprimé avec succès');
          },
          error: (error) => {
            console.error('Erreur lors de la suppression:', error);
          }
        });
    }
  }

  /**
   * Désactive/Active un superviseur
   */
  // toggleSupervisorStatus(supervisor: Supervisor): void {
  //   const action = supervisor.id ? 'désactiver' : 'activer';
  //
  //   if (confirm(`Voulez-vous vraiment ${action} ce superviseur ?`)) {
  //     this.supervisorService.toggleStatus(supervisor.id!)
  //       .pipe(takeUntil(this.destroy$))
  //       .subscribe({
  //         next: () => {
  //           this.loadSupervisors();
  //           console.log(`Superviseur ${action} avec succès`);
  //         },
  //         error: (error) => {
  //           console.error(`Erreur lors de l'${action}ion:`, error);
  //         }
  //       });
  //   }
  // }

  /**
   * Navigation pagination
   */
  nextPage(): void {
    this.supervisorService.loadNextData();
  }

  previousPage(): void {
    this.supervisorService.loadPreviousData();
  }

  /**
   * Obtient le libellé du profil
   */
  getProfileLabel(profile: SupervisorProfile): string {
    const labels: Partial<Record<SupervisorProfile, string>> = {
      [SupervisorProfile.ADMINISTRATOR]: 'Administrateur',
      [SupervisorProfile.SUPERVISOR]: 'Superviseur',
    };
    return labels[profile] || profile;
  }

  /**
   * Obtient la classe CSS du badge de profil
   */
  getProfileClass(profile: SupervisorProfile): string {
    const classes: Partial<Record<SupervisorProfile, string>> = {
      [SupervisorProfile.ADMINISTRATOR]: 'admin',
      [SupervisorProfile.SUPERVISOR]: 'supervisor',
    };
    return classes[profile] || 'default';
  }

  /**
   * Obtient l'icône du profil
   */
  getProfileIcon(profile: SupervisorProfile): string {
    const icons: Partial<Record<SupervisorProfile, string>> = {
      [SupervisorProfile.ADMINISTRATOR]: 'shield',
      [SupervisorProfile.SUPERVISOR]: 'supervised_user_circle',
    };
    return icons[profile] || 'person';
  }

  /**
   * Formate le nom complet
   */
  getFullName(supervisor: Supervisor): string {
    return `${supervisor.firstname} ${supervisor.lastname}`;
  }

  protected readonly Math = Math;
}
