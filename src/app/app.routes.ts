import { Routes } from '@angular/router';
import { AuthGuard } from './features/auth/guards/auth-guard';
import {App} from './app';

export const routes: Routes = [
  { path: "", component: App, canActivate: [AuthGuard], runGuardsAndResolvers: "always" },
  { path: "auth", loadChildren: () => import('./features/auth/auth-module').then(m => m.AuthModule) },
  { path: "**", redirectTo: "auth" }
];
