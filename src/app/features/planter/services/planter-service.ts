import {Injectable} from '@angular/core';
import {BehaviorSubject, catchError, finalize, tap, Observable, throwError} from 'rxjs';
import {Planter} from '../../../core/models/planter-model';
import {PlanterRepository} from '../repositories/planter-repository';
import {ErrorService} from '../../../core/services/error-service';
import {PaginationResponse} from '../../../core/models/pagination-response-model';

@Injectable({providedIn: 'root'})
export class PlanterService {
  _loading = new BehaviorSubject<boolean>(false);
  get loading(): Observable<boolean> {
    return this._loading.asObservable();
  }
  setLoading(value: boolean) { this._loading.next(value); }

  _plantersPaged = new BehaviorSubject<PaginationResponse<Planter>>({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    data: []
  });
  get planterPaged(): Observable<PaginationResponse<Planter>> {
    return this._plantersPaged.asObservable();
  }

  private selectedPlanterSource = new BehaviorSubject<Planter | null>(null);
  selectedPlanter$ = this.selectedPlanterSource.asObservable();

  setSelectedPlanter(planter: Planter) { this.selectedPlanterSource.next(planter); }
  get selectedPlanter(): Planter | null {
    return this.selectedPlanterSource.value;
  }

  constructor(private planterRepository: PlanterRepository,
              private errorService: ErrorService) {
  }

  getAllPlanter(): Observable<Planter[]> {
    this.setLoading(true);
    return this.planterRepository.getAll().pipe(
      catchError(error => throwError(() => this.errorService.handleError(error))),
      finalize(() => this.setLoading(false))
    )
  }

  getPlanterPaged(page?: number, size?: number): void {
    this.setLoading(true);
    this.planterRepository.getAllPaged(page, size).pipe(
      tap((response: PaginationResponse<Planter>) => this._plantersPaged.next(response)),
      catchError(error => throwError(() => this.errorService.handleError(error))),
      finalize(() => this.setLoading(false))
    ).subscribe()
  }

  loadNextData(size?: number): void {
    const currentPage = this._plantersPaged.getValue().currentPage;
    const totalPage = this._plantersPaged.getValue().totalPages;
    if (currentPage < totalPage) {
      this.getPlanterPaged(currentPage + 1, size);
    }
  }

  loadPreviousData(size?: number): void {
    const currentPage = this._plantersPaged.getValue().currentPage;
    if (currentPage > 0) {
      this.getPlanterPaged(currentPage - 1, size);
    }
  }

  addNewPlanter(newPlanter: Planter): Observable<any> {
    this.setLoading(true);
    return this.planterRepository.create(newPlanter).pipe(
      catchError(error => throwError(() => this.errorService.handleError(error))),
      finalize(() => this.setLoading(false))
    );
  }
}
