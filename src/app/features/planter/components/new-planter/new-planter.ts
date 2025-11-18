import { Component, OnInit } from '@angular/core';
import {Observable, of, Subject} from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {debounceTime, distinctUntilChanged, switchMap, map, catchError} from 'rxjs/operators';
import { PlanterService } from '../../services/planter-service';
import { NotificationService } from "../../../../core/services/notification-service";
import { MaritalStatus } from "../../../../core/enums/marital-status-enum";
import { Supervisor } from "../../../../core/models/supervisor-model";
import { SupervisorService } from '../../../setting/modules/supervisor/services/supervisor-service';
import { Gender } from "../../../../core/enums/gender-enum";
import { AuthService } from "../../../auth/services/auth-service";
import { GeocodingService } from '../../../../core/services/geocoding-service';
import {PaymentMethod} from '../../../../core/enums/payment-method-enum';


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
  filteredVillages$!: Observable<NominatimResult[]>;
  private readonly searchTerms = new Subject<string>();
  geoLoading$!: Observable<boolean>;

  maritalStatusOptions = [
    { value: MaritalStatus.SINGLE, label: 'Célibataire' },
    { value: MaritalStatus.MARRIED, label: 'Marié(e)' },
    { value: MaritalStatus.DIVORCED, label: 'Divorcé(e)' },
    { value: MaritalStatus.WIDOWED, label: 'Veuf/Veuve' }
  ];

  paymentMethodOptions = [
    { value: PaymentMethod.CHEQUE, label: 'Chèque' },
    { value: PaymentMethod.WAVE, label: 'Wave' },
    { value: PaymentMethod.ORANGE_MONEY, label: 'Orange Money' },
    { value: PaymentMethod.MOOV_MONEY, label: 'Moov Money' },
    { value: PaymentMethod.MTN_MONEY, label: 'MTN Money' }
  ];

  gender = Gender;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly planterService: PlanterService,
    private readonly notifService: NotificationService,
    private readonly supervisorService: SupervisorService,
    private readonly geocodingService: GeocodingService
  ) {}

  ngOnInit(): void {
    this.loading$ = this.planterService.loading$;
    this.geoLoading$ = this.geocodingService.geoLoading;
    this.setupVillageAutocomplete();

    const currentUser = AuthService.getCurrentUser();
    if (currentUser.profile === 'ADMINISTRATOR') {
      this.supervisors$ = this.supervisorService.getAll();
    } else {
      this.supervisors$ = of([currentUser]);
    }
    this.initForm(currentUser);
  }

  private initForm(currentUser: Supervisor): void {
    this.planterForm = this.formBuilder.group({
      firstname: ['', [Validators.required, Validators.minLength(2)]],
      lastname: ['', [Validators.required, Validators.minLength(2)]],
      birthday: ['', Validators.required],
      gender: ['', Validators.required],
      maritalStatus: ['', Validators.required],
      childrenNumber: [0, [Validators.required, Validators.min(0)]],
      village: ['', Validators.required],
      supervisor: [currentUser.profile === 'SUPERVISOR' ? currentUser : '', Validators.required],
      phoneNumber: ['', [Validators.minLength(10), Validators.maxLength(10)]],
      paymentMethod: ['', Validators.required],
    });
    if(currentUser.profile === 'SUPERVISOR') {
      this.planterForm.get('supervisor')?.disable()
    }
  }

  private setupVillageAutocomplete(): void {
    this.filteredVillages$ = this.searchTerms.pipe(
      debounceTime(300), // Attendre 300ms après la dernière frappe
      distinctUntilChanged(), // Ignorer si la valeur n'a pas changé
      switchMap((term: string) => {
        if (term.length < 3) {
          return of([]); // Ne pas rechercher si moins de 3 caractères
        }
        return this.searchVillages(term);
      })
    );
  }

  private searchVillages(searchTerm: string): Observable<NominatimResult[]> {
    return this.geocodingService.searchLocations(searchTerm).pipe(
      map((results: NominatimResult[]) => {
        // Filtrer et prioriser les résultats
        return results
          .filter(result =>
            result.type === 'village' ||
            result.type === 'town' ||
            result.type === 'city' ||
            result.address?.village ||
            result.address?.town
          )
          .slice(0, 8)
      }),
      catchError(error => {
        console.error('Erreur de recherche Nominatim:', error);
        this.notifService.showError('Erreur lors de la recherche des villages');
        return of([]);
      })
    );
  }

  // Méthode pour déclencher la recherche
  onVillageInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerms.next(input.value);
  }

  // Méthode pour afficher le nom du village dans l'input
  displayVillage(village: NominatimResult | string): string {
    if (!village) return '';

    if (typeof village === 'string') {
      return village;
    }

    // Afficher un format plus lisible
    const address = village.address;
    if (address?.village) {
      return `${address.village}, ${address.county || address.state || 'Côte d\'Ivoire'}`;
    } else if (address?.town) {
      return `${address.town}, ${address.county || address.state || 'Côte d\'Ivoire'}`;
    }

    return village.display_name;
  }

  create(): void {
    if (this.planterForm.valid) {
      // Formater les données du village avant envoi
      const formData = {
        ...this.planterForm.value,
        village: this.formatVillageData(this.planterForm.value.village).display_name,
        supervisor: this.planterForm.get('supervisor')?.value
      };

      this.planterService.create(formData).subscribe({
        next: () => {
          this.notifService.showSuccess("Nouveau planteur ajouté avec succès");
          this.resetForm();
        },
        error: () => {
          this.notifService.showError("Une erreur est survenue lors de la création du planteur");
        }
      });
    } else {
      this.markFormGroupTouched();
      this.notifService.showError("Veuillez remplir tous les champs requis");
    }
  }

  private formatVillageData(village: NominatimResult | string): any {
    if (typeof village === 'string') {
      return { display_name: village };
    }

    return {
      display_name: village.display_name,
      lat: village.lat,
      lon: village.lon,
      type: village.type,
      address: village.address
    };
  }

  private resetForm(): void {
    const currentUser = AuthService.getCurrentUser();
    this.planterForm.reset({
      firstname: '',
      lastname: '',
      birthday: '',
      gender: '',
      maritalStatus: '',
      childrenNumber: 0,
      village: '',
      supervisor: currentUser.profile === 'SUPERVISOR' ? currentUser : ''
    });

    this.planterForm.markAsPristine();
    this.planterForm.markAsUntouched();

    for (const key of Object.keys(this.planterForm.controls)) {
      const control = this.planterForm.get(key);
      control?.setErrors(null);
      control?.markAsUntouched();
      control?.markAsPristine();
    }
  }

  private markFormGroupTouched(): void {
    for (const key of Object.keys(this.planterForm.controls)) {
      const control = this.planterForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    }
  }
}
