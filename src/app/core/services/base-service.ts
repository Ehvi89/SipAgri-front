// core/services/base-service.ts
import {
  BehaviorSubject,
  Observable,
  catchError,
  finalize,
  of,
  throwError,
  debounceTime,
  distinctUntilChanged, switchMap, Subject
} from 'rxjs';
import { tap } from 'rxjs/operators';
import { BaseRepository } from '../repositories/base-repository';
import {PaginationResponse} from '../models/pagination-response-model';
import {ErrorService} from './error-service';
import {Injectable} from '@angular/core';
import { AuthService } from "../../features/auth/services/auth-service";

/**
 * BaseService provides a generic abstraction for managing entities, with functionalities
 * to interact with common CRUD operations, paginated data, and caching mechanism.
 *
 * @template T The type of the entity this service handles.
 */
@Injectable({providedIn: 'root'})
export abstract class BaseService<T> {
  private _loading = new BehaviorSubject<boolean>(false);
  public readonly loading$: Observable<boolean> = this._loading.asObservable();

  private _data = new BehaviorSubject<T[] | null>(null);
  private _pagedData = new BehaviorSubject<PaginationResponse<T> | null>(null);
  public readonly pagedData$: Observable<PaginationResponse<T> | null> = this._pagedData.asObservable();
  private errorService: ErrorService = new ErrorService();
  private searchSubject = new Subject<{ search: string; page?: number; size?: number }>();

  protected constructor(protected repository: BaseRepository<T>) {
    this.setupSearchPipeline();
  }

  protected setLoading(state: boolean) {
    this._loading.next(state);
  }

  /**
   * Retrieves a paginated list of data based on the provided page number and size.
   *
   * @param {number} [page] The optional page number to retrieve. Defaults to the first page if not provided.
   * @param {number} [size] The optional size of the page, i.e., the number of items per page.
   * @return {Observable<PaginationResponse<T>>} An observable emitting the paginated response containing the data.
   */
  getAllPaged(page?: number, size?: number): Observable<PaginationResponse<T>> {
    this.setLoading(true);const currentSupervisor = AuthService.getCurrentUser();
    if (currentSupervisor.profile === "ADMINISTRATOR") {
      return this.repository.getAllPaged(page, size).pipe(
        tap(data => this._pagedData.next(data)), // mise à jour du cache
        finalize(() => this.setLoading(false)),
        catchError(err => throwError(() => this.errorService.handleError(err)))
      );
    } else {
      return this.repository.getAllPagedByUserId(page, size, currentSupervisor.id).pipe(
        tap(data => this._pagedData.next(data)), // mise à jour du cache
        finalize(() => this.setLoading(false)),
        catchError(err => throwError(() => this.errorService.handleError(err)))
      );
    }
  }

  /**
   * Retrieves all data, optionally bypassing the cache.
   *
   * @param {boolean} [forceRefresh=false] - If true, bypasses the cache and fetches fresh data.
   *                                         If false or omitted, uses cached data if available.
   * @return {Observable<T[]>} An observable that emits the list of data items.
   */
  getAll(forceRefresh: boolean = false): Observable<T[]> {
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

  private setupSearchPipeline(): void {
    this.searchSubject.pipe(
      debounceTime(300), // Attend 300ms après la dernière saisie
      distinctUntilChanged((prev, curr) =>
        prev.search === curr.search &&
        prev.page === curr.page &&
        prev.size === curr.size
      ),
      switchMap(params => {
        this.setLoading(true);
        return this.repository.search(params.search, params.page, params.size).pipe(
          tap(data => {
            this._pagedData.next(data);
            // console.log('Search results:', data);
          }),
          catchError(err => throwError(() => this.errorService.handleError(err))),
          finalize(() => this.setLoading(false))
        );
      })
    ).subscribe();
  }

  /**
   * Executes a search operation with debouncing and cancellation.
   *
   * @param {string} search - The search term or query to filter the data.
   * @param {number} [page] - The page number to fetch (optional).
   * @param {number} [size] - The number of items per page (optional).
   */
  search(search: string, page?: number, size?: number): void {
    this.searchSubject.next({ search, page, size });
  }

  /**
   * Retrieves an entity by its unique identifier.
   *
   * @param {number | string} id - The unique identifier of the entity to retrieve.
   * @return {Observable<T>} An observable containing the entity data or an error if the operation fails.
   */
  getById(id: number | string): Observable<T> {
    this.setLoading(true);
    return this.repository.getById(id).pipe(
      finalize(() => this.setLoading(false)),
      catchError(err => throwError(() => this.errorService.handleError(err)))
    );
  }

  /**
   * Creates a new item with the provided payload by delegating the operation to the repository.
   * Updates the local state `_data` and `_pagedData` upon successful creation.
   *
   * @param {Partial<T>} payload - The partial object containing properties required to create the new item.
   * @return {Observable<T>} An Observable that emits the created item upon success.
   */
  create(payload: Partial<T>): Observable<T> {
    this.setLoading(true);
    return this.repository.create(payload).pipe(
      tap(newItem => {
        if (this._data.value) {
          this._data.next([...this._data.value, newItem]);
        }
        if (this._pagedData.value) {
          this._pagedData.next({
            ...this._pagedData.value,
            data: [...this._pagedData.value.data, newItem],
          });
        }
      }),
      finalize(() => this.setLoading(false)),
      catchError(err => throwError(() => this.errorService.handleError(err)))
    );
  }

  /**
   * Updates an existing item identified by the provided `id` with the given `payload` and returns the updated item as an observable.
   *
   * @param {number | string} id - The identifier of the item to update.
   * @param {Partial<T>} payload - The partial object containing the fields to update.
   * @return {Observable<T>} An Observable emitting the updated item.
   */
  update(id: number | string, payload: Partial<T>): Observable<T> {
    this.setLoading(true);
    return this.repository.update(payload).pipe(
      tap(updatedItem => {
        if (this._data.value) {
          this._data.next([
            ...this._data.value.map(item =>
              (item as any).id === id ? updatedItem : item
            )
          ]);
        }
        if (this._pagedData.value) {
          this._pagedData.next({
            ...this._pagedData.value,
            data: [
              ...this._pagedData.value.data.map(item =>
                (item as any).id === id ? updatedItem : item
              )
            ],
          });
        }
      }),
      finalize(() => this.setLoading(false)),
      catchError(err => throwError(() => this.errorService.handleError(err)))
    );
  }

  /**
   * Partially updates an item with the provided payload and updates the local state accordingly.
   *
   * @param {number | string} id - The unique identifier of the item to update.
   * @param {Partial<T>} payload - The partial payload containing properties to update.
   * @return {Observable<T>} An observable that emits the updated item.
   */
  partialUpdate(id: number | string, payload: Partial<T>): Observable<T> {
    this.setLoading(true);
    return this.repository.partialUpdate(payload).pipe(
      tap(updatedItem => {
        if (this._data.value) {
          this._data.next([
            ...this._data.value.map(item =>
              (item as any).id === id ? updatedItem : item
            )
          ]);
        }
        if (this._pagedData.value) {
          this._pagedData.next({
            ...this._pagedData.value,
            data: [
              ...this._pagedData.value.data.map(item =>
                (item as any).id === id ? updatedItem : item
              )
            ],
          });
        }
      }),
      finalize(() => this.setLoading(false)),
      catchError(err => throwError(() => this.errorService.handleError(err)))
    );
  }

  /**
   * Deletes an item with the specified ID.
   *
   * @param {number | string} id - The unique identifier of the item to delete.
   * @return {Observable<void>} An observable indicating the completion of the deletion operation.
   */
  delete(id: number | string): Observable<void> {
    this.setLoading(true);
    return this.repository.delete(id).pipe(
      tap(() => {
        if (this._pagedData.value) {
          this._pagedData.next({
            ...this._pagedData.value,
            data: this._pagedData.value.data.filter(item => (item as any).id !== id)
          });
        }
      }),
      finalize(() => this.setLoading(false)),
      catchError(err => throwError(() => this.errorService.handleError(err)))
    );
  }


  /**
   * Loads the next set of data if the current page is not the last page.
   *
   * @param {number} [size] - The optional size of data to load for the next page.
   * @return {void} Does not return any value.
   */
  loadNextData(size?: number): void {
    const currentPage = this._pagedData.getValue()?.currentPage;
    const totalPage = this._pagedData.getValue()?.totalPages;
    if (currentPage! < totalPage!) {
      this.getAllPaged(currentPage! + 1, size);
    }
  }

  /**
   * Loads the data from the previous page if the current page is greater than 0.
   *
   * @param {number} [size] - Optional parameter specifying the size of the data to be loaded.
   * @return {void} - Does not return any value.
   */
  loadPreviousData(size?: number): void {
    const currentPage = this._pagedData.getValue()?.currentPage;
    if (currentPage! > 0) {
      this.getAllPaged(currentPage! - 1, size);
    }
  }
}
