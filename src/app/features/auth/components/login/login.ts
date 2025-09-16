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
  rememberCtrl!: FormControl;

  constructor(private loginService: LoginService,
              private formBuilder: FormBuilder,
              private router: Router,
              private notifService: NotificationService) {}

  ngOnInit() {
    this.loading$ = this.loginService.loading$;

    this.emailCtrl = this.formBuilder.control(this.loginService.getEmailToRemember(), Validators.required);
    this.passwordCtrl = this.formBuilder.control('', Validators.required);
    this.rememberCtrl = this.formBuilder.control(false);

    this.loginForm = this.formBuilder.group({
      email: this.emailCtrl,
      password: this.passwordCtrl,
    })
  }

  login() {
    this.loginService.login(this.emailCtrl.value, this.passwordCtrl.value, this.rememberCtrl.value).subscribe({
      next: data => {
        if (data.token) {
          const urlParams = new URLSearchParams(window.location.search);
          const redirectUrl = urlParams.get('redirectUrl') || localStorage.getItem('previousUrl');

          if (urlParams.has('sessionExpired') && redirectUrl !== '/dashboard') {
            // Nettoyer le localStorage et naviguer sans recharger
            localStorage.removeItem('previousUrl');
            this.router.navigateByUrl(redirectUrl!, { replaceUrl: true })
              .then(() => this.notifService.showSuccess(`Content de vous revoir ${data.supervisor.firstname}`));
          } else {
            // Comportement normal
            this.router.navigateByUrl('/dashboard')
              .then(() => this.notifService.showSuccess(`Content de vous revoir ${data.supervisor.firstname}`));
          }
        }
      },
      error: error => {
        this.notifService.showError(error.message);
      }
    })
  }

  goToRegister() {
    this.router.navigateByUrl('/auth/register').then();
  }

  comingSoon() {
    this.notifService.comingSoon()
  }
}
