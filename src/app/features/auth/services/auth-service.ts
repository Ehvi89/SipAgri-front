import {Router} from '@angular/router';
import { tap, of, Observable } from 'rxjs';
import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class AuthService {
  private readonly TOKEN_KEY = "sipagri_auth_token";

  constructor(private router: Router) {}

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
          this.router.navigate(['/auth/login'], {
            replaceUrl: true
          });
        }
      })
    );
  }
}
