import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PlaceAreasPage } from './place-areas';

@NgModule({
  declarations: [
    PlaceAreasPage,
  ],
  imports: [
    IonicPageModule.forChild(PlaceAreasPage),
  ],
  exports: [
    PlaceAreasPage
  ]
})
export class PlaceAreasModule {}
