import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, combineLatest, map, Observable} from 'rxjs';
import {Production} from '../../../../core/models/production-model';
import {PaginationResponse} from '../../../../core/models/pagination-response-model';
import {ProductionService} from '../../services/production-service';
import {PlantationService} from '../../../plantation/services/plantation-service';
import {PlanterService} from '../../../planter/services/planter-service';
import {NotificationService} from '../../../../core/services/notification-service';

@Component({
  selector: 'app-production-list',
  standalone: false,
  templateUrl: './production-list.html',
  styleUrl: './production-list.scss'
})
export class ProductionList implements OnInit {
  // variables
  loading$!: Observable<boolean>;
  productionsPaged$!: Observable<PaginationResponse<Production>>;
  productions$!: Observable<Production[]>;
  search$ = new BehaviorSubject<string>('');

  // constructor
  constructor(private productionService: ProductionService,
              private plantationService: PlantationService,
              private planterService: PlanterService,
              private notificationService: NotificationService,) {}

  ngOnInit() {
    this.initializeData();
  }

  private initializeData() {
    this.loading$ = this.productionService.loading$;
    this.productionsPaged$ = this.productionService.getAllPaged();

    this.productions$ = combineLatest([
      this.productionService.getAll(),
      this.search$.asObservable()
    ]).pipe(
      map(([production, search]) => {
        return production.filter(production => {
          return !search && production.productionInKg.toString().toLowerCase().includes(search.toLowerCase());
        })
      })
    )
  }

  // load Plantation
  getPlantation(id: number | string) {
    return this.plantationService.getById(id)
  }

  getPlanter(id: number | string) {
    return this.planterService.getById(id)
  }

  // delete production
  deleteProduction(id: number | string) {
    return this.planterService.delete(id).subscribe({
      next: () => this.notificationService.showSuccess('Production supprimée'),
      error: error => this.notificationService.showError(error.message)
    })
  }
}
