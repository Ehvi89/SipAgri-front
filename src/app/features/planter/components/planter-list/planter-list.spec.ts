import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanterList } from './planter-list';

describe('PlanterList', () => {
  let component: PlanterList;
  let fixture: ComponentFixture<PlanterList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlanterList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanterList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
