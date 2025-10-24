import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { Resume, ChartData, ProductionTrendData } from '../components/dashbord/dashboard';
import { Planter } from '../models/planter-model';
import { Production } from '../models/production-model';
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
   * Récupère les statistiques de résumé du dashboard
   * - Nombre total de planteurs
   * - Production totale (somme de toutes les productions en kg)
   * - Revenus générés (somme de productionInKg * purchasePrice)
   * - Nombre de plantations actives
   */
  getResumesData(): Observable<Resume[]> {
    return this.http.get<ApiResponse<Resume[]>>(`${this.baseUrl}/resumes`)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Récupère les données de production groupées par période
   * @param period - 'week', 'month', 'quarter', ou 'year'
   * Agrège les productions par période selon le champ year de Production
   */
  getProductionByPeriod(period: string = 'month'): Observable<ChartData[]> {
    const params = new HttpParams().set('period', period);

    return this.http.get<ApiResponse<ChartData[]>>(`${this.baseUrl}/production-by-period`, { params })
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Récupère la répartition de production par plantation
   * Retourne le nom de chaque plantation avec sa production totale
   */
  getProductionByPlantation(): Observable<ChartData[]> {
    return this.http.get<ApiResponse<ChartData[]>>(`${this.baseUrl}/production-by-plantation`)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Récupère les données de tendance de production dans le temps
   * Basé sur le champ year des productions
   */
  getProductionTrend(): Observable<ProductionTrendData[]> {
    return this.http.get<ApiResponse<ProductionTrendData[]>>(`${this.baseUrl}/production-trend`)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * ✨ NOUVEAU : Récupère la production par secteur avec filtre année
   */
  getProductionBySector(year?: number): Observable<ChartData[]> {
    let params = new HttpParams();
    if (year) {
      params = params.set('year', year.toString());
    }

    return this.http.get<ApiResponse<ChartData[]>>(`${this.baseUrl}/production-by-sector`, { params })
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * ✨ NOUVEAU : Récupère la liste des années disponibles
   */
  getAvailableYears(): Observable<number[]> {
    return this.http.get<ApiResponse<number[]>>(`${this.baseUrl}/available-years`)
      .pipe(
        map(response => response.data)
      );
  }
}
