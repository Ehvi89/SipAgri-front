import {Injectable} from '@angular/core';
import { BaseRepository } from "../../core/repositories/base-repository";
import { Supervisor } from "../../core/models/supervisor-model";

@Injectable()
export class SupervisorRepository extends BaseRepository<Supervisor> {
    protected override endpoint = "supervisors";
}
