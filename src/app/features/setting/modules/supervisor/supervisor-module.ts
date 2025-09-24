import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SupervisorRoutingModule } from './supervisor-routing-module';
import { EditSupervisor } from './components/edit-supervisor/edit-supervisor';
import { AddSupervisor } from './components/add-supervisor/add-supervisor';
import {SupervisorsList} from './components/supervisors-list/supervisors-list';


@NgModule({
  declarations: [
    EditSupervisor,
    AddSupervisor,
    SupervisorsList
  ],
  imports: [
    CommonModule,
    SupervisorRoutingModule
  ]
})
export class SupervisorModule { }
