import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ProductionService} from '../../services/production-service';
import {PlantationService} from '../../../plantation/services/plantation-service';
import {Plantation} from '../../../../core/models/plantation-model';
import {NotificationService} from '../../../../core/services/notification-service';

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

  constructor(private productionService: ProductionService,
              private plantationService: PlantationService,
              private notifService: NotificationService,
              private formBuilder: FormBuilder) {}

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

  private restForm() {
    this.prodForm.reset();
    this.prodCtrl.setValue(0);
    this.dateCtrl.setValue(new Date);
  }
}
