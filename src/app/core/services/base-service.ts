// core/services/base-service.ts
import { BehaviorSubject, Observable, catchError, finalize, of, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BaseRepository } from '../repositories/base-repository';
import {PaginationResponse} from '../models/pagination-response-model';
import {ErrorService} from './error-service';
import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export abstract class BaseService<T> {
  private _loading = new BehaviorSubject<boolean>(false);
  public readonly loading$: Observable<boolean> = this._loading.asObservable();

  private _data = new BehaviorSubject<T[] | null>(null);
  public readonly data$: Observable<T[] | null> = this._data.asObservable();

  private _pagedData = new BehaviorSubject<PaginationResponse<T> | null>(null);
  public readonly pagedData$: Observable<PaginationResponse<T> | null> = this._pagedData.asObservable();
  private errorService: ErrorService = new ErrorService();

  protected constructor(protected repository: BaseRepository<T>) {}

  protected setLoading(state: boolean) {
    this._loading.next(state);
  }

  /**
   * Récupère tous les éléments (cache si déjà chargé)
   */
  getAllPaged(page?: number, size?: number): Observable<PaginationResponse<T>> {
    this.setLoading(true);
    return this.repository.getAllPaged(page, size).pipe(
      tap(data => this._pagedData.next(data)), // mise à jour du cache
      finalize(() => this.setLoading(false)),
      catchError(err => throwError(() => this.errorService.handleError(err)))
    );
  }

  /**
   * Récupère tous les éléments (cache si déjà chargé)
   */
  getAll(forceRefresh = false): Observable<T[]> {
    if (!forceRefresh && this._data.value) {
      // Retourne le cache
      return of(this._data.value);
    }

    this.setLoading(true);
    return this.repository.getAll().pipe(
      tap(data => this._data.next(data)), // mise à jour du cache
      finalize(() => this.setLoading(false)),
      catchError(err => throwError(() => this.errorService.handleError(err)))
    );
  }

  /**
   * Récupère un élément par ID
   */
  getById(id: number | string): Observable<T> {
    this.setLoading(true);
    return this.repository.getById(id).pipe(
      finalize(() => this.setLoading(false)),
      catchError(err => throwError(() => this.errorService.handleError(err)))
    );
  }

  /**
   * Crée un nouvel élément + met à jour le cache
   */
  create(payload: Partial<T>): Observable<T> {
    this.setLoading(true);
    return this.repository.create(payload).pipe(
      tap(newItem => {
        if (this._data.value) {
          this._data.next([...this._data.value, newItem]);
        }
      }),
      finalize(() => this.setLoading(false)),
      catchError(err => throwError(() => this.errorService.handleError(err)))
    );
  }

  /**
   * Met à jour un élément + met à jour le cache
   */
  update(id: number | string, payload: Partial<T>): Observable<T> {
    this.setLoading(true);
    return this.repository.update(payload).pipe(
      tap(updatedItem => {
        if (this._data.value) {
          this._data.next(
            this._data.value.map(item =>
              (item as any).id === id ? updatedItem : item
            )
          );
        }
      }),
      finalize(() => this.setLoading(false)),
      catchError(err => throwError(() => this.errorService.handleError(err)))
    );
  }

  /**
   * Supprime un élément + met à jour le cache
   */
  delete(id: number | string): Observable<void> {
    this.setLoading(true);
    return this.repository.delete(id).pipe(
      tap(() => {
        if (this._data.value) {
          this._data.next(this._data.value.filter(item => (item as any).id !== id));
        }
      }),
      finalize(() => this.setLoading(false)),
      catchError(err => throwError(() => this.errorService.handleError(err)))
    );
  }
  loadNextData(size?: number): void {
    const currentPage = this._pagedData.getValue()?.currentPage;
    const totalPage = this._pagedData.getValue()?.totalPages;
    if (currentPage! < totalPage!) {
      this.getAllPaged(currentPage! + 1, size);
    }
  }

  loadPreviousData(size?: number): void {
    const currentPage = this._pagedData.getValue()?.currentPage;
    if (currentPage! > 0) {
      this.getAllPaged(currentPage! - 1, size);
    }
  }
}
