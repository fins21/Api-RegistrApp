import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ProfeHomePageRoutingModule } from './profe-home-routing.module';
import { ProfeHomePage } from './profe-home.page';
import { QRCodeModule } from 'angularx-qrcode';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfeHomePageRoutingModule,
    QRCodeModule
  ],
  declarations: [ProfeHomePage]
})
export class ProfeHomePageModule {}