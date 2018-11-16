import { Component } from '@angular/core';
import { NavController, NavParams, Events } from 'ionic-angular';

import { SharedProvider } from '../../providers/shared-provider';
import { HbuddyProvider } from '../../providers/hbuddy-provider';

import { GatewayPage } from '../gateway/gateway';
import { CamerasPage } from '../cameras/cameras';


@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  private currentUser: any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private sharedProvider: SharedProvider, public hbuddyProvider: HbuddyProvider, private events: Events) {
      this.currentUser = this.sharedProvider.getCurrentUser();
      console.log("this.currentUser: >>>> ", this.currentUser)
  }

  ionViewDidLoad() {
      console.log('ionViewDidLoad Settings');
      let selectedPlace: any = this.sharedProvider.getSessionData("selectedPlace");
      if(!this.currentUser || !this.currentUser.id || !selectedPlace){
          this.events.publish("auth:required", new Error("User not found !"));
          return false;
      }
      if(!this.currentUser.userSettings){
        this.currentUser.userSettings = {
                                        	"userId": this.currentUser.id,
                                        	"placeId": selectedPlace.id,
                                        	"type": "MOBILE_APP",
                                        	"config": {
                                        		"notify": true,
                                        		"syncWithCloud": true
                                        	}
                                        };
      }
      console.log("UserSetting: >>> ", this.currentUser.userSettings)
  }

  showConfigureGateway(){
    console.log("IN showConfigureGateway: >>> ");
    this.navCtrl.push(GatewayPage, {});
  }

  showCameras(){
    console.log("IN showCameras: >>> ");
    this.navCtrl.push(CamerasPage, {});
  }

  toggleNotifications(){
      console.log("IN toggleNotifications:>> ");
      // this.configurations.notifications = !this.configuration.notifications;
  }

  toggleSyncWithCloud(){
      console.log("IN toggleSyncWithCloud:>> ");
      // this.configurations.syncWithCloud = !this.configuration.syncWithCloud;
  }

  updateSettings(){
    console.log("IN updateSettings: >> ", this.currentUser.userSettings);
    this.hbuddyProvider.saveUserSettings(this.currentUser.userSettings).then( savedSettings => {
      console.log("Saved UserSettings:  ", savedSettings);
      this.currentUser.userSettings = savedSettings;
    },
    error => {
        if(error.status == 401){
          this.events.publish("auth:required", error);
        }else{
          console.log("ERROR: >>> ", error);
        }
    });
  }

}
