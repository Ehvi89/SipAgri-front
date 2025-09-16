import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantationList } from './plantation-list';

describe('PlantationList', () => {
  let component: PlantationList;
  let fixture: ComponentFixture<PlantationList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlantationList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlantationList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
