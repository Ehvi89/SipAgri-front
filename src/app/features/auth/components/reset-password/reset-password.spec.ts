import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetPassword } from './reset-password';
import {AuthModule} from '../../auth-module';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('ResetPassword', () => {
  let component: ResetPassword;
  let fixture: ComponentFixture<ResetPassword>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResetPassword],
      imports: [AuthModule, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResetPassword);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
