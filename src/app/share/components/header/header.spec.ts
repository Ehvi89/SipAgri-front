import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Header } from './header';
import {ShareModule} from '../../share-module';
import {HttpTestingController} from '@angular/common/http/testing';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Header],
      imports: [ShareModule, HttpTestingController]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
