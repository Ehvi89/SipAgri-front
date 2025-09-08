import {BaseRepository} from '../../../core/repositories/base-repository';
import {Planter} from '../../../core/models/planter-model';
import {Injectable} from '@angular/core';

@Injectable()
export class PlanterRepository extends BaseRepository<Planter>{
    protected override endpoint = "planters";
}
