import {Component, OnInit} from '@angular/core';
import {Observable, of} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PlanterService} from '../../services/planter-service';
import {NotificationService} from "../../../../core/services/notification-service";
import {MaritalStatus} from "../../../../core/enums/marital-status-enum";
import {Supervisor} from "../../../../core/models/supervisor-model";
import {SupervisorService} from '../../../setting/modules/supervisor/services/supervisor-service';
import { Gender } from "../../../../core/enums/gender-enum";
import { AuthService } from "../../../auth/services/auth-service";

@Component({
  selector: 'app-new-planter',
  standalone: false,
  templateUrl: './new-planter.html',
  styleUrl: './new-planter.scss'
})
export class NewPlanter implements OnInit {
  loading$!: Observable<boolean>;
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

  constructor(private formBuilder: FormBuilder,
              private planterService: PlanterService,
              private notifService: NotificationService,
              private supervisorService: SupervisorService) {}

  ngOnInit(): void {
    this.loading$ = this.planterService.loading$;
    this.initForm();
    const currentUser = AuthService.getCurrentUser();
    if (currentUser.profile === 'ADMINISTRATOR'){
      this.supervisors$ = this.supervisorService.getAll();
    } else {
      this.supervisors$ = of([currentUser]);
    }
  }

  private initForm(): void {
    this.planterForm = this.formBuilder.group({
      firstname: ['', [Validators.required, Validators.minLength(2)]],
      lastname: ['', [Validators.required, Validators.minLength(2)]],
      birthday: ['', Validators.required],
      gender: ['', Validators.required],
      maritalStatus: ['', Validators.required],
      childrenNumber: [0, [Validators.required, Validators.min(0)]],
      village: ['', Validators.required],
      supervisor: ['', Validators.required]
    });
  }

  create(): void {
    if (this.planterForm.valid) {
      // Ne pas marquer les champs comme "touched" quand le formulaire est valide
      this.planterService.create(this.planterForm.value).subscribe({
        next: () => {
          this.notifService.showSuccess("Nouveau planteur ajouté avec succès");
          this.resetForm();
        },
        error: () => {
          this.notifService.showError("Une erreur est survenue lors de la création du planteur");
        }
      });
    } else {
      // Marquer les champs comme "touched" seulement si le formulaire est invalide
      this.markFormGroupTouched();
      this.notifService.showError("Veuillez remplir tous les champs requis");
    }
  }

  private resetForm(): void {
    this.planterForm.reset();
    // Réinitialiser également l'état "touched" pour éviter les bordures rouges
    this.markFormGroupUntouched();
    this.planterForm.patchValue({
      childrenNumber: 0
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.planterForm.controls).forEach(key => {
      this.planterForm.get(key)?.markAsTouched();
    });
  }

  private markFormGroupUntouched(): void {
    Object.keys(this.planterForm.controls).forEach(key => {
      this.planterForm.get(key)?.markAsUntouched();
    });
  }
}
