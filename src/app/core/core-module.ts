import {NgModule} from '@angular/core';
import {ShareModule} from '../share/share-module';
import {Sidebar} from './components/sidebar/sidebar';
import {Dashboard} from './components/dashbord/dashboard';
import {ErrorComponent} from './components/error/error.component';
import {ReactiveFormsModule} from '@angular/forms';

@NgModule({
  imports: [
    ShareModule,
    ReactiveFormsModule,
  ],
  declarations: [
    Sidebar,
    Dashboard,
    ErrorComponent,
  ],
  providers: [],
  exports: [
    Sidebar,
    Dashboard,
    ErrorComponent
  ]
})

export class CoreModule{}
