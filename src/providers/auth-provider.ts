import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { GooglePlus } from '@ionic-native/google-plus';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
import 'rxjs/add/operator/map';

import { SharedProvider } from './shared-provider';

@Injectable()
export class AuthProvider {

    public headers: Headers;
    private reqOptions: RequestOptions;
    private accessToken: any;

  constructor(public http: Http, public sharedProvider: SharedProvider, private googlePlus: GooglePlus, private fb: Facebook) {
      this.refreshHeaders();
  }

  private refreshHeaders(){
    this.headers = new Headers();
    this.headers.append('Content-Type', 'application/json');
    this.headers.append('Accept', 'application/json');
    this.headers.append('Access-Control-Allow-Origin', '*');    
    this.headers.append("X-IBM-Client-Id", "default");
    this.headers.append("X-IBM-Client-Secret", "SECRET");
    if(!this.accessToken){
      let currentUser = this.sharedProvider.getCurrentUser();
      if(currentUser){
        if(currentUser.identity){
            this.accessToken = currentUser.identity.id;
        }else if(currentUser.id){
          this.accessToken = currentUser.id;
        }

      }
    }
    this.headers.append("Authorization", this.accessToken);
    console.log("ACCESS_TOKEN: >>>> ", this.accessToken);
  }

  public login(credentials, cb){
    this.refreshHeaders();
    if(credentials.email == "demo" && credentials.password == "demo"){
      this.sharedProvider.getDemoData("currentUser").then(dummyUser =>{
          this.sharedProvider.setCurrentUser(dummyUser);
          cb(null, dummyUser);
      });
      return false;
    }

      var ONE_MONTH = 60 * 60 * 24 * 30;
      credentials.ttl = ONE_MONTH;
      this.refreshHeaders();
      this.reqOptions = new RequestOptions({headers: this.headers});
      return this.http.post(this.sharedProvider.CONFIG.API_BASE_URL +'/MyUsers/login?include=user', credentials, this.reqOptions)
      .subscribe(resp => {
          let user = resp.json();
          if(user.user){
            user.profile = user.user;
            delete user["user"];
          }
          this.accessToken = user.id;
          this.sharedProvider.setCurrentUser(user);
          cb(null, user);
      }, (err) => {
        console.log("Login Failed:>> ", err);
        cb(err, null);
      });
  }

  setAuthHeaders(){
    this.refreshHeaders();
  }

  handleGoogleLogin(cb){
      this.googlePlus.login({})
      .then(res => {
          cb(null, res);
      })
      .catch(err => {
        cb(err, null);
      });
  }

  handleFacebookLogin(cb){
    this.fb.login(['public_profile', 'email'])
    .then((res: FacebookLoginResponse) => {
        cb(null, res);
    })
    .catch(err => {
      cb(err, null);
    });
  }

  public loginWithThirdParty(payload, cb){
    console.log("IN loginWithThirdParty: >>> ", payload);
    if(!payload || !payload.profile){
        cb(new Error("Invalid data for login with ThirtParty: >> "), null);
    }else{
        this.setAuthHeaders();
        this.reqOptions = new RequestOptions({headers: this.headers});
        let POST_URL: string = this.sharedProvider.CONFIG.API_BASE_URL + "/UserIdentities/login";
        return this.http.post(POST_URL, payload, this.reqOptions)
        .subscribe(resp => {
            var user = resp.json();
            this.accessToken = user.identity.id;
            this.sharedProvider.setCurrentUser(user.user);
            cb(null, user);
        }, (err) => {
          console.log("Error in loginWithThirdParty:>> ", err);
          cb(err, null);
        });
    }
  }

  public fetchUserSettingsById(userId, cb){
    if(!userId){
        cb(new Error("No UserSettings Found for null UserId "), null);
    }else{
        if(this.sharedProvider.isDemoAccount()){
           cb(null, {});
           return false;
        }

        this.setAuthHeaders();
        console.log("Find UserSettings for : ", userId);
        this.reqOptions = new RequestOptions({headers: this.headers});
        let findReq: any = {filter: {where: {or: [{userId: userId}]}}};
        this.reqOptions.params = findReq;
        let GET_URL: string = this.sharedProvider.CONFIG.API_BASE_URL + "/UserSettings";
        return this.http.get(GET_URL, this.reqOptions)
        .subscribe(resp => {
            cb(null, resp.json());
        }, (err) => {
          console.log("Error in fetchUserSettingsById:>> ", err);
          cb(err, null);
        });
    }
  }

  public saveUserSettings(userSettings, cb){
    console.log("IN saveUserSettings: >>> ", userSettings);
    if(!userSettings || !userSettings.userId){
        cb(new Error("No UserSettings to Save"), null);
    }else{
        this.setAuthHeaders();
        this.reqOptions = new RequestOptions({headers: this.headers});
        let POST_URL: string = this.sharedProvider.CONFIG.API_BASE_URL + "/UserSettings";
        if(userSettings.id){
          POST_URL = POST_URL + "/"+userSettings.id;
        }
        return this.http.put(POST_URL, userSettings, this.reqOptions)
        .subscribe(resp => {
            cb(null, resp.json());
        }, (err) => {
          console.log("Error in saveUserSettings:>> ", err);
          cb(err, null);
        });
    }
  }

  logout(cb){
    let user = this.sharedProvider.getCurrentUser();
    if(user && user.type == 'google'){
      this.googlePlus.logout()
      .then(res => {
          this.sharedProvider.refreshSession();
          this.sharedProvider.setCurrentUser(null);
          console.log("Google User Logged Out Successfully >>>>>>> ");
          cb(null, res);
      })
      .catch(err => {
        cb(err, null);
      });
    }else{
      this.sharedProvider.refreshSession();
      this.sharedProvider.setCurrentUser(null);
      console.log("Hukam User Logged Out Successfully >>>>>>> ");
      cb(null, "SUCCESS");
    }

  }


}
