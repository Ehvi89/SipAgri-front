import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddKit } from './add-kit';

describe('AddKit', () => {
  let component: AddKit;
  let fixture: ComponentFixture<AddKit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddKit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddKit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
