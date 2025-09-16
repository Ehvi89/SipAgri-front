import {ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {BehaviorSubject, combineLatest, map, Observable} from 'rxjs';
import {Production} from '../../../../core/models/production-model';
import {PaginationResponse} from '../../../../core/models/pagination-response-model';
import {ProductionService} from '../../services/production-service';
import {PlantationService} from '../../../plantation/services/plantation-service';
import {PlanterService} from '../../../planter/services/planter-service';
import {NotificationService} from '../../../../core/services/notification-service';
import {Planter} from '../../../../core/models/planter-model';
import {Plantation} from '../../../../core/models/plantation-model';
import {DialogService} from '../../../../share/services/dialog-service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SAError} from '../../../../core/services/error-service';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-production-list',
  standalone: false,
  templateUrl: './production-list.html',
  styleUrl: './production-list.scss'
})
export class ProductionList implements OnInit {
  @ViewChild('modificationDialog') modificationDialog!: TemplateRef<any>;

  // variables
  loading$!: Observable<boolean>;
  productionsPaged$!: Observable<PaginationResponse<Production>>;
  productions$!: Observable<Production[]>;
  search$ = new BehaviorSubject<string>('');

  plantationsMap$ = new BehaviorSubject<Map<number, Plantation>>(new Map());
  plantersMap$ = new BehaviorSubject<Map<number, Planter>>(new Map());

  // form variables
  prodForm!: FormGroup;
  plantations$!: Observable<Plantation[]>;

  // constructor
  constructor(private productionService: ProductionService,
              private plantationService: PlantationService,
              private planterService: PlanterService,
              private notificationService: NotificationService,
              private cdr: ChangeDetectorRef,
              private dialogService: DialogService,
              private formBuilder: FormBuilder,
              private dialog: MatDialog,) {}

  ngOnInit() {
    this.initializeData();
    this.initializeMap();
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
  private initializeMap() {
    this.productionsPaged$.subscribe(page => {
      if (page?.data) {
        page.data.forEach(production => {
          if (!this.plantationsMap$.value.has(production.plantationId)) {
            this.plantationService.getById(production.plantationId).subscribe(plantation => {
              const updated = new Map(this.plantationsMap$.value);
              updated.set(production.plantationId, plantation);
              this.plantationsMap$.next(updated);

              if (plantation.planterId && !this.plantersMap$.value.has(plantation.planterId)) {
                this.planterService.getById(plantation.planterId).subscribe(planter => {
                  const updatedPlanters = new Map(this.plantersMap$.value);
                  updatedPlanters.set(plantation.planterId, planter);
                  this.plantersMap$.next(updatedPlanters);
                });
              }
            });
          }
        });
      }
    });
  }
  private initializeForm(production: Production) {
    this.plantations$ = this.plantationService.getAll();

    this.prodForm = this.formBuilder.group({
      year: this.formBuilder.control(production.year, [Validators.required]),
      productionInKg: this.formBuilder.control(production.productionInKg, [Validators.required]),
      plantationId: this.formBuilder.control(production.plantationId, [Validators.required]),
    })
  }

  // delete production
  deleteProduction(id: number | string) {
    this.dialogService.showDialog({
      title: 'Confirmation',
      message: 'Voulez-vous vraiment supprimer cette production ?',
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      deletion: true
    }).subscribe((result: boolean) => {
      if (result) {
        this.productionService.delete(id).subscribe({
          next: () => {
            this.cdr.detectChanges();
            this.notificationService.showSuccess('Production supprimée');
          },
          error: error => this.notificationService.showError(error.message)
        });
      }
    });
  }

  modifyProduction(production: Production): void {
    this.initializeForm(production);

    this.dialog.open(this.modificationDialog).afterClosed().subscribe((result: boolean) => {
      if (result) {
        const prod = {
          id: production.id,
          ...this.prodForm.value,
        }
        this.productionService.update(prod.id, prod).subscribe({
          next: () => {
            this.notificationService.showSuccess("Production mise à jour");
            // Recharger les données
            this.productionsPaged$ = this.productionService.getAllPaged();
            this.cdr.detectChanges();
          },
          error: (error: SAError) => this.notificationService.showError(error.message),
        });
      }
    });
  }

}
