import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, map, delay } from 'rxjs';

import { Resume, ChartData, ProductionData } from '../components/dashbord/dashboard';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly baseUrl = '/api/dashboard'; // Remplacez par votre URL d'API

  constructor(private http: HttpClient) {}

  /**
   * Récupère les statistiques de résumé du dashboard
   */
  getResumesData(): Observable<Resume[]> {
    // return this.http.get<ApiResponse<Resume[]>>(`${this.baseUrl}/resumes`)
    //   .pipe(
    //     map(response => response.data)
    //   );

    // Données mockées pour le développement
    return of([
      {
        name: 'Nombre de planteurs',
        value: '1,234',
        monthlyValue: '+12% ce mois'
      },
      {
        name: 'Production totale',
        value: '45.2T',
        monthlyValue: '+8% ce mois'
      },
      {
        name: 'Revenus générés',
        value: '€125,430',
        monthlyValue: '+15% ce mois'
      },
      {
        name: 'Cultures actives',
        value: '23',
        monthlyValue: '+2 nouvelles'
      }
    ]).pipe(delay(500));
  }

  /**
   * Récupère les données de production par période
   */
  getProductionByPeriod(period: string = 'mois'): Observable<ChartData[]> {
    const params = new HttpParams().set('period', period);

    // return this.http.get<ApiResponse<ChartData[]>>(`${this.baseUrl}/production-by-period`, { params })
    //   .pipe(
    //     map(response => response.data)
    //   );

    // Données mockées basées sur la période sélectionnée
    const mockData = this.generateMockProductionData(period);
    return of(mockData).pipe(delay(300));
  }

  /**
   * Récupère la répartition par culture
   */
  getCulturalDistribution(): Observable<ChartData[]> {
    // return this.http.get<ApiResponse<ChartData[]>>(`${this.baseUrl}/cultural-distribution`)
    //   .pipe(
    //     map(response => response.data)
    //   );

    // Données mockées
    return of([
      { name: 'Cacao', value: 45, color: '#8B4513' },
      { name: 'Café', value: 25, color: '#6F4E37' },
      { name: 'Palmier à huile', value: 15, color: '#228B22' },
      { name: 'Hévéa', value: 10, color: '#2F4F4F' },
      { name: 'Autres', value: 5, color: '#696969' }
    ]).pipe(delay(400));
  }

  /**
   * Récupère les données de tendance de production
   */
  getProductionTrend(months: number = 12): Observable<ProductionData[]> {
    const params = new HttpParams().set('months', months.toString());

    // return this.http.get<ApiResponse<ProductionData[]>>(`${this.baseUrl}/production-trend`, { params })
    //   .pipe(
    //     map(response => response.data)
    //   );

    // Données mockées
    return of(this.generateMockTrendData(months)).pipe(delay(600));
  }

  /**
   * Récupère les statistiques détaillées d'un planteur
   */
  getPlanterDetails(planterId: string): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/planter/${planterId}`)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Récupère les données de production par région
   */
  getProductionByRegion(): Observable<ChartData[]> {
    // return this.http.get<ApiResponse<ChartData[]>>(`${this.baseUrl}/production-by-region`)
    //   .pipe(
    //     map(response => response.data)
    //   );

    // Données mockées
    return of([
      { name: 'Abidjan', value: 28 },
      { name: 'Bouaké', value: 22 },
      { name: 'Yamoussoukro', value: 18 },
      { name: 'San-Pédro', value: 15 },
      { name: 'Korhogo', value: 12 },
      { name: 'Autres', value: 5 }
    ]).pipe(delay(400));
  }

  /**
   * Récupère les données de performance mensuelle
   */
  getMonthlyPerformance(): Observable<any[]> {
    return of([
      { month: 'Jan', production: 3.2, revenue: 8500, planters: 45 },
      { month: 'Fév', production: 3.8, revenue: 9200, planters: 48 },
      { month: 'Mar', production: 4.1, revenue: 10100, planters: 52 },
      { month: 'Avr', production: 3.9, revenue: 9800, planters: 50 },
      { month: 'Mai', production: 4.5, revenue: 11200, planters: 55 },
      { month: 'Juin', production: 4.2, revenue: 10800, planters: 53 }
    ]).pipe(delay(500));
  }

  /**
   * Exporte les données du dashboard
   */
  exportDashboardData(format: 'excel' | 'pdf' | 'csv'): Observable<Blob> {
    const params = new HttpParams().set('format', format);
    return this.http.get(`${this.baseUrl}/export`, {
      params,
      responseType: 'blob'
    });
  }

  // Méthodes privées pour générer des données mockées

  private generateMockProductionData(period: string): ChartData[] {
    const baseData: Record<string, ChartData[]> = {
      semaine: [
        { name: 'Sem 1', value: 2.1 },
        { name: 'Sem 2', value: 2.5 },
        { name: 'Sem 3', value: 1.8 },
        { name: 'Sem 4', value: 3.2 }
      ],
      mois: [
        { name: 'Jan', value: 8.5 },
        { name: 'Fév', value: 9.2 },
        { name: 'Mar', value: 7.8 },
        { name: 'Avr', value: 10.1 },
        { name: 'Mai', value: 11.3 },
        { name: 'Juin', value: 9.7 }
      ],
      trimestre: [
        { name: 'T1 2024', value: 25.5 },
        { name: 'T2 2024', value: 31.1 },
        { name: 'T3 2024', value: 28.9 },
        { name: 'T4 2023', value: 22.3 }
      ],
      annee: [
        { name: '2021', value: 89.2 },
        { name: '2022', value: 95.8 },
        { name: '2023', value: 102.5 },
        { name: '2024', value: 108.1 }
      ]
    };

    return baseData[period] || baseData["mois"];
  }

  private generateMockTrendData(months: number): ProductionData[] {
    const data: ProductionData[] = [];
    const currentDate = new Date();

    for (let i = months; i >= 1; i--) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);

      const monthNames = [
        'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
        'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
      ];

      // Simulation d'une tendance avec variations saisonnières
      const baseValue = 8 + Math.sin((date.getMonth() / 12) * 2 * Math.PI) * 2;
      const randomVariation = (Math.random() - 0.5) * 1.5;

      data.push({
        period: `${monthNames[date.getMonth()]} ${date.getFullYear()}`,
        value: Math.round((baseValue + randomVariation) * 10) / 10,
        culture: 'Toutes cultures'
      });
    }

    return data;
  }

  /**
   * Méthode utilitaire pour la gestion d'erreurs
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return of(result as T);
    };
  }
}
