// core/services/base-service.ts
import { BehaviorSubject, Observable, catchError, finalize, of, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BaseRepository } from '../repositories/base-repository';

export abstract class BaseService<T> {
  private _loading = new BehaviorSubject<boolean>(false);
  public readonly loading$: Observable<boolean> = this._loading.asObservable();

  private _data = new BehaviorSubject<T[] | null>(null);
  public readonly data$: Observable<T[] | null> = this._data.asObservable();

  protected constructor(protected repository: BaseRepository<T>) {}

  protected setLoading(state: boolean) {
    this._loading.next(state);
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
      catchError(err => throwError(() => err))
    );
  }

  /**
   * Récupère un élément par ID
   */
  getById(id: number | string): Observable<T> {
    this.setLoading(true);
    return this.repository.getById(id).pipe(
      finalize(() => this.setLoading(false)),
      catchError(err => throwError(() => err))
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
      catchError(err => throwError(() => err))
    );
  }

  /**
   * Met à jour un élément + met à jour le cache
   */
  update(id: number | string, payload: Partial<T>): Observable<T> {
    this.setLoading(true);
    return this.repository.update(id, payload).pipe(
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
      catchError(err => throwError(() => err))
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
      catchError(err => throwError(() => err))
    );
  }

  /**
   * Vide le cache
   */
  clearCache() {
    this._data.next(null);
  }
}
