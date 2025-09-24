import { Routes } from '@angular/router';
import { AuthGuard } from './features/auth/guards/auth-guard';
import {Dashboard} from './core/components/dashbord/dashboard';
import {ErrorComponent} from './core/components/error/error.component';

export const routes: Routes = [
  { path: "dashboard", component: Dashboard, canActivate: [AuthGuard], runGuardsAndResolvers: "always" },
  { path: "auth", loadChildren: () => import('./features/auth/auth-module').then(m => m.AuthModule) },
  { path: "planters", loadChildren: () => import("./features/planter/planter-module")
      .then(m => m.PlanterModule), canActivate: [AuthGuard], runGuardsAndResolvers: "always" },
  { path: "plantations", loadChildren: () => import("./features/plantation/plantation-module")
      .then(m => m.PlantationModule) },
  { path: "productions", loadChildren: () => import("./features/production/production-module")
      .then(m => m.ProductionModule) },
  { path: "error", component: ErrorComponent },
  { path: "", redirectTo: "dashboard", pathMatch: "full" },
  { path: "**", redirectTo: "error" },
];
