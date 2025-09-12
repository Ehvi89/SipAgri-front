import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantationDetails } from './plantation-details';

describe('PlantationDetails', () => {
  let component: PlantationDetails;
  let fixture: ComponentFixture<PlantationDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlantationDetails]
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
