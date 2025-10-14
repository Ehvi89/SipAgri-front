import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MaterialModule} from './material-module';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {RouterLink, RouterLinkActive, RouterModule} from '@angular/router';
import {Logo} from './components/logo/logo';
import {Header} from './components/header/header';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SupervisorService} from '../features/setting/modules/supervisor/services/supervisor-service';
import {SupervisorRepository} from '../features/setting/modules/supervisor/repositories/supervisor-repository';
import { ConfirmationDialog } from './components/confirmation-dialog/confirmation-dialog';
import {DialogService} from './services/dialog-service';
import { NoContentError } from './components/no-content-error/no-content-error';
import { GoogleMapsModule } from '@angular/google-maps';
import {KitService} from '../features/setting/modules/kit/services/kit-service';
import {KitRepository} from '../features/setting/modules/kit/repositories/kit-repository';
import {DataExport} from './components/data-export/data-export';
import {DataExportService} from '../core/services/data-export-service';


@NgModule({
  declarations: [
    Logo,
    Header,
    ConfirmationDialog,
    NoContentError,
    DataExport,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FontAwesomeModule,
    RouterLink,
    RouterLinkActive,
    ReactiveFormsModule,
    GoogleMapsModule,
    RouterModule,
    FormsModule
  ],
  providers: [
    SupervisorService,
    SupervisorRepository,
    DialogService,
    KitService,
    KitRepository,
    DataExportService,
  ],
  exports: [
    CommonModule,
    MaterialModule,
    FontAwesomeModule,
    RouterLink,
    RouterLinkActive,
    ReactiveFormsModule,
    Logo,
    Header,
    NoContentError,
    GoogleMapsModule,
    DataExport,
  ]
})
export class ShareModule { }
