import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantationDetails } from './plantation-details';
import {PlantationModule} from '../../plantation-module';

describe('PlantationDetails', () => {
  let component: PlantationDetails;
  let fixture: ComponentFixture<PlantationDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlantationDetails],
      imports: [PlantationModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlantationDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
