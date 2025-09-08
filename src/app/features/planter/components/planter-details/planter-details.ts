import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Planter} from '../../../../core/models/planter-model';
import {GeocodingService} from '../../../../core/services/geocoding-service';
import {forkJoin, map} from 'rxjs';
import {PlanterService} from '../../services/planter-service';
import {NotificationService} from '../../../../core/services/notification-service';

@Component({
  selector: 'app-planter-details',
  standalone: false,
  templateUrl: './planter-details.html',
  styleUrl: './planter-details.scss'
})
export class PlanterDetails implements OnInit {
  planter!: Planter | null;
  plantationsWithVillage: any[] = [];

  constructor(private geocodingService: GeocodingService,
              private planterService: PlanterService,
              private cdr: ChangeDetectorRef,
              private notifService: NotificationService) {
  }

  ngOnInit() {
    this.planter = this.planterService.selectedPlanter;
    if (this.planter?.plantations) {
      const villageRequests = this.planter.plantations.map(plantation =>
        this.geocodingService.getPlaceName(plantation.gpsLocation).pipe(
          map(village => ({
            ...plantation,
            village: village
          }))
        )
      );

      forkJoin(villageRequests).subscribe(results => {
        this.plantationsWithVillage = results;
        this.cdr.detectChanges();
      });
    }
  }

  getTotalSurface(): number {
    let total = 0;
    if (this.planter?.plantations != null && this.planter?.plantations?.length > 0) {
      for (let plantation of this.planter?.plantations!) {
        total += plantation.farmedArea;
      }
    }

    return total;
  }

  getAnnualProduction(): number {
    let annualProduction = 0;

    if (this.planter?.plantations != null && this.planter?.plantations?.length > 0) {
      for (let plantation of this.planter?.plantations!) {
        let totalProduction = 0;
        for (let production of plantation.productions!) {
          // if (production.year.getFullYear() == Date.now()) {
          totalProduction += production.productionInKg;
          // }
        }

        annualProduction += totalProduction;
      }
    }

    return annualProduction;
  }

  comingSoon() {
    this.notifService.comingSoon();
  }
}
