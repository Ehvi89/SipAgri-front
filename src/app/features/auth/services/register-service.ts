import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError, finalize } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { RegisterRepository } from '../repositories/auth-repository';
import {ErrorService} from '../../../core/services/error-service';

export interface RegisterCredential {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  createdAt: string;
  isVerified: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface EmailValidationResult extends ValidationResult {
  suggestions?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private readonly _loading = new BehaviorSubject<boolean>(false);
  private readonly _emailValidation = new BehaviorSubject<EmailValidationResult>({ isValid: true, errors: [] });
  private readonly _passwordValidation = new BehaviorSubject<ValidationResult>({ isValid: true, errors: [] });

  // Regex patterns
  private readonly EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  private readonly PASSWORD_MIN_LENGTH = 8;
  private readonly COMMON_EMAIL_DOMAINS = ['sipra.ci'];

  constructor(private registerRepository: RegisterRepository,
              private errorService: ErrorService) {}

  // Getters pour les observables
  get loading$(): Observable<boolean> {
    return this._loading.asObservable();
  }

  get emailValidation$(): Observable<EmailValidationResult> {
    return this._emailValidation.asObservable();
  }

  get passwordValidation$(): Observable<ValidationResult> {
    return this._passwordValidation.asObservable();
  }

  /**
   * Inscrit un nouvel utilisateur
   */
  register(credentials: RegisterCredential): Observable<RegisterResponse> {
    // Validation des credentials
    const validationError = this.validateCredentials(credentials);
    if (validationError) {
      return throwError(() => new Error(validationError));
    }

    // Normalisation des données
    const normalizedCredentials = this.normalizeCredentials(credentials);

    this.setLoading(true);

    return this.registerRepository.register(normalizedCredentials).pipe(
      map((response: any) => this.transformRegisterResponse(response)),
      tap((response) => {
        console.log('Inscription réussie:', response.id);
      }),
      catchError((error) => {
        return throwError(() => this.errorService.handleError(error))
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Valide l'email avec regex et suggestions
   */
  validateEmailRegEx(email: string): void {
    if (!email) {
      this._emailValidation.next({ isValid: true, errors: [] });
      return;
    }

    const errors: string[] = [];
    const suggestions: string[] = [];

    // Validation format
    if (!this.EMAIL_REGEX.test(email)) {
      errors.push('Format d\'email invalide');
    }

    // Vérification de la longueur
    if (email.length > 254) {
      errors.push('Email trop long (maximum 254 caractères)');
    }

    // Suggestions pour les fautes de frappe courantes
    const emailSuggestions = this.generateEmailSuggestions(email);
    if (emailSuggestions.length > 0) {
      suggestions.push(...emailSuggestions);
    }

    this._emailValidation.next({
      isValid: errors.length === 0,
      errors,
      suggestions: suggestions.length > 0 ? suggestions : undefined
    });
  }

  /**
   * Valide le mot de passe selon les critères de sécurité
   */
  validatePasswordRegEx(password: string): void {
    if (!password) {
      this._passwordValidation.next({ isValid: true, errors: [] });
      return;
    }

    const errors: string[] = [];

    // Longueur minimale
    if (password.length < this.PASSWORD_MIN_LENGTH) {
      errors.push(`Minimum ${this.PASSWORD_MIN_LENGTH} caractères requis`);
    }

    // Au moins une minuscule
    if (!/[a-z]/.test(password)) {
      errors.push('Au moins une lettre minuscule requise');
    }

    // Au moins une majuscule
    if (!/[A-Z]/.test(password)) {
      errors.push('Au moins une lettre majuscule requise');
    }

    // Au moins un chiffre
    if (!/[0-9]/.test(password)) {
      errors.push('Au moins un chiffre requis');
    }

    // Au moins un caractère spécial
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Au moins un caractère spécial requis (!@#$%^&*(),.?":{}|<>)');
    }

    // Vérification contre les mots de passe communs
    if (this.isCommonPassword(password)) {
      errors.push('Ce mot de passe est trop commun');
    }

    this._passwordValidation.next({
      isValid: errors.length === 0,
      errors
    });
  }

  /**
   * Vérifie si l'email existe déjà
   */
  checkEmailExists(email: string): Observable<boolean> {
    if (!email || !this.EMAIL_REGEX.test(email)) {
      return of(false);
    }

    return this.registerRepository.checkEmailExist(email).pipe(
      catchError((error) => {
        console.error('Erreur lors de la vérification email:', error);
        return of(false);
      })
    );
  }

  /**
   * Calcule la force du mot de passe
   */
  calculatePasswordStrength(password: string): { score: number; label: string; color: string } {
    if (!password) {
      return { score: 0, label: 'Aucun', color: 'red' };
    }

    let score = 0;
    const checks = [
      password.length >= 8,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /[0-9]/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password),
      password.length >= 12,
      !this.isCommonPassword(password)
    ];

    score = checks.filter(Boolean).length;

    if (score <= 2) return { score, label: 'Faible', color: 'red' };
    if (score <= 4) return { score, label: 'Moyen', color: 'orange' };
    if (score <= 5) return { score, label: 'Bon', color: 'blue' };
    return { score, label: 'Excellent', color: 'green' };
  }

  // Méthodes privées
  private setLoading(loading: boolean): void {
    this._loading.next(loading);
  }

  private validateCredentials(credentials: RegisterCredential): string | null {
    if (!credentials.firstname?.trim()) {
      return 'Le prénom est requis';
    }

    if (!credentials.lastname?.trim()) {
      return 'Le nom est requis';
    }

    if (!credentials.email?.trim()) {
      return 'L\'email est requis';
    }

    if (!credentials.password) {
      return 'Le mot de passe est requis';
    }

    if (!this.EMAIL_REGEX.test(credentials.email)) {
      return 'Format d\'email invalide';
    }

    if (credentials.password.length < this.PASSWORD_MIN_LENGTH) {
      return `Le mot de passe doit contenir au moins ${this.PASSWORD_MIN_LENGTH} caractères`;
    }

    return null;
  }

  private normalizeCredentials(credentials: RegisterCredential): RegisterCredential {
    return {
      firstname: this.normalizeString(credentials.firstname),
      lastname: this.normalizeString(credentials.lastname),
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password
    };
  }

  private normalizeString(str: string): string {
    return str.trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private transformRegisterResponse(response: any): RegisterResponse {
    return {
      id: response.id || response._id,
      firstname: response.firstname,
      lastname: response.lastname,
      email: response.email,
      createdAt: response.createdAt || new Date().toISOString(),
      isVerified: response.isVerified || false
    };
  }

  private transformError(error: any): Error {
    if (error.status === 409) {
      return new Error('Un compte existe déjà avec cet email');
    }
    if (error.status === 400) {
      return new Error('Données invalides');
    }
    if (error.status === 500) {
      return new Error('Erreur serveur, veuillez réessayer');
    }
    return new Error('Erreur inattendue lors de l\'inscription');
  }

  private generateEmailSuggestions(email: string): string[] {
    const suggestions: string[] = [];
    const [localPart, domain] = email.split('@');

    if (!domain) return suggestions;

    // Suggestions pour les domaines mal orthographiés
    const domainSuggestions: { [key: string]: string } = {
      'si': 'sipra.ci',
      'qip': 'gmail.com',
    };

    const suggestedDomain = domainSuggestions[domain.toLowerCase()];
    if (suggestedDomain) {
      suggestions.push(`${localPart}@${suggestedDomain}`);
    }

    return suggestions;
  }

  private isCommonPassword(password: string): boolean {
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey'
    ];
    return commonPasswords.includes(password.toLowerCase());
  }
}
