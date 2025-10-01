import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingRoutingModule } from './setting-routing-module';
import { Account } from './components/account/account';
import { General } from './components/general/general';
import {Setting} from './setting';
import { ShareModule } from "../../share/share-module";
import {RouterOutlet} from '@angular/router';
import { AuthModule } from "../auth/auth-module";
import {GeneralSettingService} from './services/general-setting-service';
import {GeneralSettingRepository} from './repositories/general-setting-repository';

@NgModule({
  declarations: [
    Account,
    General,
    Setting,
  ],
  imports: [
    CommonModule,
    SettingRoutingModule,
    ShareModule,
    RouterOutlet,
    AuthModule
  ],
  providers: [
    GeneralSettingService,
    GeneralSettingRepository
  ]
})
export class SettingModule { }
