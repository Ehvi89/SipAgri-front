import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {Account} from './components/account/account';
import {General} from './components/general/general';

const routes: Routes = [
  { path: "account", component: Account },
  { path: "general", component: General },
  { path: "products", loadChildren: () => import('./modules/product/product-module').then(m => m.ProductModule) },
  { path: "kits", loadChildren: () => import('./modules/kit/kit-module').then(m => m.KitModule) },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingRoutingModule { }
