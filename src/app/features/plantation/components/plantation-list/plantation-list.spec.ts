import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantationList } from './plantation-list';
import {PlantationModule} from '../../plantation-module';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('PlantationList', () => {
  let component: PlantationList;
  let fixture: ComponentFixture<PlantationList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlantationList],
      imports: [PlantationModule, HttpClientTestingModule]
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
