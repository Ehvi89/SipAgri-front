import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {PaginationResponse} from '../models/pagination-response-model';
import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';

/**
 * BaseRepository is an abstract class that provides common CRUD operations for interacting
 * with an API. This serves as a base class for repositories handling specific types of data.
 * The class is designed to work with an HTTP client for making API requests.
 *
 * @template T The type of the entity the repository operates on.
 */
@Injectable({ providedIn: 'root' })
export abstract class BaseRepository<T> {
  protected abstract endpoint: string;
  private readonly apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = environment.apiUrl;
  }

  /**
   * Retrieves a paginated list of items.
   *
   * @param {number} [page] - Optional page number to retrieve (starting from 0).
   * @param {number} [size] - Optional number of items per page.
   * @return {Observable<PaginationResponse<T>>} An observable emitting the paginated response containing items of type T.
   */
  getAllPaged(page?: number, size?: number): Observable<PaginationResponse<T>> {
    const params: any = {};
    if (page !== undefined) params.page = page;
    if (size !== undefined) params.size = size;

    return this.http.get<PaginationResponse<T>>(
      `${this.apiUrl}/${this.endpoint}`,
      { params }
    );
  }

  /**
   * Performs a search request to the API and retrieves a paginated response.
   *
   * @param {string} search - The search term or query to be used for filtering results.
   * @param {number} [page] - Optional. The page number for pagination of the results.
   * @param {number} [size] - Optional. The number of items per page for pagination.
   * @return {Observable<PaginationResponse<T>>} An observable containing the paginated response with the search results.
   */
  search(search: string, page?: number, size?:number): Observable<PaginationResponse<T>> {
    const params: any = {};
    if (page !== undefined) params.page = page;
    if (size !== undefined) params.size = size;
    params.search = search;

    return this.http.get<PaginationResponse<T>>(
      `${this.apiUrl}/${this.endpoint}/search`,
      { params }
    );
  }


  /**
   * Retrieves all items from the specified API endpoint.
   *
   * @return {Observable<T[]>} An observable emitting an array of items of type T.
   */
  getAll(): Observable<T[]> {
    return this.http.get<T[]>(`${this.apiUrl}/${this.endpoint}/all`);
  }

  /**
   * Retrieves an item by its unique identifier.
   *
   * @param {number|string} id - The unique identifier of the item to retrieve.
   * @return {Observable<T>} An observable containing the item data of type T.
   */
  getById(id: number | string): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${this.endpoint}/${id}`);
  }

  /**
   * Creates a new resource by sending a POST request with the provided payload.
   *
   * @param {Partial<T>} payload - The data to be sent for creating the resource. Only partial data is required.
   * @return {Observable<T>} An observable containing the created resource as a response.
   */
  create(payload: Partial<T>): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${this.endpoint}`, payload);
  }

  /**
   * Updates an existing resource on the server with the provided payload.
   *
   * @param {Partial<T>} payload - A partial object containing the fields to update for the resource.
   * @return {Observable<T>} An observable that emits the updated resource.
   */
  update(payload: Partial<T>): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${this.endpoint}`, payload);
  }

  /**
   * Deletes a resource identified by the given ID from the specified API endpoint.
   *
   * @param {number | string} id - The unique identifier of the resource to be deleted.
   * @return {Observable<void>} An Observable that completes when the delete operation is successful.
   */
  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${this.endpoint}/${id}`);
  }
}
