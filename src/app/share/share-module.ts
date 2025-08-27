import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MaterialModule} from './material-module';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MaterialModule,
    FontAwesomeModule
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi())
  ],
  exports: [
    MaterialModule,
  ]
})
export class ShareModule { }
