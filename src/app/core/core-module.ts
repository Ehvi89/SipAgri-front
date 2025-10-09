import {NgModule} from '@angular/core';
import {ShareModule} from '../share/share-module';
import {Sidebar} from './components/sidebar/sidebar';
import {Dashboard} from './components/dashbord/dashboard';
import {ErrorComponent} from './components/error/error.component';
import {ReactiveFormsModule} from '@angular/forms';
import {PlanterModule} from '../features/planter/planter-module';
import {PlantationService} from '../features/plantation/services/plantation-service';

@NgModule({
  imports: [
    ShareModule,
    ReactiveFormsModule,
    PlanterModule,
  ],
  declarations: [
    Sidebar,
    Dashboard,
    ErrorComponent,
  ],
  providers: [
    PlantationService
  ],
  exports: [
    Sidebar,
    Dashboard,
    ErrorComponent
  ]
})

export class CoreModule{}
