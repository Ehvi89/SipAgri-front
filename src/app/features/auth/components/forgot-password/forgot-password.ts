import {Component, OnInit, OnDestroy, ChangeDetectorRef} from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { NotificationService } from '../../../../core/services/notification-service';
import { Router } from '@angular/router';
import {SAError} from '../../../../core/services/error-service';
import {ResetMethod} from '../../enums/reset-password-method-enum';

export interface ResetPasswordRequest {
  field: string;
  method: ResetMethod;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
  resetToken?: string;
}

@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPassword implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  loading$!: Observable<boolean>;
  fpForm!: FormGroup;

  // Form controls
  telCtrl!: FormControl;
  emailCtrl!: FormControl;

  // UI state
  selectedMethod: ResetMethod = 'EMAIL';
  isSubmitted = false;
  showSuccessMessage = false;
  successMessage = '';

  // Available methods
  readonly availableMethods: { value: ResetMethod; label: string; icon: string }[] = [
    { value: 'EMAIL', label: 'Email', icon: 'mail' },
    { value: 'SMS', label: 'SMS', icon: 'sms' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.initializeFormControls();
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loading$ = this.authService.loading;
    this.setupFormValidation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeFormControls(): void {
    this.emailCtrl = this.formBuilder.control('', [
      Validators.required,
      Validators.email,
      this.customEmailValidator
    ]);

    this.telCtrl = this.formBuilder.control('', [
      Validators.required,
      Validators.pattern(/^[+]?[(]?[+]?\d{2,3}[)]?[-\s.]?\d{2,3}[-\s.]?\d{2,3}[-\s.]?\d{2,6}$/),
      this.phoneValidator
    ]);
  }

  private initializeForm(): void {
    this.fpForm = this.formBuilder.group({
      field: ['', Validators.required],
      method: [this.selectedMethod, Validators.required]
    });
  }

  private setupFormValidation(): void {
    // Validation en temps réel pour l'email
    this.emailCtrl.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      if (this.selectedMethod === 'EMAIL') {
        this.updateFieldValue();
      }
    });

    // Validation en temps réel pour le téléphone
    this.telCtrl.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      if (this.selectedMethod === 'SMS') {
        this.updateFieldValue();
      }
    });
  }

  // Validateurs personnalisés
  private customEmailValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(control.value) ? null : { invalidEmail: true };
  }

  private phoneValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const phoneValue = control.value.replace(/[\s\-()]/g, '');

    // Vérifier la longueur
    if (phoneValue.length < 8 || phoneValue.length > 15) {
      return { invalidPhoneLength: true };
    }

    // Format français
    const frenchPhoneRegex = /^(?:\+33|0)[1-9][0-9]{8}$/;
    if (!frenchPhoneRegex.test(phoneValue.replace(/[\s\-()]/g, ''))) {
      return { invalidPhoneFormat: true };
    }

    return null;
  }

  // Gestion des méthodes
  selectMethod(method: ResetMethod): void {
    if (this.selectedMethod !== method) {
      this.selectedMethod = method;
      this.fpForm.patchValue({ method });
      this.updateFieldValue();
      this.clearValidationErrors();
      this.cdr.detectChanges();
    }
  }

  private updateFieldValue(): void {
    if (this.selectedMethod === 'EMAIL') {
      this.fpForm.patchValue({ field: this.emailCtrl.value || '' });
    } else if (this.selectedMethod === 'SMS') {
      this.fpForm.patchValue({ field: this.telCtrl.value || '' });
    }
  }

  private clearValidationErrors(): void {
    this.emailCtrl.setErrors(null);
    this.telCtrl.setErrors(null);
    this.isSubmitted = false;
  }

  // Gestion des messages d'erreur
  getFieldErrorMessage(): string {
    const currentControl = this.getCurrentControl();

    if (!currentControl || !currentControl.errors || !currentControl.touched) {
      return '';
    }

    const errors = currentControl.errors;

    if (this.selectedMethod === 'EMAIL') {
      if (errors['required']) return 'L\'email est requis';
      if (errors['email'] || errors['invalidEmail']) return 'Format d\'email invalide';
    } else {
      if (errors['required']) return 'Le numéro de téléphone est requis';
      if (errors['pattern'] || errors['invalidPhoneFormat']) return 'Format de téléphone invalide';
      if (errors['invalidPhoneLength']) return 'Le numéro doit contenir entre 8 et 15 chiffres';
    }

    return 'Ce champ contient une erreur';
  }

  // Soumission du formulaire
  sendInstructions() {
    this.isSubmitted = true;
    this.updateFieldValue();

    // Validation du contrôle actuel
    const currentControl = this.getCurrentControl();
    currentControl.markAsTouched();

    if (currentControl.invalid) {
      this.focusInvalidField();
      return;
    }

    const requestData: ResetPasswordRequest = {
      field: this.normalizeFieldValue(currentControl.value),
      method: this.selectedMethod
    };

    if (this.selectedMethod == "SMS") {
      this.notificationService.comingSoon();
    } else {
      this.authService.resetPassword(requestData).subscribe({
        next: (response) => this.handleSuccess(response),
        error: error => this.handleError(error)
      })
    }
  }

  private normalizeFieldValue(value: string): string {
    if (this.selectedMethod === 'EMAIL') {
      return value.trim().toLowerCase();
    } else {
      // Normaliser le numéro de téléphone
      return value.replace(/[\s\-()]/g, '');
    }
  }

  private handleSuccess(response: ResetPasswordResponse): void {
    this.successMessage = response.message || 'Instructions envoyées avec succès!';
    this.notificationService.showSuccess(this.successMessage);
  }

  private handleError(error: SAError): void {
    let errorMessage = 'Erreur lors de l\'envoi des instructions';

    if (error.statusCode === 404) {
      errorMessage = this.selectedMethod === 'EMAIL'
        ? 'Aucun compte trouvé avec cet email'
        : 'Aucun compte trouvé avec ce numéro de téléphone';
    } else if (error.statusCode === 429) {
      errorMessage = 'Trop de tentatives. Veuillez patienter avant de réessayer';
    } else if (error.statusCode === 400) {
      errorMessage = 'Données invalides';
    } else if (error.message) {
      errorMessage = error.message;
    }

    this.notificationService.showError(errorMessage);
  }

  private focusInvalidField(): void {
    const fieldName = this.selectedMethod === 'EMAIL' ? 'email' : 'tel';
    const element = document.querySelector(`input[name="${fieldName}"]`) as HTMLElement;
    element?.focus();
  }

  // Getters pour le template
  get isFormValid(): boolean {
    return this.getCurrentControl().valid;
  }

  get currentFieldPlaceholder(): string {
    return this.selectedMethod === 'EMAIL'
      ? 'votre@email.com'
      : '+225 XX XX XX XX XX';
  }

  get isLoading(): Observable<boolean> {
    return this.loading$;
  }

  // Méthode pour le template — accès au contrôle actuel
  getCurrentControl(): FormControl {
    return this.selectedMethod === 'EMAIL' ? this.emailCtrl : this.telCtrl;
  }

  // Méthodes utilitaires
  isMethodSelected(method: ResetMethod): boolean {
    return this.selectedMethod === method;
  }
}
