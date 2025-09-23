import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Login } from './login';
import {AuthModule} from '../../auth-module';
import {HttpTestingController} from '@angular/common/http/testing';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Login],
      imports: [AuthModule, HttpTestingController],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
