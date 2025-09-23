import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddProduction } from './add-production';
import {ProductionModule} from '../../production-module';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('AddProduction', () => {
  let component: AddProduction;
  let fixture: ComponentFixture<AddProduction>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddProduction],
      imports: [ProductionModule, HttpClientTestingModule],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddProduction);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
