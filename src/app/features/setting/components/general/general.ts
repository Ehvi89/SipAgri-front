import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Params } from '../../../../core/models/parameter-model';
import { PaginationResponse } from '../../../../core/models/pagination-response-model';
import { GeneralSettingService } from '../../services/general-setting-service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

/**
 * Resets the form to its initial state and disables edit mode.
 * Clears the selected parameter and restores the default form structure.
 *
 * @return {void} This method does not return any value.
 */
@Component({
  selector: 'app-general',
  standalone: false,
  templateUrl: './general.html',
  styleUrl: './general.scss'
})
export class General implements OnInit, OnDestroy {
  /**
   * Represents an observable stream indicating the loading state of a process.
   * Emits a boolean value:
   * - `true` if the process is currently loading.
   * - `false` if the process is not loading.
   *
   * This observable can be used to subscribe to and track the loading status,
   * allowing the UI or other components to react accordingly.
   */
  loading$!: Observable<boolean>;
  /**
   * An observable stream representing a response for paginated data of type `Params`.
   *
   * This property emits a stream of values that conform to the structure defined
   * by the `PaginationResponse` generic for a given type `Params`. It is typically
   * used to subscribe to and receive paginated data updates, such as during data
   * retrieval from a server or an API call.
   *
   * The observable stream is expected to handle the pagination metadata and
   * corresponding data containing items of type `Params`.
   *
   * @type {Observable<PaginationResponse<Params>>}
   */
  params$!: Observable<PaginationResponse<Params>>;

  /**
   * A Subject from RxJS representing a notifier for teardown or destruction events.
   * Emits a void value to signal subscribers to perform cleanup tasks, unsubscribe
   * from observables, or release resources. Typically used in Angular or RxJS-based
   * applications for managing component or service lifecycles.
   *
   * This variable is used to handle lifecycle-specific unsubscriptions in RxJS pipelines,
   * ensuring proper memory management and preventing potential memory leaks.
   */
  private destroy$ = new Subject<void>();

  // Form controls
  /**
   * A form control used to manage and validate the input value for a name field.
   * Accepts a string value or null. It is typically used in reactive forms to
   * bind and track the state and validation of the input.
   */
  nameCtrl!: FormControl<string | null>;
  /**
   * Represents a form control for managing the input and validation of a field.
   * This form control can hold a string value or null, typically used in reactive forms.
   * It allows tracking of the value, validation status, and changes to the associated form field.
   */
  valueCtrl!: FormControl<string | null>;
  /**
   * A form control managing a textual description input.
   * This control allows the associated input to accept either a string
   * value or a null value. It is typically used within a reactive forms
   * context to track and validate the value of a description field.
   */
  descriptionCtrl!: FormControl<string | null>;
  /**
   * Represents a reactive form control used for managing a parameter value
   * in a form. This control specifically handles string values, but it may also
   * accept a `null` value when no input is provided or the value is reset.
   *
   * This form control is typically used in scenarios where the associated parameter
   * requires dynamic validation, state tracking, or interaction handling within
   * an Angular form.
   *
   * Type: FormControl<string | null>
   */
  codeParamsCtrl!: FormControl<string | null>;
  /**
   * A form control that holds an encrypted state value.
   * The control accepts a value of type boolean or null, representing
   * whether the associated data or operation is in an encrypted state.
   * Useful in forms where encryption options may be toggled.
   */
  encryptedCtrl!: FormControl<boolean | null>;

  /**
   * Represents a reactive form group for handling and managing form controls and their values,
   * validations, and states in an Angular application. This variable is expected to be initialized
   * with a `FormGroup` instance representing the entire form structure.
   *
   * The `settingForm` property is typically used for binding form data to templates,
   * listening to user input changes, and validating form inputs.
   *
   * The non-null assertion operator (`!`) indicates that this property will be definitely assigned
   * before it is accessed.
   */
  settingForm!: FormGroup;

  // Edit mode
  /**
   * A boolean variable that indicates whether the application or a specific
   * feature is currently in edit mode.
   *
   * When set to `true`, the edit mode is active, allowing users to modify
   * the related content or settings. When set to `false`, the edit mode
   * is inactive, restricting modification actions.
   */
  editMode: boolean = false;
  /**
   * Represents a selected parameter or holds a `null` value if no parameter is selected.
   *
   * This variable is used to store the currently selected set of parameters
   * or a null value to indicate that no parameters have been chosen.
   *
   * @type {Params|null}
   */
  selectedParam: Params | null = null;

  /**
   *
   */
  constructor(
    private generalSettingService: GeneralSettingService,
    private formBuilder: FormBuilder
  ) {}

  /**
   * Lifecycle hook called after Angular has initialized all data-bound properties of a directive.
   * Sets up initial properties and performs any required side-effects, such as initializing observables and forms.
   *
   * @return {void} This method does not return any value.
   */
  ngOnInit(): void {
    this.loading$ = this.generalSettingService.loading$;
    this.loadParams();
    this.initializeForm();
  }

  /**
   * A lifecycle hook that is invoked when the directive or component is destroyed.
   * This method ensures that all subscriptions tied to the `destroy$` subject are properly completed,
   * preventing memory leaks and clearing resources once the component is destroyed.
   *
   * @return {void} Does not return a value.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initializes a reactive form with predefined controls, validators, and structure.
   *
   * @return {void} Does not return a value.
   */
  private initializeForm(): void {
    this.nameCtrl = this.formBuilder.control('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(100)
    ]);

    this.valueCtrl = this.formBuilder.control('', [
      Validators.required,
      Validators.maxLength(500)
    ]);

    this.descriptionCtrl = this.formBuilder.control('', [
      Validators.maxLength(255)
    ]);

    this.codeParamsCtrl = this.formBuilder.control('', [
      Validators.maxLength(50)
    ]);

    this.encryptedCtrl = this.formBuilder.control(false, [
      Validators.required
    ]);

    this.settingForm = this.formBuilder.group({
      name: this.nameCtrl,
      value: this.valueCtrl,
      description: this.descriptionCtrl,
      codeParams: this.codeParamsCtrl,
      encrypted: this.encryptedCtrl,
    });
  }

  /**
   * Loads the parameters by fetching all paged entries from the general setting service
   * and assigns them to the corresponding member property.
   *
   * @return {void} Does not return a value.
   */
  loadParams(): void {
    this.params$ = this.generalSettingService.getAllPaged();
  }

  /**
   * Handles the submission of the settings form. If the form is invalid, it marks all fields as touched to highlight errors.
   * Depending on the mode (`editMode`), it either creates a new parameter or updates an existing one.
   * Subscribes to the service's observable to perform actions on success or handle errors.
   * Also resets the form and reloads parameters upon successful submission.
   *
   * @return {void} This method does not return any value.
   */
  onSubmit(): void {
    if (this.settingForm.invalid) {
      this.settingForm.markAllAsTouched();
      return;
    }

    const paramData = this.settingForm.value;

    const request$ = this.editMode && this.selectedParam
      ? this.generalSettingService.partialUpdate(this.selectedParam.id!, {...paramData, id: this.selectedParam?.id!})
      : this.generalSettingService.create(paramData);

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        console.log(`Paramètre ${this.editMode ? 'modifié' : 'créé'} avec succès`);
        this.resetForm();
        this.loadParams();
      },
      error: (error) => {
        console.error('Erreur lors de l\'enregistrement:', error);
      }
    });
  }

  /**
   * Enables edit mode and initializes the form with the data from the provided parameter.
   * It also updates the form fields and disables specific fields if the parameter code is "BACKEND".
   *
   * @param param The parameter object containing details to populate the form, such as name, value, description, codeParams, and encrypted status.
   * @return void No return value.
   */
  editParam(param: Params): void {
    this.editMode = true;
    this.selectedParam = param;

    // Réactiver tous les champs d'abord
    this.settingForm.enable();

    this.settingForm.patchValue({
      name: param.name,
      value: param.value,
      description: param.description,
      codeParams: param.codeParams,
      encrypted: param.encrypted || false
    });

    // Désactiver le champ name si c'est un paramètre backend
    if (param.codeParams === "BACKEND") {
      this.settingForm.get('name')?.disable();
      this.settingForm.get('codeParams')?.disable();
    }
  }

  /**
   * Deletes a specified parameter after confirmation and reloads the parameters list.
   *
   * @param {Params} param - The parameter object to delete. Requires `id` and `name` properties.
   * @return {void} No return value.
   */
  deleteParam(param: Params): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le paramètre "${param.name}" ?`)) {
      this.generalSettingService.delete(param.id!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadParams();
            console.log('Paramètre supprimé avec succès');
          },
          error: (error) => {
            console.error('Erreur lors de la suppression:', error);
          }
        });
    }
  }

  /**
   * Resets the form to its initial state by clearing all fields, setting default values, and marking the form as untouched.
   * It also disables the edit mode and clears the selected parameter.
   *
   * @return {void} Does not return any value.
   */
  resetForm(): void {
    this.settingForm.reset({
      encrypted: false
    });
    this.editMode = false;
    this.selectedParam = null;
    this.settingForm.markAsUntouched();
  }

  /**
   * Cancels the editing process and resets the form to its initial state.
   * @return {void} Does not return a value.
   */
  cancelEdit(): void {
    this.resetForm();
  }

  /**
   * Triggers the loading of the next set of data by using the general settings service.
   * Updates or retrieves data based on the current state of the application.
   *
   * @return {void} No return value.
   */
  next(): void {
    this.generalSettingService.loadNextData();
  }

  /**
   * Loads the previous data using the generalSettingService.
   *
   * @return {void} This method does not return any value. It performs an action.
   */
  previous(): void {
    this.generalSettingService.loadPreviousData();
  }

  /**
   * Retrieves the error message associated with the name input field based on various validation errors.
   * The method checks for 'required', 'minlength', and 'maxlength' errors and provides corresponding messages.
   *
   * @return {string} The error message for the name field, or an empty string if there is no error.
   */
  get nameError(): string {
    if (this.nameCtrl.hasError('required')) {
      return 'Le nom est requis';
    }
    if (this.nameCtrl.hasError('minlength')) {
      return 'Le nom doit contenir au moins 3 caractères';
    }
    if (this.nameCtrl.hasError('maxlength')) {
      return 'Le nom ne peut pas dépasser 100 caractères';
    }
    return '';
  }

  /**
   * Retrieves the error message associated with the current state of the `valueCtrl` form control.
   * Checks for specific validation errors such as 'required' and 'maxlength' and returns appropriate error messages.
   * If there are no errors, an empty string is returned.
   *
   * @return {string} The error message indicating the validation issue, or an empty string if no errors are present.
   */
  get valueError(): string {
    if (this.valueCtrl.hasError('required')) {
      return 'La valeur est requise';
    }
    if (this.valueCtrl.hasError('maxlength')) {
      return 'La valeur ne peut pas dépasser 500 caractères';
    }
    return '';
  }

  /**
   * Returns an error message if the `descriptionCtrl` form control has a 'maxlength' validation error.
   *
   * @return {string} The error message indicating that the description exceeds the maximum allowed length of 255 characters, or an empty string if no error is present.
   */
  get descriptionError(): string {
    if (this.descriptionCtrl.hasError('maxlength')) {
      return 'La description ne peut pas dépasser 255 caractères';
    }
    return '';
  }

  /**
   * Retrieves an error message associated with the 'codeParamsCtrl' field.
   * The error message is returned only if the 'maxlength' validation error is present.
   *
   * @return {string} A message indicating that the code parameter cannot exceed 50 characters, or an empty string if no error is present.
   */
  get codeParamsError(): string {
    if (this.codeParamsCtrl.hasError('maxlength')) {
      return 'Le code paramètre ne peut pas dépasser 50 caractères';
    }
    return '';
  }

  /**
   * Retrieves the error message for the encrypted control if there are any validation errors.
   * Specifically, it checks if the 'required' error exists.
   *
   * @return {string} Returns the error message 'Ce champ est requis' if the 'required' error is present.
   *                  Otherwise, returns an empty string.
   */
  get encryptedError(): string {
    if (this.encryptedCtrl.hasError('required')) {
      return 'Ce champ est requis';
    }
    return '';
  }
}
