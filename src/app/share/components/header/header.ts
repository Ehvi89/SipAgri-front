import {Component, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl} from '@angular/forms';
import {tap} from 'rxjs/operators';
import {Supervisor} from '../../../core/models/supervisor-model';
import {AuthService} from '../../../features/auth/services/auth-service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit {
  @Input({ required: true }) placeholder!: string;
  @Output() text!: string;

  user!: Supervisor;

  searchCtrl!: FormControl;

  constructor(private formBuilder: FormBuilder,
              private authService: AuthService,) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    this.searchCtrl = this.formBuilder.control('');

    this.searchCtrl.valueChanges.pipe(
      tap((value: string) => {this.text = value;}),
    ).subscribe()
  }

  logout(): void {
    this.authService.logout();
  }
}
