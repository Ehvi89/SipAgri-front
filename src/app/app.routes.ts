import { Routes } from '@angular/router';
import { AuthGuard } from './features/auth/guards/auth-guard';
import {Dashboard} from './core/components/dashbord/dashboard';
import {ErrorComponent} from './core/components/error/error.component';

export const routes: Routes = [
  { path: "", component: Dashboard, canActivate: [AuthGuard], runGuardsAndResolvers: "always" },
  { path: "auth", loadChildren: () => import('./features/auth/auth-module').then(m => m.AuthModule) },
  { path: "error", component: ErrorComponent },
  { path: "**", redirectTo: "error" },
];
