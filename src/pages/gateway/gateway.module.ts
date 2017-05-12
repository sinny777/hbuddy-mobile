import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GatewayPage } from './gateway';

@NgModule({
  declarations: [
    GatewayPage,
  ],
  imports: [
    IonicPageModule.forChild(GatewayPage),
  ],
  exports: [
    GatewayPage
  ]
})
export class GatewayModule {}
