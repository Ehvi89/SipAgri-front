import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListProduct } from './list-product';

describe('ListProduct', () => {
  let component: ListProduct;
  let fixture: ComponentFixture<ListProduct>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListProduct]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListProduct);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
