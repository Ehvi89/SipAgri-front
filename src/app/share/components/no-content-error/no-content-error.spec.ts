import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoContentError } from './no-content-error';

describe('NoContentError', () => {
  let component: NoContentError;
  let fixture: ComponentFixture<NoContentError>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NoContentError]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoContentError);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
