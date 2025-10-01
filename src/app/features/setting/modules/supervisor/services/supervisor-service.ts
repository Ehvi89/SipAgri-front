import {Injectable} from '@angular/core';
import {catchError, Observable, throwError} from 'rxjs';
import { Supervisor } from "../../../../../core/models/supervisor-model";
import {SupervisorRepository} from '../repositories/supervisor-repository';
import { ErrorService } from "../../../../../core/services/error-service";
import { BaseService } from "../../../../../core/services/base-service";

@Injectable()
export class SupervisorService extends BaseService<Supervisor>{

  constructor(private supervisorRepository: SupervisorRepository) {
    super(supervisorRepository);
  }
}
