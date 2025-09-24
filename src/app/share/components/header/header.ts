import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import {FormBuilder, FormControl} from '@angular/forms';
import {tap} from 'rxjs/operators';
import {Supervisor} from '../../../core/models/supervisor-model';
import {AuthService} from '../../../features/auth/services/auth-service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit {
  @Input({ required: true }) placeholder!: string;
  @Input() breadcrumb!: boolean;
  @Output() textChange = new EventEmitter<string>();

  user!: Supervisor;
  navs!: string[];
  searchCtrl!: FormControl;

  constructor(private formBuilder: FormBuilder,
              private authService: AuthService,
              private router: Router) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    this.searchCtrl = this.formBuilder.control('');

    this.searchCtrl.valueChanges.pipe(
      tap((value: string) => this.textChange.emit(value)),
    ).subscribe()

    const url = this.router.url.split('?')[0];
    this.navs = url.split("/").slice(1);
  }

  logout(): void {
    this.authService.logout().subscribe();
  }

  getRouterLink(index: number): string {
    return '/' + this.navs.slice(0, index + 1).join('/');
  }
}
