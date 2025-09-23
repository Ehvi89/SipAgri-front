import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPlantation } from './add-plantation';
import {PlantationModule} from '../../plantation-module';

describe('AddPlantation', () => {
  let component: AddPlantation;
  let fixture: ComponentFixture<AddPlantation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddPlantation],
      imports: [PlantationModule],
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
