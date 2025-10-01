import {Injectable} from '@angular/core';
import {BaseRepository} from '../../../../../core/repositories/base-repository';
import {Kit} from '../../../../../core/models/kit-model';

@Injectable()
export class KitRepository extends BaseRepository<Kit> {
  endpoint = 'kits';
}
