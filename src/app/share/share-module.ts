import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MaterialModule} from './material-module';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {Logo} from './components/logo/logo';
import {Header} from './components/header/header';
import {ReactiveFormsModule} from '@angular/forms';
import {SupervisorService} from './services/supervisor-service';
import {SupervisorRepository} from './repositories/supervisor-repository';
import { ConfirmationDialog } from './components/confirmation-dialog/confirmation-dialog';
import {DialogService} from './services/dialog-service';
import { NoContentError } from './components/no-content-error/no-content-error';



@NgModule({
  declarations: [
    Logo,
    Header,
    ConfirmationDialog,
    NoContentError,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FontAwesomeModule,
    RouterLink,
    RouterLinkActive,
    ReactiveFormsModule,
  ],
  providers: [
    SupervisorService,
    SupervisorRepository,
    DialogService
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
  ]
})
export class ShareModule { }
