import {Injectable} from '@angular/core';
import {Planter} from '../../../core/models/planter-model';
import {BaseService} from '../../../core/services/base-service';
import {PlanterRepository} from '../repositories/planter-repository';
import {Observable} from 'rxjs';
import { PaginationResponse } from "../../../core/models/pagination-response-model";
import { AuthService } from "../../auth/services/auth-service";

@Injectable()
export class PlanterService extends BaseService<Planter>{

  constructor(private planterRepository: PlanterRepository,
              private authService: AuthService) {
    super(planterRepository);
  }

  override getAllPaged(page?: number, size?: number): Observable<PaginationResponse<Planter>> {
    const currentSupervisor = this.authService.getCurrentUser();

    if (currentSupervisor.profile === "ADMINISTRATOR") {
      return super.getAllPaged(page, size);
    }
    return this.planterRepository.getAllPagedByUserId(page, size, currentSupervisor.id)
  }
}
