import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';

import { routes } from './app.routes';
import {AuthInterceptor} from './features/auth/interceptors/auth-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: LOCALE_ID, useValue: 'fr-FR' },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
};
