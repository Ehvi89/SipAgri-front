import {Injectable} from '@angular/core';
import {BaseService} from '../../../core/services/base-service';
import {Plantation} from '../../../core/models/plantation-model';
import {PlantationRepository} from '../repository/plantation-repository';
import {Observable} from 'rxjs';
import { PaginationResponse } from "../../../core/models/pagination-response-model";
import { AuthService } from "../../auth/services/auth-service";

@Injectable()
export class PlantationService extends BaseService<Plantation> {

  constructor(private plantationRepository: PlantationRepository,
              private authService: AuthService) {
    super(plantationRepository);
  }

  override getAllPaged(page?: number, size?: number): Observable<PaginationResponse<Plantation>> {
    const currentSupervisor = this.authService.getCurrentUser();
    if (currentSupervisor.profile === "ADMINISTRATOR") {
      return super.getAllPaged(page, size);
    }
    return this.plantationRepository.getAllPagedByUserId(page, size, currentSupervisor.id)
  }
}
