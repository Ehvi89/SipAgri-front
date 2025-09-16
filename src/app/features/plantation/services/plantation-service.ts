import {Injectable} from '@angular/core';
import {BaseService} from '../../../core/services/base-service';
import {Plantation} from '../../../core/models/plantation-model';
import {PlantationRepository} from '../repository/plantation-repository';

@Injectable()
export class PlantationService extends BaseService<Plantation> {

  constructor(private plantationRepository: PlantationRepository) {
    super(plantationRepository);
  }
}
