import {Router} from '@angular/router';
import {tap, of, Observable, throwError, BehaviorSubject, finalize} from 'rxjs';
import {Injectable} from '@angular/core';
import {AuthRepository} from '../repositories/auth-repository';
import {catchError} from 'rxjs/operators';
import {ErrorService} from '../../../core/services/error-service';
import {Supervisor} from '../../../core/models/supervisor-model';

/**
 * AuthService provides methods for managing authentication-related operations,
 * such as token management, user session handling, and password operations.
 */
@Injectable({providedIn: 'root'})
export class AuthService {
  /**
   * A constant that stores the key name used for storing and retrieving
   * the authentication token in storage.
   *
   * TOKEN_KEY serves as an identifier for accessing the specific authentication token
   * required for user session validation in the application.
   */
  private readonly TOKEN_KEY = "sipagri_auth_token";

  /**
   * A private BehaviorSubject that holds the loading state as a boolean value.
   * This observable can be used to track and update the loading status of an operation.
   * The initial value of the loading state is set to `false`.
   *
   * @type {BehaviorSubject<boolean>}
   * @private
   */
  _loading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  /**
   * Returns an observable that emits the loading state.
   *
   * @return {Observable<boolean>} An observable emitting `true` if loading is in progress, and `false` otherwise.
   */
  get loading(): Observable<boolean> {
    return this._loading.asObservable();
  }

  /**
   * Updates the loading state with the provided value.
   *
   * @param {boolean} value - The new loading state to set.
   * @return {void} Does not return a value.
   */
  setLoading(value: boolean): void {
    this._loading.next(value)
  }

  /**
   * Constructor for initializing the class with necessary dependencies.
   *
   * @param {Router} router - The router used for handling navigation and routes.
   * @param {AuthRepository} authRepository - The repository managing authentication-related operations.
   * @param {ErrorService} errorService - The service responsible for handling and managing errors.
   */
  constructor(private readonly router: Router,
              private readonly authRepository: AuthRepository,
              private readonly errorService: ErrorService) {}

  /**
   * Retrieves the currently logged-in user from the local storage.
   *
   * @return {Supervisor} The current user as an instance of the Supervisor class.
   */
  static getCurrentUser(): Supervisor {
    const userData = localStorage.getItem("user");
    return JSON.parse(userData!) as Supervisor;
  }

  /**
   * Retrieves a token from local storage.
   *
   * @return {string|null} The token string if it exists in local storage, or null if it does not exist.
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Checks whether the token has expired based on its expiration time.
   *
   * The function decodes the token, extracts its expiration time, and compares it to the current time.
   * If no token is found, or the token's expiration time has passed, it returns true, indicating the token is expired.
   *
   * @return {boolean} True if the token has expired or if no token exists, otherwise false.
   */
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
    return (Math.floor(Date.now() / 1000)) >= expiry;
  }

  /**
   * Removes stored connection information from the local storage.
   * This includes the token and user information.
   *
   * @return Returns an observable that emits `void` when the operation completes.
   */
  forgetConnexionInfo(): Observable<void> {
    // Nettoyage local seulement
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem('user');

    return of(undefined);
  }

  /**
   * Logs out the current user by clearing connection information, navigating to the login page if not already there,
   * and reloading the application state.
   *
   * @return {Observable<void>} An observable that completes when the logout process is finalized.
   */
  logout(): Observable<void> {
    return this.forgetConnexionInfo().pipe(
      tap(() => {
        if (!this.router.url.startsWith('/auth/login')) {
          this.router.navigateByUrl('/auth/login').then(() => {
            globalThis.location.reload();
            console.log("User logged out")
          });
        }
      })
    );
  }

  /**
   * Resets the password using the provided information.
   *
   * @param {Object} value - An object containing the necessary information for resetting the password.
   * @param {string | number} value.field - The field used for password reset, e.g., email or phone number.
   * @param {string} value.method - The method to reset the password, e.g., 'email' or 'sms'.
   * @return {Observable<any>} An observable that emits the result of the password reset operation.
   */
  resetPassword(value: {field: string | number, method: string}): Observable<any> {
    this.setLoading(true)
    return this.authRepository.resetPassword(value).pipe(
      catchError(err => throwError(() => this.errorService.handleError(err))),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Changes the user's password based on the provided input. This method validates the input values
   * such as the password, token, and method, and sends a request to the authentication repository
   * to update the password. If any errors occur during the process, they will be handled appropriately.
   *
   * @param {string} password The new password to be set for the user. Must be at least 8 characters long.
   * @return {Observable<any>} An observable that emits the response from the server or an error if the operation fails.
   */
  changePassword(password: string): Observable<any> {
    // Vérification des paramètres requis
    const urlParams = new URLSearchParams(globalThis.location.search);

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

    return this.authRepository.changePassword(request).pipe(
      catchError(err => {
        const handledError = this.errorService.handleError(err);
        return throwError(() => handledError);
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Updates the current user information in local storage.
   *
   * @param {Supervisor} supervisor - The supervisor object containing user information to be updated.
   * @return {void} Does not return a value.
   */
  updateCurrentUser(supervisor: Supervisor): void {
    localStorage.setItem("user", JSON.stringify(supervisor));
  }
}
