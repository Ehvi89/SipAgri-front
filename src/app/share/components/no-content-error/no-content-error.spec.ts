import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoContentError } from './no-content-error';
import {ShareModule} from '../../share-module';

describe('NoContentError', () => {
  let component: NoContentError;
  let fixture: ComponentFixture<NoContentError>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NoContentError],
      imports: [ShareModule]
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
