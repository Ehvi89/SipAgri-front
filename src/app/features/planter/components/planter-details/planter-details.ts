import {ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {Planter} from '../../../../core/models/planter-model';
import {GeocodingService} from '../../../../core/services/geocoding-service';
import {finalize, forkJoin, map, Observable, take, tap} from 'rxjs';
import {PlanterService} from '../../services/planter-service';
import {NotificationService} from '../../../../core/services/notification-service';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogService} from '../../../../share/services/dialog-service';
import {MaritalStatus} from '../../../../core/enums/marital-status-enum';
import {Gender} from '../../../../core/enums/gender-enum';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Supervisor} from '../../../../core/models/supervisor-model';
import {SupervisorService} from '../../../setting/modules/supervisor/services/supervisor-service';
import {MatDialog} from '@angular/material/dialog';
import {SAError} from '../../../../core/services/error-service';

@Component({
  selector: 'app-planter-details',
  standalone: false,
  templateUrl: './planter-details.html',
  styleUrl: './planter-details.scss'
})
export class PlanterDetails implements OnInit {
  @ViewChild('modificationDialog') modificationDialog!: TemplateRef<any>;

  planter!: Planter;
  plantationsWithVillage: any[] = [];
  loading = false;
  loadingUpdate!: Observable<boolean>

  planterForm!: FormGroup;
  supervisors$!: Observable<Supervisor[]>;
  villages: string[] = ["Bonoua", "Samo", "Anyama", "Kokondékro", "Nangassérégué"];
  maritalStatusOptions = [
    { value: MaritalStatus.SINGLE, label: 'Célibataire' },
    { value: MaritalStatus.MARRIED, label: 'Marié(e)' },
    { value: MaritalStatus.DIVORCED, label: 'Divorcé(e)' },
    { value: MaritalStatus.WIDOWED, label: 'Veuf/Veuve' }
  ];
  gender = Gender;

  constructor(private readonly geocodingService: GeocodingService,
              private readonly planterService: PlanterService,
              private readonly cdr: ChangeDetectorRef,
              private readonly notifService: NotificationService,
              private readonly router: Router,
              private readonly dialogService: DialogService,
              private readonly supervisorService: SupervisorService,
              private readonly dialog: MatDialog,
              private readonly formBuilder: FormBuilder,
              private readonly route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const planterId: string = params['planter'];
      if (planterId) {
        this.planterService.getById(planterId)
          .subscribe(planter => this.planter = planter);
      }
    });
    this.loadingUpdate = this.planterService.loading$;
    if (this.planter?.plantations) {
      this.loading = true;
      const villageRequests = this.planter.plantations.map(plantation =>
        this.geocodingService.getPlaceName(plantation.gpsLocation).pipe(
          map(village => ({
            ...plantation,
            village: village
          })) ?? []
        )
      );

      forkJoin(villageRequests).pipe(
        take(1),
        tap(results => {
          this.plantationsWithVillage = results;
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      ).subscribe();
    }
  }

  initForm(): void {
    this.planterForm = this.formBuilder.group({
      firstname: [this.planter?.firstname, [Validators.required, Validators.minLength(2)]],
      lastname: [this.planter?.lastname, [Validators.required, Validators.minLength(2)]],
      birthday: [this.planter?.birthday, Validators.required],
      gender: [this.planter?.gender, Validators.required],
      maritalStatus: [this.planter?.maritalStatus, Validators.required],
      childrenNumber: [this.planter?.childrenNumber, [Validators.required, Validators.min(0)]],
      village: [this.planter?.village, Validators.required],
      supervisor: [this.planter.supervisor, Validators.required]
    });
  }

  modifyPlanter(): void {
    this.initForm();
    this.supervisors$ = this.supervisorService.getAll();
    this.dialog.open(this.modificationDialog).afterClosed().subscribe((result: boolean) => {
      if (result) {
        const planter = {
          id: this.planter?.id,
          ...this.planterForm.value,
        }
        this.planterService.partialUpdate(planter.id, planter).pipe(
          tap((planter: Planter) => {
            this.planter = planter;
            this.cdr.detectChanges();
          })
        ).subscribe({
          next: () => this.notifService.showSuccess("Planteur mis à jour"),
          error: (error: SAError) => this.notifService.showError(error.message),
        });
      }
    })
  }

  getTotalSurface(): number {
    let total = 0;
    if (this.planter?.plantations != null && this.planter?.plantations?.length > 0) {
      for (let plantation of this.planter.plantations) {
        total += plantation.farmedArea;
      }
    }

    return total;
  }

  getAnnualProduction(): number {
    if (!this.planter?.plantations?.length) return 0;

    const yearlyTotals: { [year: number]: number } = {};

    for (const plantation of this.planter.plantations) {
      if (!plantation.productions?.length) continue;

      for (const production of plantation.productions) {
        // Normaliser l'année en number
        const year = production.year instanceof Date
          ? production.year.getFullYear()
          : +production.year;

        if (!yearlyTotals[year]) yearlyTotals[year] = 0;
        yearlyTotals[year] += production.productionInKg;
      }
    }

    // Calcul de la moyenne annuelle
    const years = Object.keys(yearlyTotals);
    if (years.length === 0) return 0;

    const total = years.reduce((sum, y) => sum + yearlyTotals[+y], 0);
    return total / years.length;
  }

  deletePlanter() {
    this.dialogService.showDialog({
      title: 'Confirmation',
      message: 'Voulez-vous vraiment supprimer ce planteur ?',
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      deletion: true
    }).subscribe((result: boolean) => {
      if (result) {
        this.planterService.delete(this.planter.id!).subscribe({
          next:() => this.router.navigateByUrl('/planters').then(r => null)
        });
      }
    });
  }



  getMaritalStatusLabel(value: MaritalStatus | undefined): string {
    switch (value) {
      case MaritalStatus.MARRIED:
        return 'Marié(e)';
      case MaritalStatus.DIVORCED:
        return 'Divorcé(e)';
      case MaritalStatus.SINGLE:
        return 'Célibataire';
      case MaritalStatus.WIDOWED:
        return 'Veuf/Veuve';
      default:
        return '';
    }
  }
  addPlantation() {
    this.router.navigate(['/plantations/add'], {
      queryParams: { planter: this.planter.id }
    }).then();
  }
}
