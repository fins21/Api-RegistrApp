import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListAsisPageRoutingModule } from './list-asis-routing.module';

import { ListAsisPage } from './list-asis.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListAsisPageRoutingModule
  ],
  declarations: [ListAsisPage]
})
export class ListAsisPageModule {}
