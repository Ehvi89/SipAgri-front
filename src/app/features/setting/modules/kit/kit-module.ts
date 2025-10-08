import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { KitRoutingModule } from './kit-routing-module';
import { ListKit } from './components/list-kit/list-kit';
import { AddKit } from './components/add-kit/add-kit';
import { ShareModule } from "../../../../share/share-module";
import { KitService } from "./services/kit-service";
import { KitRepository } from "./repositories/kit-repository"
import {ProductModule} from '../product/product-module';


@NgModule({
  declarations: [
    ListKit,
    AddKit
  ],
  imports: [
    CommonModule,
    KitRoutingModule,
    ShareModule,
    ProductModule
  ],
  providers: [
    KitService,
    KitRepository
  ]
})
export class KitModule { }
