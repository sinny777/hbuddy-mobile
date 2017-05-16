import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { SharedProvider } from '../../providers/shared-provider';

import { GatewayPage } from '../gateway/gateway';


@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  userSetting:any = {notify: true, syncWithCloud: true};
  currentUser: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, private sharedProvider: SharedProvider) {

  }

  ionViewDidLoad() {
      console.log('ionViewDidLoad Settings');
      this.currentUser = this.sharedProvider.getCurrentUser();
      let selectedPlace: any = this.sharedProvider.getSessionData("selectedPlace");
      this.userSetting.placeId = selectedPlace.id;
      if(this.currentUser && this.currentUser.userSettings){
        for(let setting of this.currentUser.userSettings){
            if(selectedPlace.id == setting.placeId){
                this.userSetting = setting;
            }
        }
      }
  }

  showConfigureGateway(){
    console.log("IN showConfigureGateway: >>> ");
    this.navCtrl.push(GatewayPage, {});
  }

  toggleNotifications(){
      console.log("IN toggleNotifications:>> ");
      // this.configurations.notifications = !this.configuration.notifications;
  }

  toggleSyncWithCloud(){
      console.log("IN toggleSyncWithCloud:>> ");
      // this.configurations.syncWithCloud = !this.configuration.syncWithCloud;
  }

}
