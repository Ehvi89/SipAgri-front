import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductionList } from './production-list';
import {ProductionModule} from '../../production-module';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('ProductionList', () => {
  let component: ProductionList;
  let fixture: ComponentFixture<ProductionList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductionList],
      imports: [ProductionModule, HttpClientTestingModule],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductionList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
