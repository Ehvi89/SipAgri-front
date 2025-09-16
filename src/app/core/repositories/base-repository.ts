import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {PaginationResponse} from '../models/pagination-response-model';
import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export abstract class BaseRepository<T> {
  protected abstract endpoint: string;
  private readonly apiUrl: string;

  constructor(protected http: HttpClient) {
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

  update(payload: Partial<T>): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${this.endpoint}`, payload);
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${this.endpoint}/${id}`);
  }
}
