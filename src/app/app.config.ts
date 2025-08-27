import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';

import { routes } from './app.routes';
import {AuthModule} from './features/auth/auth-module';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi())
  ]
};
