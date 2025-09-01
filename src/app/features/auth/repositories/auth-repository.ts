import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError, map, Observable, throwError} from 'rxjs';
// import {environment} from '../../../environments/environment';
import {environment} from '../../../environments/environment-prod';
import { Injectable } from '@angular/core';
import {Supervisor} from '../../../core/models/supervisor-model';

export interface LoginCredential {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  supervisor: Supervisor;
}

@Injectable()
export class LoginRepository {
  constructor(private http: HttpClient) {}

  login(credential: LoginCredential): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, credential)
      .pipe(
        map((response) => ({
          token: response.token,
          supervisor: response.supervisor,
        })),
        catchError((error: HttpErrorResponse) => {
          if (!environment.prod) {
            console.error('An error occurred during login: ', error.message);
          }
          return throwError(() => error);
        })
      );
  }
}

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
  password: string;
}

@Injectable()
export class RegisterRepository {
  constructor(private http: HttpClient) {}

  register(user: RegisterCredential): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(environment.apiUrl + '/auth/register', user)
      .pipe(
        map((response) => response),
        catchError((error: HttpErrorResponse) => {
          if (!environment.prod) {
            console.error('An error occurred during registry: ', error.message);
          }
          return throwError(() => error);
        })
      );
  }

  checkEmailExist(email: string): Observable<boolean> {
    return this.http.post<any>(environment.apiUrl + '/auth/email-exist', email)
      .pipe(
        map(response => {
          return response != null;
        }),
        catchError(err => throwError(err))
      )
  }
}

@Injectable({providedIn: "root"})
export class AuthRepository {
  constructor(private http: HttpClient) {}

  resetPassword(value: { field: string | number; method: string }): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/forgot-password`, value.field).pipe(
      map((response) => response),
      catchError(err => throwError(err))
    )
  }

  changePassword(request: { newPassword: string; token: any; method: any }) {
    return this.http.post<any>(`${environment.apiUrl}/auth/reset-password`, request).pipe(
      map((response) => response),
      catchError(err => throwError(err))
    )
  }
}
