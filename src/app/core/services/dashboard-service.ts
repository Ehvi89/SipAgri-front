import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { Resume, ChartData, ProductionTrendData } from '../components/dashbord/dashboard';
import { AuthService } from '../../features/auth/services/auth-service';
import {environment} from '../../../environments/environment';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly baseUrl = `${environment.apiUrl}/dashboard`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Retrieves resume data from the server.
   *
   * @return {Observable<Resume[]>} An observable emitting an array of resumes.
   */
  getResumesData(): Observable<Resume[]> {
    const currentUser = AuthService.getCurrentUser();
    if(currentUser.profile === "SUPERVISOR") {
      return this.http.get<ApiResponse<Resume[]>>(`${this.baseUrl}/resumes-by-supervisor`,
        {params: {supervisor: String(currentUser.id)}})
        .pipe(
          map(response => response.data)
        );
    }
    return this.http.get<ApiResponse<Resume[]>>(`${this.baseUrl}/resumes`)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Retrieves production data based on a specified period.
   *
   * @param {string} [period='month'] Defines the time period for the production data. Defaults to 'month' if not specified.
   * @return {Observable<ChartData[]>} An observable emitting an array of chart data representing the production for the given period.
   */
  getProductionByPeriod(period: string = 'month'): Observable<ChartData[]> {
    const params: any = {};
    const currentUser = AuthService.getCurrentUser();
    params.period = period;
    if (currentUser.profile === "SUPERVISOR") {
      params.supervisor = currentUser.id;
    }

    return this.http.get<ApiResponse<ChartData[]>>(`${this.baseUrl}/production-by-period`, { params })
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Fetches production data associated with plantations from the server.
   *
   * @return {Observable<ChartData[]>} An observable that emits an array of ChartData objects containing production details.
   */
  getProductionByPlantation(): Observable<ChartData[]> {
    const params: any = {};
    const currentUser = AuthService.getCurrentUser();
    if (currentUser.profile === "SUPERVISOR") {
      params.supervisor = currentUser.id;
    }
    return this.http.get<ApiResponse<ChartData[]>>(`${this.baseUrl}/production-by-plantation`, { params })
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Retrieves the production trend data from the API.
   *
   * @return {Observable<ProductionTrendData[]>} An observable that emits an array of production trend data.
   */
  getProductionTrend(): Observable<ProductionTrendData[]> {
    const params: any = {};
    const currentUser = AuthService.getCurrentUser();
    if (currentUser.profile === "SUPERVISOR") {
      params.supervisor = currentUser.id;
    }
    return this.http.get<ApiResponse<ProductionTrendData[]>>(`${this.baseUrl}/production-trend`, { params })
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Retrieves production data grouped by sector for a specified year, if provided.
   *
   * @param {number} [year] - The optional year for which production data is to be retrieved. If not provided, data might represent all available years.
   * @return {Observable<ChartData[]>} An observable containing an array of chart data representing production by sector.
   */
  getProductionBySector(year?: number): Observable<ChartData[]> {
    let params = new HttpParams();
    const currentUser = AuthService.getCurrentUser();
    if (year) {
      params = params.set('year', year.toString());
    }
    if (currentUser.profile === "SUPERVISOR") {
      params = params.set('supervisor', currentUser.id!.toString())
    }

    return this.http.get<ApiResponse<ChartData[]>>(`${this.baseUrl}/production-by-sector`, { params })
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Retrieves a list of available years from the API.
   *
   * @return {Observable<number[]>} An observable stream containing an array of years.
   */
  getAvailableYears(): Observable<number[]> {
    const params: any = {};
    const currentUser = AuthService.getCurrentUser();
    if (currentUser.profile === "SUPERVISOR") {
      params.supervisor = currentUser.id;
    }
    return this.http.get<ApiResponse<number[]>>(`${this.baseUrl}/available-years`, { params })
      .pipe(
        map(response => response.data)
      );
  }
}
