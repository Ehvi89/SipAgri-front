import {Injectable} from '@angular/core';
import {Planter} from '../../../core/models/planter-model';
import {BaseService} from '../../../core/services/base-service';
import {PlanterRepository} from '../repositories/planter-repository';

@Injectable({providedIn: 'root'})
export class PlanterService extends BaseService<Planter>{

  constructor(private planterRepository: PlanterRepository) {
    super(planterRepository);
  }
}
