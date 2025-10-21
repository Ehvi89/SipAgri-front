import {Injectable} from '@angular/core';
import { BaseService } from "../../../core/services/base-service";
import {Params} from '../../../core/models/parameter-model';
import {GeneralSettingRepository} from '../repositories/general-setting-repository';

@Injectable()
export class GeneralSettingService extends BaseService<Params>{
  constructor(private generalSettingRepository: GeneralSettingRepository) {
    super(generalSettingRepository);
  }
}
