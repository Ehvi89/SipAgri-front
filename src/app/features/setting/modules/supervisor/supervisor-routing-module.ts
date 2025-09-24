import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {SupervisorsList} from './components/supervisors-list/supervisors-list';
import {AddSupervisor} from './components/add-supervisor/add-supervisor';

const routes: Routes = [
  { path: "", component: SupervisorsList },
  { path: "add", component: AddSupervisor },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SupervisorRoutingModule { }
