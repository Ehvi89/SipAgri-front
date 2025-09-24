import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductRoutingModule } from './product-routing-module';
import { AddProduct } from './components/add-product/add-product';
import { ListProduct } from './components/list-product/list-product';


@NgModule({
  declarations: [
    AddProduct,
    ListProduct
  ],
  imports: [
    CommonModule,
    ProductRoutingModule
  ]
})
export class ProductModule { }
