import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

import { DashboardService } from '../../services/dashboard-service';
import {Observable} from 'rxjs';

// Enregistrer les composants Chart.js
Chart.register(...registerables);

export interface Resume {
  name: string;
  value: string;
  monthlyValue: string;
}

export interface ChartData {
  name: string;
  value: number;
  period?: string;
  color?: string;
}

export interface ProductionData {
  period: string;
  value: number;
  culture: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('barCanvas') barCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieCanvas') pieCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineCanvas') lineCanvas!: ElementRef<HTMLCanvasElement>;

  // Instances des graphiques
  private barChart?: Chart;
  private pieChart?: Chart;
  private lineChart?: Chart;

  resumes$!: Observable<Resume[]>;
  productionByPeriod: ChartData[] = [];
  culturalDistribution: ChartData[] = [];
  productionTrend: ProductionData[] = [];

  selectedPeriodFilter: string = 'mois';
  periodFilters = [
    { value: 'semaine', label: 'Par semaine' },
    { value: 'mois', label: 'Par mois' },
    { value: 'trimestre', label: 'Par trimestre' },
    { value: 'annee', label: 'Par année' }
  ];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    // Initialiser les graphiques après que la vue soit prête
    setTimeout(() => {
      this.initializeCharts();
    }, 100);
  }

  ngOnDestroy(): void {
    // Nettoyer les graphiques
    this.destroyCharts();
  }

  private loadDashboardData(): void {
    // Charger les statistiques de résumé
    this.resumes$ = this.dashboardService.getResumesData();

    // Charger les données de production par période
    this.loadProductionByPeriod();

    // Charger la répartition par culture
    this.dashboardService.getCulturalDistribution().subscribe({
      next: (data) => {
        this.culturalDistribution = data;
        this.updatePieChart();
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la répartition:', error);
      }
    });

    // Charger la tendance de production
    this.dashboardService.getProductionTrend().subscribe({
      next: (data) => {
        this.productionTrend = data;
        this.updateLineChart();
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la tendance:', error);
      }
    });
  }

  private loadProductionByPeriod(): void {
    this.dashboardService.getProductionByPeriod(this.selectedPeriodFilter).subscribe({
      next: (data) => {
        this.productionByPeriod = data;
        this.updateBarChart();
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la production:', error);
      }
    });
  }

  onPeriodFilterChange(): void {
    this.loadProductionByPeriod();
  }

  private initializeCharts(): void {
    this.createBarChart();
    this.createPieChart();
    this.createLineChart();
  }

  private createBarChart(): void {
    if (!this.barCanvas) return;

    const ctx = this.barCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [
            '#3b82f6',
            '#10b981',
            '#f59e0b',
            '#ef4444',
            '#8b5cf6',
            '#06b6d4'
          ],
          borderColor: '#ffffff',
          borderWidth: 2,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                return `Production: ${context.parsed.y} tonnes`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#f3f4f6'
            },
            ticks: {
              font: {
                size: 12
              },
              callback: function(value) {
                return value + 'T';
              }
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 12
              }
            }
          }
        }
      }
    };

    this.barChart = new Chart(ctx, config);
  }

  private createPieChart(): void {
    if (!this.pieCanvas) return;

    const ctx = this.pieCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [
            '#8B4513',
            '#6F4E37',
            '#228B22',
            '#2F4F4F',
            '#696969',
            '#FF6347'
          ],
          borderColor: '#ffffff',
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              font: {
                size: 12
              },
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed;
                const total = context.dataset.data.reduce((a: any, b: any) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${percentage}%`;
              }
            }
          }
        },
        cutout: '50%'
      }
    };

    this.pieChart = new Chart(ctx, config);
  }

  private createLineChart(): void {
    if (!this.lineCanvas) return;

    const ctx = this.lineCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Production (tonnes)',
          data: [],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                return `Production: ${context.parsed.y} tonnes`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#f3f4f6'
            },
            ticks: {
              font: {
                size: 12
              },
              callback: function(value) {
                return value + 'T';
              }
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 12
              }
            }
          }
        },
        elements: {
          point: {
            hoverBackgroundColor: '#10b981'
          }
        }
      }
    };

    this.lineChart = new Chart(ctx, config);
  }

  private updateBarChart(): void {
    if (!this.barChart || this.productionByPeriod.length === 0) return;

    this.barChart.data.labels = this.productionByPeriod.map(item => item.name);
    this.barChart.data.datasets[0].data = this.productionByPeriod.map(item => item.value);
    this.barChart.update('none');
  }

  private updatePieChart(): void {
    if (!this.pieChart || this.culturalDistribution.length === 0) return;

    this.pieChart.data.labels = this.culturalDistribution.map(item => item.name);
    this.pieChart.data.datasets[0].data = this.culturalDistribution.map(item => item.value);
    this.pieChart.update('none');
  }

  private updateLineChart(): void {
    if (!this.lineChart || this.productionTrend.length === 0) return;

    this.lineChart.data.labels = this.productionTrend.map(item => item.period);
    this.lineChart.data.datasets[0].data = this.productionTrend.map(item => item.value);
    this.lineChart.update('none');
  }

  private destroyCharts(): void {
    if (this.barChart) {
      this.barChart.destroy();
    }
    if (this.pieChart) {
      this.pieChart.destroy();
    }
    if (this.lineChart) {
      this.lineChart.destroy();
    }
  }

  // Méthodes utilitaires pour le formatage
  formatNumber(value: number): string {
    return new Intl.NumberFormat('fr-FR').format(value);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  }
}
