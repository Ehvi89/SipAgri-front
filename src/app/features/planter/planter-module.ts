import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanterRoutingModule } from './planter-routing-module';
import { PlanterList } from './components/planter-list/planter-list';
import { PlanterRepository } from "./repositories/planter-repository";
import { ShareModule } from "../../share/share-module";
import { NewPlanter } from './components/new-planter/new-planter';
import { PlanterDetails } from './components/planter-details/planter-details';
import {PlanterService} from './services/planter-service';


@NgModule({
  declarations: [
    PlanterList,
    NewPlanter,
    PlanterDetails,
  ],
  imports: [
    CommonModule,
    PlanterRoutingModule,
    ShareModule
  ],
  providers: [
    // PlanterService,
    PlanterRepository
  ],
})
export class PlanterModule { }
