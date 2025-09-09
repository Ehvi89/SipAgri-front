import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {PlantationList} from './plantation-list/plantation-list';

const routes: Routes = [
  { path: "", component: PlantationList }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlantationRoutingModule { }
