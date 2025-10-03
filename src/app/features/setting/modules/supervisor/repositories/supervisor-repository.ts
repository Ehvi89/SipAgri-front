import {Injectable} from '@angular/core';
import { BaseRepository } from "../../../../../core/repositories/base-repository";
import { Supervisor } from "../../../../../core/models/supervisor-model";
import {Observable} from 'rxjs';
import {PaginationResponse} from '../../../../../core/models/pagination-response-model';
import {SupervisorProfile} from '../../../../../core/enums/supervisor-profile';
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../../../environments/environment";

@Injectable()
export class SupervisorRepository extends BaseRepository<Supervisor> {
  protected override endpoint = "supervisors";

  constructor(private http2: HttpClient) {
    super(http2);
  }

  searchWithProfile(search: string, profile: SupervisorProfile, page?: number, size?: number): Observable<PaginationResponse<Supervisor>> {
    const params: any = {};
    if (page !== undefined) params.page = page;
    if (size !== undefined) params.size = size;
    if (profile !== undefined) params.profile = profile;
    params.search = search;

    return this.http2.get<PaginationResponse<Supervisor>>(
      `${environment.apiUrl}/${this.endpoint}/search`,
      { params }
    )
  }
}
