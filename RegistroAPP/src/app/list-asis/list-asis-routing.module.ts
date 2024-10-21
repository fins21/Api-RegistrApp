import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListAsisPage } from './list-asis.page';

const routes: Routes = [
  {
    path: '',
    component: ListAsisPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListAsisPageRoutingModule {}
