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
   * @param months - Nombre de mois à afficher (par défaut 12)
   */
  getProductionTrend(months: number = 12): Observable<ProductionTrendData[]> {
    const params = new HttpParams().set('months', months.toString());

    return this.http.get<ApiResponse<ProductionTrendData[]>>(`${this.baseUrl}/production-trend`, { params })
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Récupère les détails d'un planteur avec ses plantations et productions
   */
  getPlanterDetails(planterId: number): Observable<Planter> {
    return this.http.get<ApiResponse<Planter>>(`${this.baseUrl}/planter/${planterId}`)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Récupère les planteurs avec le plus de production
   * @param limit - Nombre de planteurs à retourner
   */
  getTopPlanters(limit: number = 10): Observable<ChartData[]> {
    const params = new HttpParams().set('limit', limit.toString());

    return this.http.get<ApiResponse<ChartData[]>>(`${this.baseUrl}/top-planters`, { params })
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Récupère les plantations avec le plus de surface cultivée
   * @param limit - Nombre de plantations à retourner
   */
  getTopPlantationsByArea(limit: number = 10): Observable<ChartData[]> {
    const params = new HttpParams().set('limit', limit.toString());

    return this.http.get<ApiResponse<ChartData[]>>(`${this.baseUrl}/top-plantations-by-area`, { params })
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Récupère les statistiques de paiement
   * Nombre de productions payées vs non payées basé sur mustBePaid
   */
  getPaymentStatistics(): Observable<{ paid: number; unpaid: number; total: number }> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/payment-statistics`)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Récupère la répartition des planteurs par village
   */
  getPlantersByVillage(): Observable<ChartData[]> {
    return this.http.get<ApiResponse<ChartData[]>>(`${this.baseUrl}/planters-by-village`)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Récupère la production moyenne par hectare
   * Calculé comme : production totale / surface cultivée totale
   */
  getAverageProductionPerHectare(): Observable<number> {
    return this.http.get<ApiResponse<number>>(`${this.baseUrl}/avg-production-per-hectare`)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Récupère le prix d'achat moyen par kg
   */
  getAveragePurchasePrice(): Observable<number> {
    return this.http.get<ApiResponse<number>>(`${this.baseUrl}/avg-purchase-price`)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Récupère les productions récentes
   * @param limit - Nombre de productions à retourner
   */
  getRecentProductions(limit: number = 10): Observable<Production[]> {
    const params = new HttpParams().set('limit', limit.toString());

    return this.http.get<ApiResponse<Production[]>>(`${this.baseUrl}/recent-productions`, { params })
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Exporte les données du dashboard
   * @param format - Format d'export: 'excel', 'pdf', ou 'csv'
   */
  exportDashboardData(format: 'excel' | 'pdf' | 'csv'): Observable<Blob> {
    const params = new HttpParams().set('format', format);
    return this.http.get(`${this.baseUrl}/export`, {
      params,
      responseType: 'blob'
    });
  }

  /**
   * Récupère les statistiques démographiques des planteurs
   * Répartition par genre, statut marital, etc.
   */
  getPlanterDemographics(): Observable<{
    byGender: ChartData[];
    byMaritalStatus: ChartData[];
    averageAge: number;
    averageChildren: number;
  }> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/planter-demographics`)
      .pipe(
        map(response => response.data)
      );
  }
}
