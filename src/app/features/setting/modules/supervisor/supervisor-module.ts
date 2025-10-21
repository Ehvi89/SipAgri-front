import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SupervisorRoutingModule } from './supervisor-routing-module';
import { EditSupervisor } from './components/edit-supervisor/edit-supervisor';
import { AddSupervisor } from './components/add-supervisor/add-supervisor';
import {SupervisorList} from './components/supervisors-list/supervisor-list';
import { ShareModule } from "../../../../share/share-module";


@NgModule({
  declarations: [
    EditSupervisor,
    AddSupervisor,
    SupervisorList
  ],
  imports: [
    CommonModule,
    SupervisorRoutingModule,
    ShareModule
  ]
})
export class SupervisorModule { }
