import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPlantation } from './add-plantation';

describe('AddPlantation', () => {
  let component: AddPlantation;
  let fixture: ComponentFixture<AddPlantation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddPlantation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPlantation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
