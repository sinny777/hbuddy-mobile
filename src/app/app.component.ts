import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, NavController, LoadingController } from 'ionic-angular';
import { Http } from '@angular/http';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { LoginPage } from '../pages/login/login';
import { PlacesPage } from '../pages/places/places';
import { DashboardPage } from '../pages/dashboard/dashboard';
import { SettingsPage } from '../pages/settings/settings';
import { ContactPage } from '../pages/contact/contact';

import { AuthProvider } from '../providers/auth-provider';
import { Storage } from '@ionic/storage';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  @ViewChild(Nav) nav: Nav;
  @ViewChild('content') content: NavController;
  // @ViewChild(Menu) menu: Menu;

  rootPage:any;
  loader: any;

  pages: Array<{title: string, component: any, icon: string}>;

  constructor(private storage: Storage, platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, public authProvider: AuthProvider, public loadingCtrl: LoadingController, public http: Http) {
      platform.ready().then(() => {
        statusBar.styleDefault();
        splashScreen.hide();
        this.storage.ready().then(() => {
            this.setupLocalStorage();
        });

        if (platform.is('ios')) {
          console.log("I'm an iOS device!");
        }

        if (platform.is('android')) {
          console.log("I'm an Android device!");
        }

      });

      this.presentLoading();

      this.authProvider.isUserLoggedIn().then((isLoggedIn) => {
          if(isLoggedIn){
              this.rootPage = PlacesPage;
          }else{
            this.rootPage = LoginPage;
          }
          this.loader.dismiss();
      });

      this.pages = [
        {"title": "My Places", component: PlacesPage, icon: "home"},
        {"title": "Dashboard", component: DashboardPage, icon: "speedometer"},
        {"title": "Settings", component: SettingsPage, icon: "construct"},
        {"title": "Contact Us", component: ContactPage, icon: "mail"},
      ]
  }

  setupLocalStorage(){
    this.storage.clear().then(() => {
      console.log('Local Storage Cleared ');
      this.http.get('assets/data/demoData.json')
        .map((res) => res.json())
        .subscribe(data => {
            this.storage.set("demoData", data.demoData);
        }, (rej) => {console.error("Could not load local data", rej)});
    });
  }

  presentLoading(){
      this.loader = this.loadingCtrl.create({
          content: "Please wait..."
      });

      this.loader.present();
  }

  openPage(p){
    this.nav.setRoot(p.component);
  }

  logout(){
    this.authProvider.logout(() => {
        this.nav.setRoot(LoginPage);
        console.log("User Logged Out Successfully >>>>>>> ");
    });
  }


}
