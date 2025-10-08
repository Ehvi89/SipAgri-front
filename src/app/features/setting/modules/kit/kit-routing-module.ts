import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ListKit} from './components/list-kit/list-kit';
import {AddKit} from './components/add-kit/add-kit';

const routes: Routes = [
  { path: "", component: ListKit },
  { path: "add", component: AddKit },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KitRoutingModule { }
