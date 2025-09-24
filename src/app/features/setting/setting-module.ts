import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingRoutingModule } from './setting-routing-module';
import { Account } from './components/account/account';
import { General } from './components/general/general';

@NgModule({
  declarations: [
    Account,
    General,
  ],
  imports: [
    CommonModule,
    SettingRoutingModule
  ]
})
export class SettingModule { }
