import {Component, OnInit} from '@angular/core';
import {Observable, Subject, takeUntil} from 'rxjs';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { SupervisorProfile } from "../../../../../../core/enums/supervisor-profile";
import {Supervisor} from '../../../../../../core/models/supervisor-model';
import {SupervisorService} from '../../services/supervisor-service';
import {ActivatedRoute, Router} from '@angular/router';
import { NotificationService } from "../../../../../../core/services/notification-service";
import {RegisterService} from '../../../../../auth/services/register-service';

@Component({
  selector: 'app-add-supervisor',
  standalone: false,
  templateUrl: './add-supervisor.html',
  styleUrl: './add-supervisor.scss'
})
export class AddSupervisor implements OnInit {
  loading$!: Observable<boolean>;

  private readonly destroy$ = new Subject<void>();

  // Form controls
  firstnameCtrl!: FormControl<string | null>;
  lastnameCtrl!: FormControl<string | null>;
  emailCtrl!: FormControl<string | null>;
  phoneCtrl!: FormControl<string | null>;
  profileCtrl!: FormControl<SupervisorProfile | null>;
  passwordCtrl!: FormControl<string | null>;
  confirmPasswordCtrl!: FormControl<string | null>;

  supervisorForm!: FormGroup;

  // Mode édition
  editMode: boolean = false;
  supervisorId: number | null = null;
  currentSupervisor: Supervisor | null = null;

  // Enum et données
  profiles = Object.values(SupervisorProfile);

  // Visibilité des mots de passe
  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;

  constructor(
    private readonly supervisorService: SupervisorService,
    private readonly formBuilder: FormBuilder,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly notifService: NotificationService,
    private readonly registerService: RegisterService
  ) {}

  ngOnInit(): void {
    this.loading$ = this.supervisorService.loading$;
    this.initializeForm();
    this.checkEditMode();
  }

  /**
   * Initialise le formulaire
   */
  private initializeForm(): void {
    this.firstnameCtrl = this.formBuilder.control('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50)
    ]);

    this.lastnameCtrl = this.formBuilder.control('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50)
    ]);

    this.emailCtrl = this.formBuilder.control('', [
      Validators.required,
      Validators.email
    ]);

    this.phoneCtrl = this.formBuilder.control('', [
      Validators.required,
      Validators.pattern(/^\d{10}$/)
    ]);

    this.profileCtrl = this.formBuilder.control(SupervisorProfile.SUPERVISOR, [
      Validators.required
    ]);

    this.passwordCtrl = this.formBuilder.control('', [
      Validators.required,
      Validators.minLength(8)
    ]);

    this.confirmPasswordCtrl = this.formBuilder.control('', [
      Validators.required
    ]);

    this.supervisorForm = this.formBuilder.group({
      firstname: this.firstnameCtrl,
      lastname: this.lastnameCtrl,
      email: this.emailCtrl,
      phone: this.phoneCtrl,
      profile: this.profileCtrl,
      password: this.passwordCtrl,
      confirmPassword: this.confirmPasswordCtrl
    }, { validators: this.passwordMatchValidator });
  }

  /**
   * Validateur personnalisé pour la correspondance des mots de passe
   */
  private passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  /**
   * Vérifie si on est en mode édition
   */
  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.supervisorId = Number.parseInt(id);
      this.editMode = true;
      this.loadSupervisor(this.supervisorId);

      // En mode édition, le mot de passe n'est pas obligatoire
      this.passwordCtrl.clearValidators();
      this.confirmPasswordCtrl.clearValidators();
      this.passwordCtrl.updateValueAndValidity();
      this.confirmPasswordCtrl.updateValueAndValidity();
    }
  }

  /**
   * Charge les données du superviseur à modifier
   */
  private loadSupervisor(id: number): void {
    this.supervisorService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (supervisor) => {
          this.currentSupervisor = supervisor;
          this.supervisorForm.patchValue({
            firstname: supervisor.firstname,
            lastname: supervisor.lastname,
            email: supervisor.email,
            phone: supervisor.phone,
            profile: supervisor.profile
          });
        },
        error: (error) => {
          console.error('Erreur lors du chargement du superviseur:', error);
          this.router.navigate(['/settings/supervisors']);
        }
      });
  }

  /**
   * Soumet le formulaire
   */
  onSubmit(): void {
    if (this.supervisorForm.invalid) {
      this.supervisorForm.markAllAsTouched();
      return;
    }

    const supervisorData: any = {
      firstname: this.firstnameCtrl.value!,
      lastname: this.lastnameCtrl.value!,
      email: this.emailCtrl.value!,
      phone: this.phoneCtrl.value!,
      profile: this.profileCtrl.value!
    };

    // Ajoute le mot de passe seulement s'il est renseigné
    if (this.passwordCtrl.value) {
      supervisorData.password = this.passwordCtrl.value;
    }

    const request$ = this.editMode && this.supervisorId
      ? this.supervisorService.update(this.supervisorId, supervisorData)
      : (this.registerService.register(supervisorData) as Observable<Supervisor>);

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.notifService.showSuccess(`Superviseur ${this.editMode ? 'modifié' : 'créé'} avec succès`);
        this.router.navigate(['/settings/supervisors']);
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
    if (this.supervisorForm.dirty) {
      if (confirm('Voulez-vous vraiment annuler ? Les modifications seront perdues.')) {
        this.router.navigate(['/settings/supervisors']);
      }
    } else {
      this.router.navigate(['/settings/supervisors']);
    }
  }

  /**
   * Réinitialise le formulaire
   */
  resetForm(): void {
    if (confirm('Voulez-vous vraiment réinitialiser le formulaire ?')) {
      if (this.editMode && this.currentSupervisor) {
        this.supervisorForm.reset(
          {
            firstname: this.currentSupervisor.firstname,
            lastname: this.currentSupervisor.lastname,
            email: this.currentSupervisor.email,
            phone: this.currentSupervisor.phone,
            profile: this.currentSupervisor.profile,
            password: '',
            confirmPassword: ''
          },
          { emitEvent: false }
        );
      } else {
        this.supervisorForm.reset(
          {
            firstname: '',
            lastname: '',
            email: '',
            phone: '',
            profile: SupervisorProfile.SUPERVISOR,
            password: '',
            confirmPassword: ''
          },
          { emitEvent: false }
        );
      }

      // Réinitialiser complètement le statut
      this.supervisorForm.markAsPristine();
      this.supervisorForm.markAsUntouched();

      // Nettoyer les erreurs de chaque control
      Object.keys(this.supervisorForm.controls).forEach(key => {
        const control = this.supervisorForm.get(key);
        control?.setErrors(null);
        control?.markAsUntouched();
        control?.markAsPristine();
      });
    }
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
      [SupervisorProfile.ADMINISTRATOR]: 'Accès complet à toutes les fonctionnalités',
      [SupervisorProfile.SUPERVISOR]: 'Supervision et suivi des activités',
    };
    return descriptions[profile] || '';
  }

  /**
   * Getters pour les erreurs de validation
   */
  get firstnameError(): string {
    if (this.firstnameCtrl.hasError('required')) {
      return 'Le prénom est requis';
    }
    if (this.firstnameCtrl.hasError('minlength')) {
      return 'Le prénom doit contenir au moins 2 caractères';
    }
    if (this.firstnameCtrl.hasError('maxlength')) {
      return 'Le prénom ne peut pas dépasser 50 caractères';
    }
    return '';
  }

  get lastnameError(): string {
    if (this.lastnameCtrl.hasError('required')) {
      return 'Le nom est requis';
    }
    if (this.lastnameCtrl.hasError('minlength')) {
      return 'Le nom doit contenir au moins 2 caractères';
    }
    if (this.lastnameCtrl.hasError('maxlength')) {
      return 'Le nom ne peut pas dépasser 50 caractères';
    }
    return '';
  }

  get emailError(): string {
    if (this.emailCtrl.hasError('required')) {
      return 'L\'email est requis';
    }
    if (this.emailCtrl.hasError('email')) {
      return 'Format d\'email invalide';
    }
    return '';
  }

  get phoneError(): string {
    if (this.phoneCtrl.hasError('required')) {
      return 'Le téléphone est requis';
    }
    if (this.phoneCtrl.hasError('pattern')) {
      return 'Format invalide (10 chiffres requis)';
    }
    return '';
  }

  get profileError(): string {
    if (this.profileCtrl.hasError('required')) {
      return 'Le profil est requis';
    }
    return '';
  }

  get passwordError(): string {
    if (this.passwordCtrl.hasError('required')) {
      return 'Le mot de passe est requis';
    }
    if (this.passwordCtrl.hasError('minlength')) {
      return 'Le mot de passe doit contenir au moins 8 caractères';
    }
    return '';
  }

  get confirmPasswordError(): string {
    if (this.confirmPasswordCtrl.hasError('required')) {
      return 'La confirmation du mot de passe est requise';
    }
    if (this.supervisorForm.hasError('passwordMismatch')) {
      return 'Les mots de passe ne correspondent pas';
    }
    return '';
  }
}
