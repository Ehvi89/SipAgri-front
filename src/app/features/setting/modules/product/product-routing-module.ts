import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ListProduct} from './components/list-product/list-product';
import {AddProduct} from './components/add-product/add-product';

const routes: Routes = [
  { path: "", component: ListProduct },
  { path: "add", component: AddProduct },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductRoutingModule { }
