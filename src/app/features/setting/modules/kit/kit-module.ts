import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { KitRoutingModule } from './kit-routing-module';
import { ListKit } from './components/list-kit/list-kit';
import { AddKit } from './components/add-kit/add-kit';


@NgModule({
  declarations: [
    ListKit,
    AddKit
  ],
  imports: [
    CommonModule,
    KitRoutingModule
  ]
})
export class KitModule { }
