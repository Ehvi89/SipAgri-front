import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ProductionList} from './components/production-list/production-list';
import {AddProduction} from './components/add-production/add-production';

const routes: Routes = [
  { path: "", component: ProductionList },
  { path: "add", component: AddProduction },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductionRoutingModule { }
