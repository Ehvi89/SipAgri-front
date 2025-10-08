import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSupervisor } from './add-supervisor';

describe('AddSupervisor', () => {
  let component: AddSupervisor;
  let fixture: ComponentFixture<AddSupervisor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddSupervisor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddSupervisor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
