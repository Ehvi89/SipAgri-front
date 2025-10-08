import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListKit } from './list-kit';

describe('ListKit', () => {
  let component: ListKit;
  let fixture: ComponentFixture<ListKit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListKit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListKit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
