import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupervisorList } from './supervisor-list';

describe('SupervisorList', () => {
  let component: SupervisorList;
  let fixture: ComponentFixture<SupervisorList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupervisorList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupervisorList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
