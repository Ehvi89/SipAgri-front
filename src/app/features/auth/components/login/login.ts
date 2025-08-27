import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {LoginService} from '../../services/login-service';
import {Router} from '@angular/router';
import {NotificationService} from '../../../../core/services/notification-service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnInit {
  loading$!: Observable<boolean>;

  loginForm!: FormGroup;
  emailCtrl!: FormControl;
  passwordCtrl!: FormControl;

  constructor(private loginService: LoginService,
              private formBuilder: FormBuilder,
              private router: Router,
              private notifService: NotificationService) {}

  ngOnInit() {
    this.loading$ = this.loginService.loading$;

    this.emailCtrl = this.formBuilder.control('', Validators.required);
    this.passwordCtrl = this.formBuilder.control('', Validators.required);

    this.loginForm = this.formBuilder.group({
      email: this.emailCtrl,
      password: this.passwordCtrl,
    })
  }

  login() {
    this.loginService.login(this.emailCtrl.value, this.passwordCtrl.value).subscribe({
      next: data => {
        if (data.token) {
          this.router.navigateByUrl('/').then(r => this.notifService.showSuccess(`Content de vous revoir ${data.supervisor.firstname}`));
        }
      },
      error: error => {
        this.notifService.showError(error.message);
      }
    })
  }

  goToRegister() {
    this.router.navigateByUrl('/auth/register');
  }

  comingSoon() {
    this.notifService.comingSoon()
  }
}
