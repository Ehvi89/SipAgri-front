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



@NgModule({
  declarations: [
    Logo,
    Header
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
    SupervisorRepository
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
  ]
})
export class ShareModule { }
