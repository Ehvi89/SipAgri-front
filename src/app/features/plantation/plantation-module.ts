import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlantationRoutingModule } from './plantation-routing-module';
import { PlantationList } from './plantation-list/plantation-list';


@NgModule({
  declarations: [
    PlantationList
  ],
  imports: [
    CommonModule,
    PlantationRoutingModule
  ]
})
export class PlantationModule { }
