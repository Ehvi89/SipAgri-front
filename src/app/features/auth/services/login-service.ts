import {BehaviorSubject, catchError, finalize, Observable, tap, throwError} from 'rxjs';
import { LoginRepository, LoginResponse } from '../repositories/auth-repository';
import {ErrorService, ErrorType, SAError} from '../../../core/services/error-service';
import { Injectable } from '@angular/core';

@Injectable()
export class LoginService {
  private readonly TOKEN_KEY = 'sipagri_auth_token';
  private readonly USER_KEY = 'user';

  private _loading = new BehaviorSubject<boolean>(false);
  get loading$(): Observable<boolean> {
    return this._loading.asObservable();
  }

  constructor(private loginRepository: LoginRepository,
              private errorService: ErrorService) {}

  private setLoading(loading: boolean) {
    this._loading.next(loading);
  }

  private setToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private setUser(user: any): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  login(email: string, password: string): Observable<LoginResponse> {
    const validationError = this.validateCredentials(email, password);
    if (validationError) {
      return throwError(() => validationError);
    }

    this.setLoading(true);

    return this.loginRepository.login({ email, password }).pipe(
      tap((response) => {
        this.setToken(response.token);
        this.setUser(response.supervisor);
      }),
      catchError((error) => {
        return throwError(() => this.errorService.handleError(error))
      }),
      finalize(() => this.setLoading(false))
    );
  }

  private validateCredentials(email: string, password: string): SAError | null {
    if (!email && !password) {
      return this.errorService.createError(
        ErrorType.VALIDATION,
        'Veuillez saisir votre email et votre mot de passe',
        { email, password }
      );
    }

    if (!email) {
      return this.errorService.createError(
        ErrorType.VALIDATION,
        'Veuillez saisir votre email',
        { email }
      );
    }

    if (!password) {
      return this.errorService.createError(
        ErrorType.VALIDATION,
        'Veuillez saisir votre mot de passe',
        { email }
      );
    }

    if (!this.isValidEmail(email)) {
      return this.errorService.createError(
        ErrorType.VALIDATION,
        'Veuillez saisir un email valide',
        { email }
      );
    }

    return null;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

}
