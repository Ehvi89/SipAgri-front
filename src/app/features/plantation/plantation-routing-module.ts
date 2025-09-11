import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {PlantationList} from './components/plantation-list/plantation-list';
import {AddPlantation} from './components/add-plantation/add-plantation';

const routes: Routes = [
  { path: "", component: PlantationList },
  { path: "add", component: AddPlantation }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlantationRoutingModule { }
