import {Injectable} from '@angular/core';
import {BaseService} from '../../../../../core/services/base-service';
import {Kit} from '../../../../../core/models/kit-model';
import {KitRepository} from '../repositories/kit-repository';

@Injectable()
export class KitService extends BaseService<Kit> {
  constructor(private kitRepository: KitRepository) {
    super(kitRepository);
  }
}
