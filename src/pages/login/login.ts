import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController } from 'ionic-angular';

import { AuthProvider } from '../../providers/auth-provider';
import { SharedProvider } from '../../providers/shared-provider';

import { PlacesPage } from '../places/places';


@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  nav: NavController;

  credentials: any = {
    email: "",
    password: ""
  }

  constructor(private alertCtrl: AlertController, nav: NavController, public authProvider: AuthProvider, public sharedProvider: SharedProvider) {
    this.nav = nav;
  }

  errorAlert(_message) {
      let alert = this.alertCtrl.create({
        title: 'ERROR',
        subTitle: _message,
        buttons: ['OK']
      });
      alert.present();
    }

  handleLogin(){
    this.authProvider.login(this.credentials, (err, user) => {
        if(err){
          this.errorAlert("Invalid Credentials Entered !");
        }
        if(user){
            console.log("SUCCESSFULLY LOGGED IN >>> ", user);
            this.sharedProvider.setCurrentUser(user);
            this.nav.setRoot(PlacesPage, {});
        }else{
          console.log("No Data for User: >>> ", this.credentials);
        }
    });

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Login');
  }

}
