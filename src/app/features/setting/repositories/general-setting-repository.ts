import {Injectable} from '@angular/core';
import {BaseRepository} from '../../../core/repositories/base-repository';
import {Params} from '../../../core/models/parameter-model';

@Injectable()
export class GeneralSettingRepository extends BaseRepository<Params>{
  protected override endpoint = "params";
}
