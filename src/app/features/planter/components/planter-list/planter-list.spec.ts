import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PlanterList} from './planter-list';
import {Planter} from '../../../../core/models/planter-model';

describe('PlanterList', () => {
  let component: PlanterList;
  let fixture: ComponentFixture<PlanterList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlanterList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanterList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

    it('should initialize ngOnInit with correct controls and observables', () => {
        spyOn(component['planterService'], 'getAllPaged').and.callThrough();
        component.ngOnInit();
        expect(component.listSizeCtrl.value).toBe(10);
        expect(component.listFiltersCtrl.value).toBe('Toutes les régions');
        expect(component['planterService'].getAllPaged).toHaveBeenCalledWith(0, 10);
    });

    it('should load next page when loadNextPage is called', () => {
        spyOn(component['planterService'], 'loadNextData');
        component.listSizeCtrl.setValue(20);
        component.loadNextPage();
        expect(component['planterService'].loadNextData).toHaveBeenCalledWith(20);
    });

    it('should load previous page when loadPreviousPage is called', () => {
        spyOn(component['planterService'], 'loadPreviousData');
        component.listSizeCtrl.setValue(15);
        component.loadPreviousPage();
        expect(component['planterService'].loadPreviousData).toHaveBeenCalledWith(15);
    });

    it('should call planterService.search when onSearch is triggered', () => {
        spyOn(component['planterService'], 'search');
        component.listSizeCtrl.setValue(30);
        component.onSearch('test');
        expect(component['planterService'].search).toHaveBeenCalledWith('test', undefined, 30);
    });

    it('should navigate to the correct profile view when viewProfile is called', () => {
        const planterMock = {id: 123} as Planter;
        spyOn(component['router'], 'navigate');
        component.viewProfile(planterMock);
        expect(component['router'].navigate).toHaveBeenCalledWith(['/planters/profile'], {queryParams: {planter: 123}});
    });
});
