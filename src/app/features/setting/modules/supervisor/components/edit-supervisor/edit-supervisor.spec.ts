import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSupervisor } from './edit-supervisor';

describe('EditSupervisor', () => {
  let component: EditSupervisor;
  let fixture: ComponentFixture<EditSupervisor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditSupervisor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditSupervisor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
