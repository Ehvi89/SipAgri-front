import {Component, OnInit} from '@angular/core';
import { SupervisorProfile } from "../../../../../../core/enums/supervisor-profile";
import {Observable, Subject, takeUntil} from 'rxjs';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {SupervisorService} from '../../services/supervisor-service';
import {Supervisor} from '../../../../../../core/models/supervisor-model';
import { NotificationService } from "../../../../../../core/services/notification-service";

@Component({
  selector: 'app-edit-supervisor',
  standalone: false,
  templateUrl: './edit-supervisor.html',
  styleUrl: './edit-supervisor.scss'
})
export class EditSupervisor implements OnInit{
  loading$!: Observable<boolean>;

  private destroy$ = new Subject<void>();

  // Form control
  profileCtrl!: FormControl<SupervisorProfile | null>;
  profileForm!: FormGroup;

  // Données du superviseur
  supervisorId: number | null = null;
  supervisor: Supervisor | null = null;
  previousProfile: SupervisorProfile | null = null;

  // Enum et données
  SupervisorProfile = SupervisorProfile;
  profiles = Object.values(SupervisorProfile);

  constructor(
    private supervisorService: SupervisorService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private notifService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loading$ = this.supervisorService.loading$;
    this.initializeForm();
    this.loadSupervisor();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialise le formulaire
   */
  private initializeForm(): void {
    this.profileCtrl = this.formBuilder.control(null, [
      Validators.required
    ]);

    this.profileForm = this.formBuilder.group({
      profile: this.profileCtrl
    });
  }

  /**
   * Charge les données du superviseur
   */
  private loadSupervisor(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.router.navigate(['/settings/supervisors']);
      return;
    }

    this.supervisorId = parseInt(id);

    this.supervisorService.getById(this.supervisorId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (supervisor) => {
          this.supervisor = supervisor;
          this.previousProfile = supervisor.profile;
          this.profileCtrl.setValue(supervisor.profile);
        },
        error: (error) => {
          console.error('Erreur lors du chargement du superviseur:', error);
          this.notifService.showError('Erreur lors du chargement du superviseur');
          this.router.navigate(['/settings/supervisors']);
        }
      });
  }

  /**
   * Change le profil du superviseur
   */
  onSubmit(): void {
    if (this.profileForm.invalid || !this.supervisorId) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const newProfile = this.profileCtrl.value!;

    // Vérifie si le profil a changé
    if (newProfile === this.previousProfile) {
      alert('Le profil sélectionné est identique au profil actuel');
      return;
    }

    const confirmMsg = `Êtes-vous sûr de vouloir changer le profil de "${this.getFullName()}" de "${this.getProfileLabel(this.previousProfile!)}" vers "${this.getProfileLabel(newProfile)}" ?`;

    if (!confirm(confirmMsg)) {
      return;
    }
    const newSupervisor = { ...this.supervisor!, profile: newProfile}
    this.supervisorService.partialUpdate(this.supervisorId, newSupervisor)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notifService.showSuccess('Profil modifié avec succès');
          this.router.navigate(['/settings/supervisors']);
        },
        error: (error) => {
          console.error('Erreur lors du changement de profil:', error);
          this.notifService.showError('Erreur lors du changement de profil');
        }
      });
  }

  /**
   * Annule et retourne à la liste
   */
  cancel(): void {
    this.router.navigate(['/settings/supervisors']);
  }

  /**
   * Obtient le nom complet
   */
  getFullName(): string {
    if (!this.supervisor) return '';
    return `${this.supervisor.firstname} ${this.supervisor.lastname}`;
  }

  /**
   * Obtient le libellé du profil
   */
  getProfileLabel(profile: SupervisorProfile): string {
    const labels: Record<SupervisorProfile, string> = {
      [SupervisorProfile.ADMINISTRATOR]: 'Administrateur',
      [SupervisorProfile.SUPERVISOR]: 'Superviseur',
    };
    return labels[profile] || profile;
  }

  /**
   * Obtient l'icône du profil
   */
  getProfileIcon(profile: SupervisorProfile): string {
    const icons: Record<SupervisorProfile, string> = {
      [SupervisorProfile.ADMINISTRATOR]: 'shield',
      [SupervisorProfile.SUPERVISOR]: 'supervised_user_circle',
    };
    return icons[profile] || 'person';
  }

  /**
   * Obtient la description du profil
   */
  getProfileDescription(profile: SupervisorProfile): string {
    const descriptions: Record<SupervisorProfile, string> = {
      [SupervisorProfile.ADMINISTRATOR]: 'Accès complet à toutes les fonctionnalités du système. Peut gérer tous les superviseurs et paramètres.',
      [SupervisorProfile.SUPERVISOR]: 'Supervision et suivi des activités quotidiennes. Accès limité aux fonctions de base.',
    };
    return descriptions[profile] || '';
  }

  /**
   * Obtient la couleur du profil
   */
  getProfileColor(profile: SupervisorProfile): string {
    const colors: Record<SupervisorProfile, string> = {
      [SupervisorProfile.ADMINISTRATOR]: '#f39c12',
      [SupervisorProfile.SUPERVISOR]: '#2f8f4e',
    };
    return colors[profile] || '#666';
  }

  /**
   * Obtient les permissions du profil
   */
  getProfilePermissions(profile: SupervisorProfile): string[] {
    const permissions: Record<SupervisorProfile, string[]> = {
      [SupervisorProfile.ADMINISTRATOR]: [
        'Gestion complète des utilisateurs',
        'Configuration système',
        'Accès aux rapports avancés',
        'Gestion des paramètres de sécurité',
        'Toutes les permissions'
      ],
      [SupervisorProfile.SUPERVISOR]: [
        'Consultation des données',
        'Suivi des activités',
        'Création de rapports simples',
        'Modification limitée'
      ],
    };
    return permissions[profile] || [];
  }

  /**
   * Vérifie si le profil est un downgrade
   */
  isDowngrade(): boolean {
    if (!this.previousProfile || !this.profileCtrl.value) return false;

    const hierarchy = {
      [SupervisorProfile.ADMINISTRATOR]: 4,
      [SupervisorProfile.SUPERVISOR]: 2,
    };

    return hierarchy[this.profileCtrl.value] < hierarchy[this.previousProfile];
  }

  /**
   * Getter pour les erreurs de validation
   */
  get profileError(): string {
    if (this.profileCtrl.hasError('required')) {
      return 'Le profil est requis';
    }
    return '';
  }
}
