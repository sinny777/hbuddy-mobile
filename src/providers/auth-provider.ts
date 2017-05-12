import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';

import { SharedProvider } from './shared-provider';

@Injectable()
export class AuthProvider {

    private headers: Headers;
    public reqOptions: RequestOptions;

  constructor(public http: Http, public sharedProvider: SharedProvider) {
      this.refreshHeaders();
  }

  private refreshHeaders(){
    this.headers = new Headers();
    this.headers.append('Content-Type', 'application/json');
    this.headers.append('Accept', 'application/json');
    this.headers.append("X-IBM-Client-Id", "default");
    this.headers.append("X-IBM-Client-Secret", "SECRET");
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

      return this.http.post(this.sharedProvider.CONFIG.API_BASE_URL +'/MyUsers/login', credentials, this.reqOptions)
      .subscribe(resp => {
          let user = resp.json();
          this.headers.append("Authorization", user.id);
          this.reqOptions = new RequestOptions({headers: this.headers});
          this.findUserById(user.userId, (err, profile)=>{
              if(profile){
                user.profile = profile;
              }
              cb(err, user);
          });
      }, (err) => {
        console.log("Login Failed:>> ", err);
        cb(err, null);
      });
  }

  private findUserById(userId, cb){
    if(!userId){
        cb(new Error("No User Found"), null);
    }else{
        let GET_URL: string = this.sharedProvider.CONFIG.API_BASE_URL + "/MyUsers/"+userId;
        return this.http.get(GET_URL, this.reqOptions)
        .subscribe(resp => {
            cb(null, resp.json());
        }, (err) => {
          console.log("Login Failed:>> ", err);
          cb(err, null);
        });
    }
  }

}
