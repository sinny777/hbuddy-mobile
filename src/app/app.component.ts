import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, NavController, LoadingController, ToastController } from 'ionic-angular';
import { Network } from '@ionic-native/network';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { LoginPage } from '../pages/login/login';
import { PlacesPage } from '../pages/places/places';
import { DashboardPage } from '../pages/dashboard/dashboard';
import { SettingsPage } from '../pages/settings/settings';
import { ContactPage } from '../pages/contact/contact';

import { SharedProvider } from '../providers/shared-provider';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  @ViewChild(Nav) nav: Nav;
  @ViewChild('content') content: NavController;

  rootPage:any;
  loader: any;

  pages: Array<{title: string, component: any, icon: string}>;

  constructor(private network: Network, private platform: Platform, private statusBar: StatusBar, private splashScreen: SplashScreen, private sharedProvider: SharedProvider, private loadingCtrl: LoadingController, private toastCtrl: ToastController) {
      this.presentLoading();
      platform.ready().then(() => {
        statusBar.styleDefault();
        splashScreen.hide();
        this.sharedProvider.initStorage((err, resp)=>{
          if(err){
            console.log("ERROR IN initStorage: >> ", err);
          }
          this.handleNetwork();
        });
      });

      if(this.sharedProvider.getCurrentUser()){
        this.rootPage = PlacesPage;
      }else{
        this.rootPage = LoginPage;
      }

      this.pages = [
        {"title": "My Places", component: PlacesPage, icon: "home"},
        {"title": "Dashboard", component: DashboardPage, icon: "speedometer"},
        {"title": "Settings", component: SettingsPage, icon: "construct"},
        {"title": "Contact Us", component: ContactPage, icon: "mail"},
      ]

      this.dismissLoading();
  }

  handleNetwork(){
      console.log("IN handleNetwork, Network.name: ");
      this.network.onDisconnect().subscribe(() => {
        console.log('network was disconnected :-(');
        this.sharedProvider.setSessionData("network", "offline");
        let toast = this.toastCtrl.create({
            message: 'You are Offline !',
            duration: 5000,
            position: 'top'
        });
        toast.present();
      });

      this.network.onConnect().subscribe(() => {
        console.log('network connected!'); 
        this.sharedProvider.setSessionData("network", "online");
        setTimeout(() => {
          if (this.network.type === 'wifi') {
            console.log('we got a wifi connection, woohoo!');
          }
        }, 3000);
      });
  }

  openPage(p){
    this.nav.setRoot(p.component);
  }

  presentLoading(){
      this.loader = this.loadingCtrl.create({
          content: "Please wait..."
      });
      this.loader.present();
  }

  dismissLoading(){
      this.loader.dismiss();
  }

  logout(){
    this.sharedProvider.refreshSession();
    this.sharedProvider.setCurrentUser(null);
    console.log("User Logged Out Successfully >>>>>>> ");
    this.nav.setRoot(LoginPage);
  }


}
