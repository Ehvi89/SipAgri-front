import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductionRoutingModule } from './production-routing-module';
import { ProductionList } from './components/production-list/production-list';
import {ProductionService} from './services/production-service';
import {ProductionRepository} from './repositories/production-repository';
import {ShareModule} from '../../share/share-module';
import {PlantationModule} from '../plantation/plantation-module';
import {PlanterModule} from '../planter/planter-module';
import { AddProduction } from './components/add-production/add-production';


@NgModule({
  declarations: [
    ProductionList,
    AddProduction
  ],
  imports: [
    CommonModule,
    ProductionRoutingModule,
    ShareModule,
    PlantationModule,
    PlanterModule
  ],
  providers: [
    ProductionService,
    ProductionRepository
  ]
})
export class ProductionModule { }
