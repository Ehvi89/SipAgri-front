import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PlanterDetails} from './planter-details';
import {Planter} from '../../../../core/models/planter-model';
import {Supervisor} from '../../../../core/models/supervisor-model';
import {MaritalStatus} from '../../../../core/enums/marital-status-enum';
import {Gender} from '../../../../core/enums/gender-enum';
import {MatDialogRef} from '@angular/material/dialog';
import {of, Subscription} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute} from '@angular/router';
import {PlanterService} from '../../services/planter-service';

describe('PlanterDetails', () => {
  let component: PlanterDetails;
  let fixture: ComponentFixture<PlanterDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanterDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanterDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

    it('should populate planter data on ngOnInit when planter ID is present in query params', () => {
        const planterMock: Planter = {
          birthday: new Date(),
          childrenNumber: 0,
          gender: Gender.MALE,
          lastname: 'Smith',
          maritalStatus: MaritalStatus.SINGLE,
          phoneNumber: 0,
          supervisor: {id: 1} as Supervisor,
          village: '',
          id: 1,
          firstname: 'John',
          plantations: []
        };
        const queryParams = {planter: planterMock.id!.toString()};
        const route = TestBed.inject(ActivatedRoute);
        const planterService = TestBed.inject(PlanterService);

      spyOn(route.queryParams, 'subscribe').and.returnValue(new Subscription(() => queryParams));
        spyOn(planterService, 'getById').and.returnValue(of(planterMock));

        component.ngOnInit();

        expect(planterService.getById).toHaveBeenCalledWith(planterMock.id!.toString());
        expect(component.planter).toEqual(planterMock);
    });

    it('should correctly calculate total surface area from plantations', () => {
        component.planter = {
            plantations: [
                {farmedArea: 2},
                {farmedArea: 3},
                {farmedArea: 1},
            ],
        } as Planter;

        const totalSurface = component.getTotalSurface();
        expect(totalSurface).toBe(6);
    });

    it('should correctly calculate annual production from plantations', () => {
        component.planter = {
            plantations: [
                {
                    productions: [
                        {productionInKg: 5},
                        {productionInKg: 10},
                    ],
                },
                {
                    productions: [
                        {productionInKg: 8},
                    ],
                },
            ],
        } as Planter;

        const annualProduction = component.getAnnualProduction();
        expect(annualProduction).toBe(23);
    });

    it('should initialize form and open modification dialog when modifyPlanter is called', () => {
        const dialog = TestBed.inject(MatDialog);
        spyOn(component, 'initForm').and.callThrough();
        spyOn(dialog, 'open').and.returnValue({
            afterClosed: () => of(false),
        } as MatDialogRef<any>);

        component.modifyPlanter();

        expect(component.initForm).toHaveBeenCalled();
        expect(dialog.open).toHaveBeenCalled();
    });
});
