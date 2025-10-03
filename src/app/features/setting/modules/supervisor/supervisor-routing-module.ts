import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {SupervisorList} from './components/supervisors-list/supervisor-list';
import {AddSupervisor} from './components/add-supervisor/add-supervisor';
import {EditSupervisor} from './components/edit-supervisor/edit-supervisor';

const routes: Routes = [
  { path: "", component: SupervisorList },
  { path: "add", component: AddSupervisor },
  { path: "edit-profile/:id", component: EditSupervisor },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SupervisorRoutingModule { }
