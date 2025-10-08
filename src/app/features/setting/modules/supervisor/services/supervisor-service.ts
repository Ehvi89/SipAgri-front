import {Injectable} from '@angular/core';
import {catchError, finalize, Observable, tap, throwError} from 'rxjs';
import { Supervisor } from "../../../../../core/models/supervisor-model";
import {SupervisorRepository} from '../repositories/supervisor-repository';
import { ErrorService } from "../../../../../core/services/error-service";
import { BaseService } from "../../../../../core/services/base-service";
import {SupervisorProfile} from '../../../../../core/enums/supervisor-profile';

@Injectable()
export class SupervisorService extends BaseService<Supervisor>{

  constructor(private supervisorRepository: SupervisorRepository,
              private errorSer: ErrorService) {
    super(supervisorRepository);
  }

  searchWithFilter(search: string, profile: SupervisorProfile | 'ALL' | null, page?: number, size?: number) {
    if (profile === 'ALL' || profile === null) {
      super.search(search, page, size);
    } else {
      super.setLoading(true);
      this.supervisorRepository.searchWithProfile(search, profile, page, size).pipe(
        tap(supervisors => super.setPagedData(supervisors)),
        catchError(err => throwError(() => this.errorSer.handleError(err))),
        finalize(() => super.setLoading(false))
      ).subscribe();
    }
  }
}
