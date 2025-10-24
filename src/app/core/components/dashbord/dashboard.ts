import {Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, ChangeDetectorRef} from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { DashboardService } from '../../services/dashboard-service';
import {forkJoin, Observable} from 'rxjs';

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

export interface ProductionTrendData {
  period: string;
  value: number;
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

  // Flags pour savoir si les graphiques sont initialisés
  private chartsInitialized = false;
  private viewInitialized = false;

  resumes$!: Observable<Resume[]>;
  productionBySector: ChartData[] = []; // ✨ MODIFIÉ : Production par secteur au lieu grâce à période
  productionByPlantation: ChartData[] = [];
  productionTrend: ProductionTrendData[] = [];

  // ✨ NOUVEAU : Années disponibles et filtre sélectionné
  availableYears: number[] = [];
  selectedYearFilter: number = 0;

  // Flags pour le chargement
  isLoadingData = true;

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;

    // Attendre un tick pour s'assurer que les canvas sont dans le DOM
    setTimeout(() => {
      // Initialiser les graphiques vides
      this.initializeEmptyCharts();

      // Si les données sont déjà chargées, les afficher
      if (!this.isLoadingData) {
        this.updateAllCharts();
      }
    }, 0);
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  private loadDashboardData(): void {
    this.isLoadingData = true;

    // Charger les statistiques de résumé
    this.resumes$ = this.dashboardService.getResumesData();

    // Charger toutes les données en parallèle
    forkJoin({
      years: this.dashboardService.getAvailableYears(), // ✨ NOUVEAU
      sectorData: this.dashboardService.getProductionBySector(), // ✨ MODIFIÉ
      plantationData: this.dashboardService.getProductionByPlantation(),
      trendData: this.dashboardService.getProductionTrend() // ✨ MODIFIÉ : Plus de paramètre months
    }).subscribe({
      next: (data) => {
        this.availableYears = data.years; // ✨ NOUVEAU
        this.productionBySector = data.sectorData; // ✨ MODIFIÉ
        this.productionByPlantation = data.plantationData;
        this.productionTrend = data.trendData;
        this.isLoadingData = false;

        // Si la vue est prête, mettre à jour les graphiques
        if (this.viewInitialized && this.chartsInitialized) {
          this.updateAllCharts();
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des données:', error);
        this.isLoadingData = false;
      }
    });
  }

  private initializeEmptyCharts(): void {
    if (this.chartsInitialized) {
      return;
    }

    try {
      this.createBarChart();
      this.createPieChart();
      this.createLineChart();

      this.chartsInitialized = true;
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des graphiques:', error);
    }
  }

  private updateAllCharts(): void {
    this.updateBarChart();
    this.updatePieChart();
    this.updateLineChart();
  }

  /**
   * ✨ NOUVEAU : Gestion du changement de filtre année
   */
  onYearFilterChange(): void {

    this.dashboardService.getProductionBySector(this.selectedYearFilter === 0 ? undefined : this.selectedYearFilter).subscribe({
      next: (data) => {
        this.productionBySector = data;
        this.updateBarChart();
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement de la production par secteur:', error);
      }
    });
  }

  /**
   * ✨ NOUVEAU : Réinitialiser le filtre année
   */
  resetYearFilter(): void {
    this.selectedYearFilter = 0;
    this.onYearFilterChange();
  }

  private createBarChart(): void {
    if (!this.barCanvas?.nativeElement) {
      console.error('❌ Canvas barChart introuvable');
      return;
    }

    const ctx = this.barCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('❌ Impossible d\'obtenir le contexte 2D pour barChart');
      return;
    }

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
            '#06b6d4',
            '#ec4899',
            '#14b8a6'
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
                return `Production: ${context.parsed.y.toFixed(2)} kg`;
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
              callback: (value) => `${value} kg`
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
    if (!this.pieCanvas?.nativeElement) {
      console.error('❌ Canvas pieChart introuvable');
      return;
    }

    const ctx = this.pieCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('❌ Impossible d\'obtenir le contexte 2D pour pieChart');
      return;
    }

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
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
            '#06b6d4',
            '#ec4899',
            '#14b8a6'
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
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                return `${label}: ${value.toFixed(2)} kg (${percentage}%)`;
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
    if (!this.lineCanvas?.nativeElement) {
      console.error('❌ Canvas lineChart introuvable');
      return;
    }

    const ctx = this.lineCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('❌ Impossible d\'obtenir le contexte 2D pour lineChart');
      return;
    }

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Production (kg)',
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
                return `Production: ${context.parsed.y.toFixed(2)} kg`;
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
              callback: (value) => `${value} kg`
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
    if (!this.barChart) {
      console.warn('⚠️ barChart pas encore initialisé');
      return;
    }

    if (this.productionBySector.length === 0) {
      console.log('⚠️ Pas de données pour barChart');
      return;
    }

    this.barChart.data.labels = this.productionBySector.map(item => item.name);
    this.barChart.data.datasets[0].data = this.productionBySector.map(item => item.value);
    this.barChart.update('active');
  }

  private updatePieChart(): void {
    if (!this.pieChart) {
      console.warn('⚠️ pieChart pas encore initialisé');
      return;
    }

    if (this.productionByPlantation.length === 0) {
      console.log('⚠️ Pas de données pour pieChart');
      return;
    }

    this.pieChart.data.labels = this.productionByPlantation.map(item => item.name);
    this.pieChart.data.datasets[0].data = this.productionByPlantation.map(item => item.value);
    this.pieChart.update('active');
  }

  private updateLineChart(): void {
    if (!this.lineChart) {
      console.warn('⚠️ lineChart pas encore initialisé');
      return;
    }

    if (this.productionTrend.length === 0) {
      console.log('⚠️ Pas de données pour lineChart');
      return;
    }

    this.lineChart.data.labels = this.productionTrend.map(item => item.period);
    this.lineChart.data.datasets[0].data = this.productionTrend.map(item => item.value);
    this.lineChart.update('active');
  }

  private destroyCharts(): void {
    if (this.barChart) {
      this.barChart.destroy();
      this.barChart = undefined;
    }
    if (this.pieChart) {
      this.pieChart.destroy();
      this.pieChart = undefined;
    }
    if (this.lineChart) {
      this.lineChart.destroy();
      this.lineChart = undefined;
    }
    this.chartsInitialized = false;
  }
}
