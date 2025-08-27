import { Component, OnInit, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import {delay, Observable, Subject, takeUntil} from 'rxjs';
import { AuthService } from '../../services/auth-service';
import { RegisterService } from '../../services/register-service';
import {NotificationService} from '../../../../core/services/notification-service';
import {SAError} from '../../../../core/services/error-service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: false,
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.scss']
})
export class ResetPassword implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  loading$!: Observable<boolean>;
  pwdForm!: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  passwordStrength = { score: 0, label: 'Faible', color: 'red' };

  get passwordCtrl(): FormControl {
    return this.pwdForm.get('password') as FormControl;
  }

  get confirmPasswordCtrl(): FormControl {
    return this.pwdForm.get('confirmPassword') as FormControl;
  }

  constructor(
    private authService: AuthService,
    private registerService: RegisterService,
    private formBuilder: FormBuilder,
    private notifService: NotificationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loading$ = this.authService.loading;
    this.initForm();
    this.setupFormValidation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.pwdForm = this.formBuilder.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordStrengthValidator
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  private setupFormValidation(): void {
    // Validation en temps réel pour le mot de passe
    this.passwordCtrl.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe((value: string) => {
      if (value) {
        this.registerService.validatePasswordRegEx(value);
        // Re-valider la confirmation si elle existe
        if (this.confirmPasswordCtrl.value) {
          this.confirmPasswordCtrl.updateValueAndValidity();
        }
        this.passwordStrength = this.registerService.calculatePasswordStrength(value);
      } else {
        this.passwordStrength = { score: 0, label: 'Faible', color: 'red' };
      }
    });

    // Validation pour la confirmation du mot de passe
    this.confirmPasswordCtrl.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      if (this.pwdForm.errors?.['passwordMismatch']) {
        this.pwdForm.updateValueAndValidity();
      }
    });
  }

  private passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const password = control.value;
    const errors: ValidationErrors = {};

    // Au moins une minuscule
    if (!/[a-z]/.test(password)) {
      errors['noLowercase'] = true;
    }

    // Au moins une majuscule
    if (!/[A-Z]/.test(password)) {
      errors['noUppercase'] = true;
    }

    // Au moins un chiffre
    if (!/[0-9]/.test(password)) {
      errors['noNumber'] = true;
    }

    // Au moins un caractère spécial
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors['noSpecialChar'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    return password && confirmPassword && password === confirmPassword ?
      null : { passwordMismatch: true };
  }

  getPasswordErrorMessage(): string {
    if (this.passwordCtrl.hasError('required')) {
      return 'Le mot de passe est requis';
    }
    if (this.passwordCtrl.hasError('minlength')) {
      return 'Minimum 8 caractères requis';
    }
    if (this.passwordCtrl.hasError('noLowercase')) {
      return 'Au moins une minuscule requise';
    }
    if (this.passwordCtrl.hasError('noUppercase')) {
      return 'Au moins une majuscule requise';
    }
    if (this.passwordCtrl.hasError('noNumber')) {
      return 'Au moins un chiffre requis';
    }
    if (this.passwordCtrl.hasError('noSpecialChar')) {
      return 'Au moins un caractère spécial requis';
    }
    return '';
  }

  getConfirmPasswordErrorMessage(): string {
    if (this.confirmPasswordCtrl.hasError('required')) {
      return 'Veuillez confirmer le mot de passe';
    }
    if (this.pwdForm.errors?.['passwordMismatch'] &&
      (this.confirmPasswordCtrl.touched || this.confirmPasswordCtrl.dirty)) {
      return 'Les mots de passe ne correspondent pas'
    }
    return '';
  }

  onSubmit(): void {
    if (this.pwdForm.valid) {
      const password: string = this.passwordCtrl.value;
      // Appeler le service pour réinitialiser le mot de passe
      this.authService.changePassword(password).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.notifService.showSuccess("Mot de passe changé avec succès. Vous serez redirigé vers la page de connexion");
          delay(2000);
          this.router.navigateByUrl('/auth/login');
        },
        error: (error: SAError) => {
          if (error.statusCode === 401) {
            this.notifService.showError("votre lien a expiré");
          }
          else {
            this.notifService.showError(error.message ?? "Une erreur s'est produite, veuillez réessey plus tard")
          }
        }
      });
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      this.markFormGroupTouched(this.pwdForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
