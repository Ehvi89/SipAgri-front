import {Injectable} from '@angular/core';
import {BaseRepository} from '../../../core/repositories/base-repository';
import {Production} from '../../../core/models/production-model';

@Injectable()
export class ProductionRepository extends BaseRepository<Production>{
  endpoint= "productions"
}
