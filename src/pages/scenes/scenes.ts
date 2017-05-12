import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

import { SharedProvider } from '../../providers/shared-provider';
import { HbuddyProvider } from '../../providers/hbuddy-provider';

@IonicPage()
@Component({
  selector: 'page-scenes',
  templateUrl: 'scenes.html',
})
export class ScenesPage {

  selectedPlace: any;

  constructor(public navCtrl: NavController, public sharedProvider: SharedProvider, public hbuddyProvider: HbuddyProvider) {
    this.selectedPlace = this.sharedProvider.getSessionData("selectedPlace");
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Scenes: ', this.selectedPlace);
    this.fetchScenes(false, (err, scenes) => {
        this.selectedPlace.scenes = scenes;
    });
  }

  doRefresh(refresher){
    console.log("IN doRefresh for Scenes: >> ");
    this.fetchScenes(true, (err, scenes) => {
        this.selectedPlace.scenes = scenes;
        refresher.complete();
    });
  }

  fetchScenes(refresh, cb){
      console.log("IN fetchScenes for: ", this.selectedPlace);
      if(!this.selectedPlace.scenes || refresh){
        this.hbuddyProvider.fetchScenes(this.selectedPlace, (err, scenes) => {
            console.log("Fetched Place Scenes:  ", scenes);
            cb(err, scenes);
        });
      }else{
          cb(null, this.selectedPlace.scenes);
      }
  }

  editScene(scene){
      console.log("IN editScene: >> ", scene);
  }

  executeScene(scene){
      console.log("IN executeScene: >> ", scene);
  }

}
