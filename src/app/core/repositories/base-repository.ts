import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Environment} from '../../environments/environment';
import {PaginationResponse} from '../models/pagination-response-model';
import {Injectable} from '@angular/core';

@Injectable({ providedIn: 'root' })
export abstract class BaseRepository<T> {
  protected abstract endpoint: string;
  private readonly apiUrl: string;

  constructor(protected http: HttpClient,
              private environment: Environment) {
    this.apiUrl = environment.apiUrl;
  }

  getAllPaged(page?: number, size?: number): Observable<PaginationResponse<T>> {
    const params: any = {};
    if (page !== undefined) params.page = page;
    if (size !== undefined) params.size = size;

    return this.http.get<PaginationResponse<T>>(
      `${this.apiUrl}/${this.endpoint}`,
      { params }
    );
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
