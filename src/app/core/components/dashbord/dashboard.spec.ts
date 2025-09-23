import {ComponentFixture, TestBed} from '@angular/core/testing';

import {Dashboard} from './dashboard';
import {of} from 'rxjs';
import {DashboardService} from '../../services/dashboard-service';
import {ChangeDetectorRef, ElementRef} from '@angular/core';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('Dashbord', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
    let mockDashboardService: jasmine.SpyObj<DashboardService>;

    beforeEach(async () => {
        mockDashboardService = jasmine.createSpyObj('DashboardService', [
            'getResumesData',
            'getProductionByPeriod',
            'getCulturalDistribution',
            'getProductionTrend'
        ]);

        mockDashboardService.getResumesData.and.returnValue(of([]));
        mockDashboardService.getProductionByPeriod.and.returnValue(of([]));
        mockDashboardService.getCulturalDistribution.and.returnValue(of([]));
        mockDashboardService.getProductionTrend.and.returnValue(of([]));

        await TestBed.configureTestingModule({
            declarations: [Dashboard],
            imports: [HttpClientTestingModule],
            providers: [
                {provide: DashboardService, useValue: mockDashboardService},
                {provide: ChangeDetectorRef, useValue: jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges'])},
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(Dashboard);
        component = fixture.componentInstance;

    // Mock ElementRefs for Canvas
    component.barCanvas = new ElementRef(document.createElement('canvas'));
        component.pieCanvas = new ElementRef(document.createElement('canvas'));
        component.lineCanvas = new ElementRef(document.createElement('canvas'));

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
  });

  it('should call loadDashboardData on ngOnInit', () => {
      spyOn(component as any, 'loadDashboardData');
      component.ngOnInit();
      expect((component as any).loadDashboardData).toHaveBeenCalled();
  });

    it('should call initializeCharts on ngAfterViewInit', () => {
        spyOn(component as any, 'initializeCharts');
        component.ngAfterViewInit();
        setTimeout(() => {
            expect((component as any).initializeCharts).toHaveBeenCalled();
        }, 100);
    });

    it('should call destroyCharts on ngOnDestroy', () => {
        spyOn(component as any, 'destroyCharts');
        component.ngOnDestroy();
        expect((component as any).destroyCharts).toHaveBeenCalled();
    });

    it('should update productionByPeriod and call getProductionByPeriod on onPeriodFilterChange', () => {
        component.selectedPeriodFilter = 'trimestre';
        mockDashboardService.getProductionByPeriod.and.returnValue(of([{name: 'T1', value: 20}]));

        component.onPeriodFilterChange();

        expect(mockDashboardService.getProductionByPeriod).toHaveBeenCalledWith('trimestre');
        expect(component.productionByPeriod).toEqual([{name: 'T1', value: 20}]);
    });
});
