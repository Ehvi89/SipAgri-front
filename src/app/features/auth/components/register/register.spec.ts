import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Register } from './register';
import {AuthModule} from '../../auth-module';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Register],
      imports: [AuthModule, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
