import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';

import { AuthProvider } from '../../providers/auth-provider';
import { SharedProvider } from '../../providers/shared-provider';

import { PlacesPage } from '../places/places';


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

  errorAlert(_message, err) {
    console.log("\n\nerrorAlert: >> ", JSON.stringify(err));
      let alert: any = this.alertCtrl.create({
        title: 'ERROR',
        subTitle: _message,
        buttons: ['OK']
      });
      alert.present();
      this.sharedProvider.dismissLoading();
    }

  handleLogin(){
    this.sharedProvider.presentLoading("Please wait...");
    this.authProvider.login(this.credentials, (err, user) => {
        if(err){
          this.errorAlert("Invalid Credentials Entered !", err);
        }
        if(user){
            console.log("SUCCESSFULLY LOGGED IN >>> ", user);
            this.authProvider.setAuthHeaders();
            if(!user.type){
              user.type = "hukam";
            }
            this.authProvider.fetchUserSettingsById(user.userId, (err, userSettings) => {
              user.userSettings = userSettings;
              console.log("\n\nUser with userSettings: >>> ", JSON.stringify(user));
              this.sharedProvider.setCurrentUser(user);
              this.updateDeviceRegistrationId();
              this.sharedProvider.dismissLoading();
              this.nav.setRoot(PlacesPage, {});
            });
        }else{
          console.log("No Data for User: >>> ", this.credentials);
        }
    });
  }

  handleGoogleLogin(){
      this.authProvider.handleGoogleLogin((err, user) => {
        if(err){
          this.errorAlert("Erron in Google Login !", err);
          return false;
        }
        console.log("SUCCESSFULLY LOGGED IN >>> ", JSON.stringify(user));
        if(!user.type){
          user.type = "google";
        }
        this.syncUserWithBackendApp(user, "google", function(err, resp){
            console.log("syncUserWithBackendApp RESP: >> ", resp);
        });

      });
  }

  handleFacebookLogin(){
      this.authProvider.handleFacebookLogin((err, response) => {
        if(err){
          this.errorAlert("Erron in Facebook Login !", err);
          return false;
        }
        let user = response.authResponse;
        // console.log("SUCCESSFULLY LOGGED IN >>> ", JSON.stringify(user));
        if(!user.type){
          user.type = "facebook";
        }

        user.userId = user.userID;
        console.log("Returned user Obj after Facebook Login: >>> ", JSON.stringify(user));

        this.authProvider.setAuthHeaders();
        this.authProvider.fetchUserSettingsById(user.userID, (err, userSettings) => {
          if(err){
            console.log("Error while fetching userSettings: >> ", err);
          }
          user.userSettings = userSettings;
          user.userId = user.userID;
          delete user["userID"];
          console.log("\n\nUser with userSettings: >>> ", JSON.stringify(user));
          this.sharedProvider.setCurrentUser(user);
          this.updateDeviceRegistrationId();
          this.nav.setRoot(PlacesPage, {});
        });
      });
  }

  syncUserWithBackendApp(externalUserObj, provider, cb){
    var credentials:any = {};
    credentials.accessToken = externalUserObj.accessToken;
    credentials.refreshToken = externalUserObj.refreshToken;

     var profile: any = {};
     profile.id = externalUserObj.userId;
     profile.emails = [{type:'account', value: externalUserObj.email}];
     var payload: any = {"provider": provider, "authScheme": "oAuth 2.0", "profile": profile, "credentials": credentials, "options": {autoLogin:true} };

     this.authProvider.loginWithThirdParty(payload, (err, userData) => {
       // console.log("\n\nRESP from loginWithThirdParty:>>  ", userData);
       this.authProvider.setAuthHeaders();
       this.authProvider.fetchUserSettingsById(userData.identity.userId, (err, userSettings) => {
         userData.user.userSettings = userSettings;
         console.log("\n\nUser with userSettings: >>> ", JSON.stringify(userData.user));
         this.sharedProvider.setCurrentUser(userData.user);
         this.updateDeviceRegistrationId();
         this.nav.setRoot(PlacesPage, {});
       });
       cb(err, "USER LOGGEDIN SUCCESSFULLY >>>>>>>> ");
     });

  }

  updateDeviceRegistrationId(){
      let user: any = this.sharedProvider.getCurrentUser();
      let registrationId: string = this.sharedProvider.getSessionData("registrationId");
      if(!registrationId){
        console.log("No registrationId for user: ", JSON.stringify(user));
        return false;
      }
      if(user.userSettings){
        for(let setting of user.userSettings){
          if(!setting.registrationId || setting.registrationId != registrationId){
              setting.registrationId = registrationId;
              setting.timestamp = new Date();
              this.authProvider.saveUserSettings(setting, (err, savedSetting) =>{
                  console.log("Updated UserSettings: >>> ", savedSetting);
              });
          }else{
              console.log("Device registrationId is still the same: >> ", registrationId);
          }
        }
      }else{
        user.userSettings = [];
        let setting: any = {};
        setting.userId = user.id;
        if(user.userId){
            setting.userId = user.userId;
        }
        setting.timestamp = new Date();
        setting.registrationId = registrationId;
        setting.notify = true;
        setting.syncWithCloud = true;
        this.authProvider.saveUserSettings(setting, (err, savedSetting)=>{
            console.log("Created UserSettings: >>> ", savedSetting);
            user.userSettings.push(savedSetting);
        });
      }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Login');
  }

}
