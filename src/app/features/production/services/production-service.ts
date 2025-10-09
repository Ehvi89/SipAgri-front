import {Injectable} from '@angular/core';
import {BaseService} from '../../../core/services/base-service';
import {Production} from '../../../core/models/production-model';
import {ProductionRepository} from '../repositories/production-repository';
import { AuthService } from "../../auth/services/auth-service";
import {Observable} from 'rxjs';
import { PaginationResponse } from "../../../core/models/pagination-response-model";

@Injectable({providedIn: 'root'})
export class ProductionService extends BaseService<Production>{
  constructor(private readonly productionRepository: ProductionRepository) {
    super(productionRepository);
  }
}
