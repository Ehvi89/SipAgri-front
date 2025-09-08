import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {PlanterList} from './components/planter-list/planter-list';
import {NewPlanter} from './components/new-planter/new-planter';
import {PlanterDetails} from './components/planter-details/planter-details';

const routes: Routes = [
  { path: "", component: PlanterList },
  { path: "new", component: NewPlanter },
  { path: "profiles", component: PlanterDetails },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlanterRoutingModule { }
