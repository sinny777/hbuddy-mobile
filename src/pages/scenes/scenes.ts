import { Component } from '@angular/core';
import { NavController, Events } from 'ionic-angular';

import { SharedProvider } from '../../providers/shared-provider';
import { HbuddyProvider } from '../../providers/hbuddy-provider';

@Component({
  selector: 'page-scenes',
  templateUrl: 'scenes.html',
})
export class ScenesPage {

  private selectedPlace: any;
  private scenes;

  constructor(public navCtrl: NavController, public sharedProvider: SharedProvider, public hbuddyProvider: HbuddyProvider, private events: Events) {
    this.selectedPlace = this.sharedProvider.getSessionData("selectedPlace");
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Scenes: ', this.selectedPlace);
    this.sharedProvider.presentLoading("Fetching scenes...");
    this.fetchScenes(false, (err, scenes) => {
        this.scenes = scenes;
        this.sharedProvider.dismissLoading();
    });
  }

  doRefresh(refresher){
    console.log("IN doRefresh for Scenes: >> ");
    this.fetchScenes(true, (err, scenes) => {
        this.scenes = scenes;
        refresher.complete();
    });
  }

  fetchScenes(refresh, cb){
      this.scenes = this.sharedProvider.getSessionData(this.selectedPlace.id+"_SCENES");
      if(!this.scenes || refresh){
        this.hbuddyProvider.fetchScenes(this.selectedPlace).then(scenes =>{
          console.log("Fetched Place Scenes:  ", scenes);
          this.sharedProvider.setSessionData(this.selectedPlace.id+"_SCENES", scenes);
          cb(null, scenes);
        },
        error => {
            if(error.status == 401){
              this.events.publish("auth:required", error);
            }else{
              cb(error, null);
            }
        });
      }else{
          cb(null, this.scenes);
      }
  }

  editScene(scene){
      console.log("IN editScene: >> ", scene);
  }

  executeScene(scene){
      console.log("IN executeScene: >> ", scene);
  }

}
