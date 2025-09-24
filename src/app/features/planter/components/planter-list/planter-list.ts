import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, combineLatest, map, Observable} from 'rxjs';
import {Planter} from '../../../../core/models/planter-model';
import {PlanterService} from '../../services/planter-service';
import {PaginationResponse} from '../../../../core/models/pagination-response-model';
import {FormBuilder, FormControl} from '@angular/forms';
import {startWith, tap} from 'rxjs/operators';
import {Router} from '@angular/router';

@Component({
  selector: 'app-planter-list',
  standalone: false,
  templateUrl: './planter-list.html',
  styleUrl: './planter-list.scss'
})
export class PlanterList implements OnInit {
  loading$!: Observable<boolean>;
  plantersPaged$!: Observable<PaginationResponse<Planter> | null>;
  planters$!: Observable<Planter[]>;
  searchSubject = new BehaviorSubject<string>('');
  listSizeCtrl!: FormControl<number | null>;
  listFiltersCtrl!: FormControl<string | null>;

  constructor(private planterService: PlanterService,
              private formBuilder: FormBuilder,
              private router: Router,) {}

  ngOnInit() {
    this.listSizeCtrl = this.formBuilder.control(10);
    this.listSizeCtrl.valueChanges.pipe(
      tap(size => this.planterService.getAllPaged(0, size!))
    ).subscribe();

    this.listFiltersCtrl = this.formBuilder.control('Toutes les régions');

    this.loading$ = this.planterService.loading$;
    this.planterService.getAllPaged(0, this.listSizeCtrl.value!).subscribe();

    this.plantersPaged$ = this.planterService.pagedData$;

    this.planters$ = combineLatest([
      this.planterService.getAll(),
      this.listFiltersCtrl.valueChanges.pipe(startWith(''))
    ]).pipe(
      map(([planters, filter]) => {
        return planters.filter(planter => {
          return !filter || filter === 'Toutes les régions' ||
            planter.village.toLowerCase().includes(filter.toLowerCase());
        });
      })
    );
  }

  loadNextPage(): void {
    this.planterService.loadNextData(this.listSizeCtrl.value!);
  }

  loadPreviousPage(): void {
    this.planterService.loadPreviousData(this.listSizeCtrl.value!);
  }

  onSearch(text: any): void {
    // console.log(text);
    this.planterService.search(text, undefined, this.listSizeCtrl.value!);
  }

  getUniqueVillages(): string[] {
    // Cette méthode devrait idéalement être un Observable
    // Pour simplifier, on retourne un tableau vide ici.
    // Vous devriez l'implémenter selon vos besoins.
    return ['Toutes les régions'];
  }

  viewProfile(planter: Planter): void {
    this.router.navigate(['/planters/profile'], {
      queryParams: {planter: planter.id}
    }).then(null);
  }
}
