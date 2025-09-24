import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupervisorsList } from './supervisors-list';

describe('SupervisorsList', () => {
  let component: SupervisorsList;
  let fixture: ComponentFixture<SupervisorsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupervisorsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupervisorsList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
