import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing-module';
import { Login } from './login/login';
import {AuthService} from './services/auth-service';
import {ShareModule} from '../../share/share-module';


@NgModule({
  declarations: [
    Login
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    ShareModule
  ],
  providers: [
    AuthService,
  ]
})
export class AuthModule { }
