import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing-module';
import { Login } from './components/login/login';
import {AuthService} from './services/auth-service';
import {ShareModule} from '../../share/share-module';
import {LoginRepository, AuthRepository, RegisterRepository} from './repositories/auth-repository';
import {LoginService} from './services/login-service';
import {RegisterService} from './services/register-service';
import {ReactiveFormsModule} from '@angular/forms';
import { Register } from './components/register/register';


@NgModule({
  declarations: [
    Login,
    Register
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    ShareModule,
    ReactiveFormsModule
  ],
  providers: [
    AuthService,
    LoginService,
    LoginRepository,
    RegisterRepository,
    AuthRepository,
    RegisterService
  ]
})
export class AuthModule { }
