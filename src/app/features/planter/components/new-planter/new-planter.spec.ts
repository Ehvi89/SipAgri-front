import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPlanter } from './new-planter';

describe('NewPlanter', () => {
  let component: NewPlanter;
  let fixture: ComponentFixture<NewPlanter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewPlanter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewPlanter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
