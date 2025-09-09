import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanterDetails } from './planter-details';

describe('PlanterDetails', () => {
  let component: PlanterDetails;
  let fixture: ComponentFixture<PlanterDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanterDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanterDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
