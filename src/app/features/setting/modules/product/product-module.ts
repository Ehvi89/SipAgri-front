import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductRoutingModule } from './product-routing-module';
import { AddProduct } from './components/add-product/add-product';
import { ListProduct } from './components/list-product/list-product';
import {ProductService} from './services/product-service';
import {ProductRepository} from './repositories/product-repository';
import { ShareModule } from "../../../../share/share-module";


@NgModule({
  declarations: [
    AddProduct,
    ListProduct
  ],
  imports: [
    CommonModule,
    ProductRoutingModule,
    ShareModule
  ],
  providers: [
    ProductService,
    ProductRepository
  ]
})
export class ProductModule { }
