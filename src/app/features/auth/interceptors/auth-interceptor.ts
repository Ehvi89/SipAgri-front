import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth-service';
import { Router } from '@angular/router';

@Injectable({ providedIn: "root" })
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Exclusion des requêtes vers les endpoints d'authentification
    if (this.isAuthRequest(req)) {
      return next.handle(req);
    }

    const authReq = this.addTokenToRequest(req);

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !this.isRefreshInProgress()) {
          return this.handle401Error(authReq, next);
        }
        return throwError(() => error);
      })
    );
  }

  private isAuthRequest(req: HttpRequest<any>): boolean {
    return req.url.includes('/auth/');
  }

  private isRefreshInProgress(): boolean {
    return this.isRefreshing;
  }

  private addTokenToRequest(req: HttpRequest<any>): HttpRequest<any> {
    const token = this.authService.getToken();
    return token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      return this.authService.forgetConnexionInfo().pipe(
        switchMap(() => {
          this.isRefreshing = false;
          if (!this.router.url.includes('/auth/login')) {
            // Stocker l'URL actuelle ET les queryParams/params
            localStorage.setItem('previousUrl', this.router.url);
            this.router.navigate(['/auth/login'], {
              queryParams: { sessionExpired: true, redirectUrl: this.router.url },
              replaceUrl: true
            }).then(() => console.log('Redirecting to login page...'));
          }
          return next.handle(request);
        })
      );
    }
    return next.handle(request);
  }
}
