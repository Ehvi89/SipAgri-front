import { Routes } from '@angular/router';
import { AuthGuard } from './features/auth/guards/auth-guard';
import {Dashboard} from './core/components/dashbord/dashboard';
import {ErrorComponent} from './core/components/error/error.component';
import {DataExport} from './share/components/data-export/data-export';

export const routes: Routes = [
  { path: "dashboard", component: Dashboard, canActivate: [AuthGuard], runGuardsAndResolvers: "always" },
  { path: "export", component: DataExport},
  { path: "auth", loadChildren: () => import('./features/auth/auth-module')
      .then(m => m.AuthModule) },
  { path: "planters", loadChildren: () => import("./features/planter/planter-module")
      .then(m => m.PlanterModule), canActivate: [AuthGuard], runGuardsAndResolvers: "always" },
  { path: "plantations", loadChildren: () => import("./features/plantation/plantation-module")
      .then(m => m.PlantationModule) },
  { path: "productions", loadChildren: () => import("./features/production/production-module")
      .then(m => m.ProductionModule) },
  { path: "settings", loadChildren: () => import("./features/setting/setting-module")
      .then(m => m.SettingModule) },
  { path: "error", component: ErrorComponent },
  { path: "", redirectTo: "dashboard", pathMatch: "full" },
  { path: "**", redirectTo: "error" },
];
