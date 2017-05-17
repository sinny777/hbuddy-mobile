import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { GooglePlus } from '@ionic-native/google-plus';
import 'rxjs/add/operator/map';

import { SharedProvider } from './shared-provider';

@Injectable()
export class AuthProvider {

    private headers: Headers;
    public reqOptions: RequestOptions;

  constructor(public http: Http, public sharedProvider: SharedProvider, private googlePlus: GooglePlus) {
      this.refreshHeaders();
  }

  private refreshHeaders(){
    this.headers = new Headers();
    this.headers.append('Content-Type', 'application/json');
    this.headers.append('Accept', 'application/json');
    this.headers.append("X-IBM-Client-Id", "default");
    this.headers.append("X-IBM-Client-Secret", "SECRET");
    if(this.sharedProvider.getCurrentUser() && this.sharedProvider.getCurrentUser().id){
      this.headers.append("Authorization", this.sharedProvider.getCurrentUser().id);
    }
    this.reqOptions = new RequestOptions({headers: this.headers});    
  }

  public login(credentials, cb){
    // console.log("Credentials: >> ", JSON.stringify(credentials));
    this.refreshHeaders();
    if(credentials.email == "demo" && credentials.password == "demo"){
      this.sharedProvider.getDemoData("currentUser", (dummyUser)=>{
          this.sharedProvider.setCurrentUser(dummyUser);
          console.log("this.currentUser Data: >>>> ", dummyUser);
          cb(null, dummyUser);
      });
      return false;
    }

      return this.http.post(this.sharedProvider.CONFIG.API_BASE_URL +'/MyUsers/login?include=user', credentials, this.reqOptions)
      .subscribe(resp => {
          let user = resp.json();
          if(user.user){
            user.profile = user.user;
            delete user["user"];
          }
          this.sharedProvider.setCurrentUser(user);
          console.log("USER OBJ AFTER LOGIN: >> ", user);
          this.refreshHeaders();
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

  public fetchUserSettingsById(userId, cb){
    delete this.reqOptions["params"];
    if(!userId){
        cb(new Error("No UserSettings Found"), null);
    }else{
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
    delete this.reqOptions["params"];
    if(!userSettings){
        cb(new Error("No UserSettings to Save"), null);
    }else{
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
