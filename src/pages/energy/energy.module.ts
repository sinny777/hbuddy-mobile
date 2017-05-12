import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EnergyPage } from './energy';

@NgModule({
  declarations: [
    EnergyPage,
  ],
  imports: [
    IonicPageModule.forChild(EnergyPage),
  ],
  exports: [
    EnergyPage
  ]
})
export class EnergyModule {}
