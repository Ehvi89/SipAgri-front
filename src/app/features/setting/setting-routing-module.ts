import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {Account} from './components/account/account';
import {General} from './components/general/general';
import {Setting} from './setting';

const routes: Routes = [
  { path: "",
    component: Setting,
    children: [
      { path: "", component: Account },
      { path: "general", component: General },
      { path: "products", loadChildren: () => import('./modules/product/product-module').then(m => m.ProductModule) },
      { path: "kits", loadChildren: () => import('./modules/kit/kit-module').then(m => m.KitModule) },
      { path: "supervisors", loadChildren: () => import ('./modules/supervisor/supervisor-module').then(m => m.SupervisorModule)},
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingRoutingModule { }
