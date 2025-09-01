import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MaterialModule} from './material-module';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {Logo} from './components/logo/logo';
import {CoreModule} from '../core/core-module';
import {Header} from './components/header/header';
import {ReactiveFormsModule} from '@angular/forms';



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
  exports: [
    CommonModule,
    MaterialModule,
    FontAwesomeModule,
    RouterLink,
    RouterLinkActive,
    Logo,
    Header
  ]
})
export class ShareModule { }
