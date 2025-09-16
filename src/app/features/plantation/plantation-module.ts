import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlantationRoutingModule } from './plantation-routing-module';
import { PlantationList } from './components/plantation-list/plantation-list';
import {ShareModule} from '../../share/share-module';
import {CoreModule} from '../../core/core-module';
import {PlantationService} from './services/plantation-service';
import {PlantationRepository} from './repository/plantation-repository';
import {PlanterModule} from '../planter/planter-module';
import { AddPlantation } from './components/add-plantation/add-plantation';
import { PlantationDetails } from './components/planation-details/plantation-details';


@NgModule({
  declarations: [
    PlantationList,
    AddPlantation,
    PlantationDetails,
  ],
  imports: [
    CommonModule,
    PlantationRoutingModule,
    ShareModule,
    CoreModule,
    PlanterModule
  ],
  providers: [
    PlantationService,
    PlantationRepository
  ]
})
export class PlantationModule { }
