// core/repositories/base-repository.ts
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export abstract class BaseRepository<T> {
  protected abstract endpoint: string;

  constructor(protected http: HttpClient) {}

  getAll(): Observable<T[]> {
    return this.http.get<T[]>(`${this.endpoint}`);
  }

  getById(id: number | string): Observable<T> {
    return this.http.get<T>(`${this.endpoint}/${id}`);
  }

  create(payload: Partial<T>): Observable<T> {
    return this.http.post<T>(`${this.endpoint}`, payload);
  }

  update(id: number | string, payload: Partial<T>): Observable<T> {
    return this.http.put<T>(`${this.endpoint}/${id}`, payload);
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }
}
