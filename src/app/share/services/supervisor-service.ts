import {Injectable} from '@angular/core';
import {catchError, Observable, throwError} from 'rxjs';
import { Supervisor } from "../../core/models/supervisor-model";
import {SupervisorRepository} from '../repositories/supervisor-repository';
import { ErrorService } from "../../core/services/error-service";

@Injectable()
export class SupervisorService {

  constructor(private supervisorRepository: SupervisorRepository,
              private errorService: ErrorService) {}

  getAllSupervisors(): Observable<Supervisor[]> {
    return this.supervisorRepository.getAll().pipe(
      catchError(error => throwError(() => this.errorService.handleError(error)))
    )
  }
}
