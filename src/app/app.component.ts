import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, NavController, ToastController, Events } from 'ionic-angular';
import { Network } from '@ionic-native/network';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { LoginPage } from '../pages/login/login';
import { PlacesPage } from '../pages/places/places';
import { DashboardPage } from '../pages/dashboard/dashboard';
import { ContactPage } from '../pages/contact/contact';
// import { CamerasPage } from '../pages/cameras/cameras';

import { AuthProvider } from '../providers/auth-provider';
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

  constructor(private network: Network, private platform: Platform, private statusBar: StatusBar, private splashScreen: SplashScreen, private sharedProvider: SharedProvider, private authProvider: AuthProvider, private toastCtrl: ToastController, private events: Events) {
      this.sharedProvider.presentLoading("Please wait...");
      platform.ready().then(() => {
        statusBar.styleDefault();
        splashScreen.hide();
        this.handleAuthRequired();
        this.sharedProvider.initStorage((err, resp)=>{
          if(err){
            console.log("ERROR IN initStorage: >> ", err);
          }else{
            console.log("initStorage Resp: >> ", resp);
          }

          if(this.sharedProvider.getCurrentUser()){
            console.log("currentUser: >> ", this.sharedProvider.getCurrentUser());
            this.rootPage = PlacesPage;
          }else{
            console.log("No currentUser in session: >> ");
            this.sharedProvider.getStorageData("currentUser", (user) =>{
              console.log("get currentUser from Storage: >> ", user);
                if(user && user.id){
                    this.sharedProvider.setCurrentUser(user);
                    this.rootPage = PlacesPage;                    
                }else{
                    this.rootPage = LoginPage;
                }
            });
          }

          if(!platform.is('core') && !platform.is('mobileweb')) {
            this.handleNetwork();
            this.sharedProvider.initPushNotification();
          }

          this.sharedProvider.dismissLoading();

        });
      });

      this.pages = [
        {"title": "My Places", component: PlacesPage, icon: "home"},
        {"title": "Dashboard", component: DashboardPage, icon: "speedometer"},
        {"title": "Contact Us", component: ContactPage, icon: "mail"},
      ]

  }

  handleAuthRequired(){
    this.events.subscribe('auth:required', () => {
        console.log('Authentication Required !!!');
        this.logout();
    });
  }

  handleNetwork(){
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

  logout(){
    this.authProvider.logout(()=>{
      this.sharedProvider.refreshSession();
      this.sharedProvider.setCurrentUser(null);
      this.nav.setRoot(LoginPage);
    });
  }


}
