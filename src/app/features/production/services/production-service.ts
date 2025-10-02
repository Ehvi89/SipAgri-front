import {Injectable} from '@angular/core';
import {BaseService} from '../../../core/services/base-service';
import {Production} from '../../../core/models/production-model';
import {ProductionRepository} from '../repositories/production-repository';
import { AuthService } from "../../auth/services/auth-service";
import {Observable} from 'rxjs';
import { PaginationResponse } from "../../../core/models/pagination-response-model";

@Injectable()
export class ProductionService extends BaseService<Production>{
  constructor(private productionRepository: ProductionRepository,
              private authService: AuthService) {
    super(productionRepository);
  }

  override getAllPaged(page?: number, size?: number): Observable<PaginationResponse<Production>> {
    const currentSupervisor = this.authService.getCurrentUser();
    if (currentSupervisor.profile === "ADMINISTRATOR") {
      return super.getAllPaged(page, size);
    }
    return this.productionRepository.getAllPagedByUserId(page, size, currentSupervisor.id)
  }
}
