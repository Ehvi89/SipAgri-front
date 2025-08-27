import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RegisterService, RegisterCredential } from '../../services/register-service';
import { Router } from '@angular/router';
import {NotificationService} from '../../../../core/services/notification-service';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  loading$!: Observable<boolean>;
  registerForm!: FormGroup;

  // Form controls individuels pour une meilleure gestion
  firstnameCtrl!: FormControl;
  lastnameCtrl!: FormControl;
  emailCtrl!: FormControl;
  passwordCtrl!: FormControl;
  confirmPasswordCtrl!: FormControl;
  passwordStrength!: {score: number, label: string, color: string}

  constructor(
    public registerService: RegisterService,
    private router: Router,
    private formBuilder: FormBuilder,
    private notifService: NotificationService
  ) {
    this.initializeFormControls();
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loading$ = this.registerService.loading$;
    this.setupFormValidation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeFormControls(): void {
    this.firstnameCtrl = this.formBuilder.control('', [
      Validators.required,
      Validators.minLength(2),
      Validators.pattern(/^[a-zA-ZÀ-ÿ\s'-]+$/)
    ]);

    this.lastnameCtrl = this.formBuilder.control('', [
      Validators.required,
      Validators.minLength(2),
      Validators.pattern(/^[a-zA-ZÀ-ÿ\s'-]+$/)
    ]);

    this.emailCtrl = this.formBuilder.control('', [
      Validators.required,
      Validators.email,
      this.customEmailValidator
    ]);

    this.passwordCtrl = this.formBuilder.control('', [
      Validators.required,
      Validators.minLength(8),
      this.passwordStrengthValidator
    ]);

    this.confirmPasswordCtrl = this.formBuilder.control('', [
      Validators.required
    ]);
  }

  private initializeForm(): void {
    this.registerForm = this.formBuilder.group({
      firstname: this.firstnameCtrl,
      lastname: this.lastnameCtrl,
      email: this.emailCtrl,
      password: this.passwordCtrl,
      confirmPassword: this.confirmPasswordCtrl
    }, {
      validators: this.passwordMatchValidator
    });
  }

  private setupFormValidation(): void {
    // Validation en temps réel pour l'email
    this.emailCtrl.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe((value: string) => {
      if (value) {
        this.registerService.validateEmailRegEx(value);
      }
    });

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
      }
    });

    // Validation pour la confirmation du mot de passe
    this.confirmPasswordCtrl.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.registerForm.updateValueAndValidity();
    });
  }

  // Validateurs personnalisés
  private customEmailValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(control.value) ? null : { invalidEmail: true };
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

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  // Méthodes pour obtenir les messages d'erreur
  getFieldErrorMessage(controlName: string): string {
    const control = this.registerForm.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors;

    switch (controlName) {
      case 'firstname':
      case 'lastname':
        if (errors['required']) return 'Ce champ est requis';
        if (errors['minlength']) return 'Minimum 2 caractères requis';
        if (errors['pattern']) return 'Caractères invalides détectés';
        break;

      case 'email':
        if (errors['required']) return 'L\'email est requis';
        if (errors['email'] || errors['invalidEmail']) return 'Format d\'email invalide';
        break;

      case 'password':
        if (errors['required']) return 'Le mot de passe est requis';
        if (errors['minlength']) return 'Minimum 8 caractères requis';
        if (errors['noLowercase']) return 'Au moins une minuscule requise';
        if (errors['noUppercase']) return 'Au moins une majuscule requise';
        if (errors['noNumber']) return 'Au moins un chiffre requis';
        if (errors['noSpecialChar']) return 'Au moins un caractère spécial requis';
        break;

      case 'confirmPassword':
        if (errors['required']) return 'Veuillez confirmer le mot de passe';
        break;
    }

    return '';
  }

  getFormErrorMessage(): string {
    if (this.registerForm.errors?.['passwordMismatch']) {
      return 'Les mots de passe ne correspondent pas';
    }
    return '';
  }

  // Actions du formulaire
  register() {
    if (this.registerForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    const formValue = this.registerForm.value;
    const credentials: RegisterCredential = {
      firstname: formValue.firstname.trim(),
      lastname: formValue.lastname.trim(),
      email: formValue.email.trim().toLowerCase(),
      password: formValue.password
    };

    this.registerService.register(credentials).subscribe({
      next: () => {
        this.router.navigateByUrl('/auth/login');
        this.notifService.showSuccess("Votre compte a été créer avec success")
      },
      error: (error) => {
        this.handleRegistrationError(error);
        this.notifService.showError(error.message);
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  // Méthodes utilitaires privées
  private markAllFieldsAsTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  private handleRegistrationError(error: any): void {
    // Logique de gestion des erreurs spécifique
    // Pourrait afficher un toast, un modal, etc.
    if (error.status === 409) {
      this.emailCtrl.setErrors({ emailExists: true });
    } else if (error.status === 400) {
      // Erreur de validation du serveur
    } else {
      // Erreur générique
    }
  }

  // Getters pour le template
  get isFormValid(): boolean {
    return this.registerForm.valid;
  }
}
