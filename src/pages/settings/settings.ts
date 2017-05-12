import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

// import { SharedProvider } from '../../providers/shared-provider';

import { GatewayPage } from '../gateway/gateway';


@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  configurations:any = {notifications: true, syncWithCloud: true};

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
      console.log('ionViewDidLoad Settings');
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
