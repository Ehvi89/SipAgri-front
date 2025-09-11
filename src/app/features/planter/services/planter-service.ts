import {Injectable} from '@angular/core';
import {BehaviorSubject, catchError, finalize, tap, Observable, throwError} from 'rxjs';
import {Planter} from '../../../core/models/planter-model';
import {BaseService} from '../../../core/services/base-service';
import {PlanterRepository} from '../repositories/planter-repository';
import {Location} from '../../../core/models/location-model';
import {GeocodingService} from '../../../core/services/geocoding-service';

@Injectable({providedIn: 'root'})
export class PlanterService extends BaseService<Planter>{

  private selectedPlanterSource = new BehaviorSubject<Planter | null>(null);

  setSelectedPlanter(planter: Planter | null) { this.selectedPlanterSource.next(planter); }
  get selectedPlanter(): Planter | null {
    return this.selectedPlanterSource.value;
  }

  constructor(private planterRepository: PlanterRepository) {
    super(planterRepository);
  }

  override update(id: number | string, payload: Partial<Planter>): Observable<Planter> {
    return super.update(id, payload).pipe(
      tap((planter: Planter) => {this.selectedPlanterSource.next(planter)})
    );
  }
}
