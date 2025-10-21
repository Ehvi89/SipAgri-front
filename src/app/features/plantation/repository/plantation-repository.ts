import {Injectable} from '@angular/core';
import {BaseRepository} from '../../../core/repositories/base-repository';
import {Plantation} from '../../../core/models/plantation-model';

@Injectable({providedIn: 'root'})
export class PlantationRepository extends BaseRepository<Plantation> {
  override endpoint = 'plantations';
}
