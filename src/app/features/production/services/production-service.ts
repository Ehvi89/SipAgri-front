import {Injectable} from '@angular/core';
import {BaseService} from '../../../core/services/base-service';
import {Production} from '../../../core/models/production-model';
import {ProductionRepository} from '../repositories/production-repository';

@Injectable()
export class ProductionService extends BaseService<Production>{
  constructor(private productionRepository: ProductionRepository) {
    super(productionRepository);
  }
}
