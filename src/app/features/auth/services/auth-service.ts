import {Router} from '@angular/router';
import {tap, of, Observable, throwError, BehaviorSubject, finalize} from 'rxjs';
import {Injectable} from '@angular/core';
import {AuthRepository} from '../repositories/auth-repository';
import {catchError} from 'rxjs/operators';
import {ErrorService} from '../../../core/services/error-service';
import {Supervisor} from '../../../core/models/supervisor-model';
import {parseJsonSchemaToOptions} from '@angular/cli/src/command-builder/utilities/json-schema';

@Injectable({providedIn: 'root'})
export class AuthService {
  private readonly TOKEN_KEY = "sipagri_auth_token";

  _loading = new BehaviorSubject<boolean>(false);
  get loading(): Observable<boolean> {
    return this._loading.asObservable();
  }

  setLoading(value: boolean) {
    this._loading.next(value)
  }

  constructor(private router: Router,
              private authRepository: AuthRepository,
              private errorService: ErrorService) {}

  /**
   * Retourne l'utilisateur connecté
   */
  getCurrentUser(): Supervisor {
    const userData = localStorage.getItem("user");
    return JSON.parse(userData!) as Supervisor;
  }

  /**
   * Retourne le token s'il existe
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Permet de vérifier le token est toujours valide
   * */
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
    return (Math.floor((new Date).getTime() / 1000)) >= expiry;
  }

  forgetConnexionInfo(): Observable<void> {
    // Nettoyage local seulement
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem('user');
    // this._currentUser.next(null);
    return of(undefined);
  }

  /**
   * Déconnecte l'utilisateur
   */
  logout(): Observable<void> {
    return this.forgetConnexionInfo().pipe(
      tap(() => {
        if (!this.router.url.startsWith('/auth/login')) {
          this.router.navigateByUrl('/auth/login');
        }
      })
    );
  }

  resetPassword(value: {field: string | number, method: string}): Observable<any> {
    this.setLoading(true)
    return this.authRepository.resetPassword(value).pipe(
      catchError(err => throwError(this.errorService.handleError(err))),
      finalize(() => this.setLoading(false))
    );
  }

  changePassword(password: string): Observable<any> {
    // Vérification des paramètres requis
    const urlParams = new URLSearchParams(window.location.search);

    if (!urlParams) {
      return throwError(() => new Error('Données de réinitialisation manquantes'));
    }

    const urlToken: string | null = urlParams.get('token');
    const method: string | null = urlParams.get('method');


    // Validation des paramètres
    if (!urlToken || !method) {
      return throwError(() => new Error('Token ou méthode de réinitialisation manquant'));
    }

    if (!password || password.length < 8) {
      return throwError(() => new Error('Le mot de passe doit contenir au moins 8 caractères'));
    }

    this.setLoading(true);

    const request = {
      newPassword: password,
      token: urlToken,
      method: method,
    };

    // console.log("DEBUG request: ", request);


    return this.authRepository.changePassword(request).pipe(
      catchError(err => {
        const handledError = this.errorService.handleError(err);
        return throwError(() => handledError);
      }),
      finalize(() => this.setLoading(false))
    );
  }
}
