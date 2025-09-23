import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductionList } from './production-list';
import {ProductionModule} from '../../production-module';

describe('ProductionList', () => {
  let component: ProductionList;
  let fixture: ComponentFixture<ProductionList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductionList, ProductionModule]
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
