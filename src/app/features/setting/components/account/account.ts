import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {FormBuilder, FormControl, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {Supervisor} from '../../../../core/models/supervisor-model';
import {AuthService} from "../../../auth/services/auth-service";
import {RegisterService} from '../../../auth/services/register-service';
import { SupervisorService } from "../../modules/supervisor/services/supervisor-service";

@Component({
  selector: 'app-account',
  standalone: false,
  templateUrl: './account.html',
  styleUrl: './account.scss'
})
export class Account implements OnInit {
  editModePersonal: boolean = false;
  editModeLogin: boolean = false;
  loading$!: Observable<boolean>;
  loadingPersonal: boolean = false;
  loadingLogin: boolean = false;

  // Form Controls
  firstnameCtrl!: FormControl<string | null>;
  lastnameCtrl!: FormControl<string | null>;
  emailCtrl!: FormControl;
  phoneCtrl!: FormControl<string | null>;
  currentPasswordCtrl!: FormControl<string | null>;
  newPasswordCtrl!: FormControl<string | null>;
  confirmPasswordCtrl!: FormControl<string | null>;

  personalInfoForm!: FormGroup;
  loginForm!: FormGroup;

  // Current user
  supervisor!: Supervisor;

  constructor(
    private supervisorService: SupervisorService,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private registerService: RegisterService,
  ) {}

  ngOnInit(): void {
    this.loading$ = this.supervisorService.loading$;
    this.supervisor = AuthService.getCurrentUser();

    this.initializeForms();
  }

  private initializeForms(): void {
    // Personal Info Form
    this.firstnameCtrl = this.formBuilder.control(
      { value: this.supervisor.firstname, disabled: true },
      Validators.required
    );
    this.lastnameCtrl = this.formBuilder.control(
      { value: this.supervisor.lastname, disabled: true },
      Validators.required
    );
    this.phoneCtrl = this.formBuilder.control(
      { value: this.supervisor.phone, disabled: true },
      [Validators.required, Validators.pattern(/^[0-9]{10}$/)]
    );

    this.personalInfoForm = this.formBuilder.group({
      firstname: this.firstnameCtrl,
      lastname: this.lastnameCtrl,
      phone: this.phoneCtrl,
    });

    // Login Form
    this.emailCtrl = this.formBuilder.control(
      { value: this.supervisor.email, disabled: true },
      [Validators.required, Validators.email]
    );
    this.currentPasswordCtrl = this.formBuilder.control(
      { value: null, disabled: true },
      Validators.required
    );
    this.newPasswordCtrl = this.formBuilder.control(
      { value: null, disabled: true },
      [Validators.required, this.registerService.passwordStrengthValidator]
    );
    this.confirmPasswordCtrl = this.formBuilder.control(
      { value: null, disabled: true },
      Validators.required
    );

    this.loginForm = this.formBuilder.group({
      email: this.emailCtrl,
      currentPassword: this.currentPasswordCtrl,
      newPassword: this.newPasswordCtrl,
      confirmPassword: this.confirmPasswordCtrl,
    }, { validators: this.passwordMatchValidator });
  }

  // Custom validator pour vérifier que les mots de passe correspondent
  private passwordMatchValidator(group: FormGroup): ValidationErrors | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      // Définir l'erreur sur le contrôle confirmPassword
      group.get('confirmPassword')?.setErrors({ 'passwordMismatch': true });
      return { 'passwordMismatch': true };
    } else {
      // Nettoyer l'erreur si les mots de passe correspondent
      if (group.get('confirmPassword')?.errors?.['passwordMismatch']) {
        const errors = { ...group.get('confirmPassword')?.errors };
        delete errors['passwordMismatch'];
        group.get('confirmPassword')?.setErrors(Object.keys(errors).length ? errors : null);
      }
    }
    return null;
  }

  // Toggle edit mode for personal info
  toggleEditPersonal(): void {
    this.editModePersonal = !this.editModePersonal;

    if (this.editModePersonal) {
      this.personalInfoForm.enable();
    } else {
      this.personalInfoForm.disable();
      this.resetPersonalForm();
    }
  }

  // Toggle edit mode for login info
  toggleEditLogin(): void {
    this.editModeLogin = !this.editModeLogin;

    if (this.editModeLogin) {
      this.emailCtrl.enable();
      this.currentPasswordCtrl.enable();
      this.newPasswordCtrl.enable();
      this.confirmPasswordCtrl.enable();
    } else {
      this.loginForm.disable();
      this.resetLoginForm();
    }
  }

  // Save personal information
  savePersonalInfo(): void {
    if (this.personalInfoForm.invalid) {
      this.personalInfoForm.markAllAsTouched();
      return;
    }

    this.loadingPersonal = true;
    const updatedInfo = this.personalInfoForm.value;

    this.supervisorService.partialUpdate(this.supervisor.id!, updatedInfo).subscribe({
      next: (response) => {
        this.supervisor = response;
        this.authService.updateCurrentUser(response);
        this.loadingPersonal = false;
        this.editModePersonal = false;
        this.personalInfoForm.disable();
        // Afficher un message de succès
        console.log('Informations personnelles mises à jour avec succès');
      },
      error: (error) => {
        this.loadingPersonal = false;
        console.error('Erreur lors de la mise à jour:', error);
        // Afficher un message d'erreur
      }
    });
  }

  // Save login information
  saveLoginInfo(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loadingLogin = true;
    const loginData = {
      email: this.emailCtrl.value,
      currentPassword: this.currentPasswordCtrl.value,
      newPassword: this.newPasswordCtrl.value
    };

    if (this.newPasswordCtrl.value) {
      this.authService.changePassword(this.newPasswordCtrl.value!).subscribe();
    }
    if (this.emailCtrl.value && this.emailCtrl.value !== this.supervisor.email) {
      this.supervisorService.partialUpdate(this.supervisor.id!, loginData).subscribe({
        next: (response) => {
          this.supervisor.email = response.email!;
          this.authService.updateCurrentUser(response);
          this.loadingLogin = false;
          this.editModeLogin = false;
          this.loginForm.disable();
          this.resetLoginForm();
          // Afficher un message de succès
          console.log('Informations de connexion mises à jour avec succès');
        },
        error: (error) => {
          this.loadingLogin = false;
          console.error('Erreur lors de la mise à jour:', error);
          // Afficher un message d'erreur
        }
      });
    }
  }

  // Reset personal info form
  private resetPersonalForm(): void {
    this.firstnameCtrl.setValue(this.supervisor.firstname);
    this.lastnameCtrl.setValue(this.supervisor.lastname);
    this.phoneCtrl.setValue(this.supervisor.phone);
    this.personalInfoForm.markAsUntouched();
  }

  // Reset login form
  private resetLoginForm(): void {
    this.emailCtrl.setValue(this.supervisor.email);
    this.currentPasswordCtrl.setValue(null);
    this.newPasswordCtrl.setValue(null);
    this.confirmPasswordCtrl.setValue(null);
    this.loginForm.markAsUntouched();
  }

  // Getters for error handling
  get firstnameError(): string {
    if (this.firstnameCtrl.hasError('required')) {
      return 'Le prénom est requis';
    }
    return '';
  }

  get lastnameError(): string {
    if (this.lastnameCtrl.hasError('required')) {
      return 'Le nom est requis';
    }
    return '';
  }

  get phoneError(): string {
    if (this.phoneCtrl.hasError('required')) {
      return 'Le téléphone est requis';
    }
    if (this.phoneCtrl.hasError('pattern')) {
      return 'Format de téléphone invalide (10 chiffres)';
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

  get currentPasswordError(): string {
    if (this.currentPasswordCtrl.hasError('required')) {
      return 'Le mot de passe actuel est requis';
    }
    return '';
  }

  get newPasswordError(): string {
    if (this.newPasswordCtrl.hasError('required')) {
      return 'Le nouveau mot de passe est requis';
    }
    if (this.newPasswordCtrl.hasError('required')) return 'Le mot de passe est requis';
    if (this.newPasswordCtrl.hasError('minlength')) return 'Minimum 8 caractères requis';
    if (this.newPasswordCtrl.hasError('noLowercase')) return 'Au moins une minuscule requise';
    if (this.newPasswordCtrl.hasError('noUppercase')) return 'Au moins une majuscule requise';
    if (this.newPasswordCtrl.hasError('noNumber')) return 'Au moins un chiffre requis';
    if (this.newPasswordCtrl.hasError('noSpecialChar')) return 'Au moins un caractère spécial requis';
    return '';
  }

  get confirmPasswordError(): string {
    if (this.confirmPasswordCtrl.hasError('required')) {
      return 'La confirmation du mot de passe est requise';
    }
    // Vérifier l'erreur directement sur le contrôle
    if (this.confirmPasswordCtrl.hasError('passwordMismatch')) {
      return 'Les mots de passe ne correspondent pas';
    }
    return '';
  }
}
