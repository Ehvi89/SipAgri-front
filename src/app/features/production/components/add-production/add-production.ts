import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ProductionService} from '../../services/production-service';
import {PlantationService} from '../../../plantation/services/plantation-service';
import {Plantation} from '../../../../core/models/plantation-model';
import {NotificationService} from '../../../../core/services/notification-service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-add-production',
  standalone: false,
  templateUrl: './add-production.html',
  styleUrl: './add-production.scss'
})
export class AddProduction implements OnInit {
  loading$!: Observable<boolean>
  plantations$!: Observable<Plantation[]>

  prodForm!: FormGroup;
  prodCtrl!: FormControl<number | null>;
  plantationCtrl!: FormControl<number | null>;
  dateCtrl!: FormControl<Date | null>;

  constructor(private readonly productionService: ProductionService,
              private readonly plantationService: PlantationService,
              private readonly notifService: NotificationService,
              private readonly formBuilder: FormBuilder,
              private readonly route: ActivatedRoute,) {}

  ngOnInit() {
    this.loading$ = this.productionService.loading$;
    this.plantations$ = this.plantationService.getAll();

    this.prodCtrl = this.formBuilder.control(0, Validators.required);
    this.plantationCtrl = this.formBuilder.control(null, Validators.required);
    this.dateCtrl = this.formBuilder.control(new Date, Validators.required);

    this.prodForm = this.formBuilder.group({
      year: this.dateCtrl,
      productionInKg: this.prodCtrl,
      plantationId: this.plantationCtrl,
    })

    this.route.queryParams.subscribe(params => {
      const plantationId:string = params['plantation'];
      if (plantationId) {
        this.prodForm.patchValue({ plantationId: Number.parseInt(plantationId) });
      }
    });
  }

  addProduction() {
    this.productionService.create(this.prodForm.value).subscribe({
      next: () => {
        this.notifService.showSuccess("Production ajoutée avec succès");
        this.restForm();
      },
      error: (error) => this.notifService.showError(error.message),
    })
  }

  /**
   * Réinitialise le formulaire après soumission
   */
  private restForm() {
    this.prodForm.reset(
      {
        year: new Date(),
        productionInKg: 0,
        plantationId: null
      },
      { emitEvent: false }
    );

    // Réinitialiser complètement le statut
    this.prodForm.markAsPristine();
    this.prodForm.markAsUntouched();

    // Nettoyer les erreurs de chaque control
    Object.keys(this.prodForm.controls).forEach(key => {
      const control = this.prodForm.get(key);
      control?.setErrors(null);
      control?.markAsUntouched();
      control?.markAsPristine();
    });

    // Vérifier si on a un plantationId dans l'URL pour le restaurer
    this.route.queryParams.subscribe(params => {
      const plantationId: string = params['plantation'];
      if (plantationId) {
        this.prodForm.patchValue({ plantationId: Number.parseInt(plantationId) });
      }
    });
  }
}
