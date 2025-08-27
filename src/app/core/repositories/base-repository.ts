// core/repositories/base-repository.ts
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from '../../environments/environment';
// import {environment} from '../../environments/environment-prod';

export abstract class BaseRepository<T> {
  protected abstract endpoint: string;
  private apiUrl = `${environment.apiUrl}`;

  constructor(protected http: HttpClient) {}

  getAllPaged(): Observable<T[]> {
    return this.http.get<T[]>(`${this.apiUrl}/${this.endpoint}`);
  }

  getAll(): Observable<T[]> {
    return this.http.get<T[]>(`${this.apiUrl}/${this.endpoint}/all`);
  }

  getById(id: number | string): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${this.endpoint}/${id}`);
  }

  create(payload: Partial<T>): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${this.endpoint}`, payload);
  }

  update(id: number | string, payload: Partial<T>): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${this.endpoint}/${id}`, payload);
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${this.endpoint}/${id}`);
  }
}
