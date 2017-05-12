import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';

import { SharedProvider } from './shared-provider';

@Injectable()
export class AuthProvider {

    private currentUser: any;
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

  public isUserLoggedIn(){
    return new Promise((resolve) => {
        resolve(this.currentUser != null);
    });
  }

  public getCurrentUser(){
    return this.currentUser;
  }

  public login(credentials, cb){
    // console.log("Credentials: >> ", JSON.stringify(credentials));
    this.refreshHeaders();
    if(credentials.email == "demo" && credentials.password == "demo"){
      // this.currentUser = {username: "demo", password: "demo", type: "demo"};
      this.sharedProvider.getDemoData("currentUser", (dummyUser)=>{
          this.currentUser = dummyUser;
          console.log("this.currentUser Data: >>>> ", this.currentUser);
          cb(null, this.currentUser);

      });
      return false;
    }

      return this.http.post(this.sharedProvider.CONFIG.API_BASE_URL +'/MyUsers/login', credentials, this.reqOptions)
      .subscribe(resp => {
          this.currentUser = resp.json();
          this.findUserById(cb);
          // cb(null, this.currentUser);
      }, (err) => {
        console.log("Login Failed:>> ", err);
        cb(err, null);
      });
  }

  public logout(cb){
    this.sharedProvider.refreshData();
    cb();
  }

  private findUserById(cb){
    if(!this.currentUser){
        cb("No User Found", null);
    }else{
        this.headers.append("Authorization", this.currentUser.id);
        this.reqOptions = new RequestOptions({headers: this.headers});
        let GET_URL: string = this.sharedProvider.CONFIG.API_BASE_URL + "/MyUsers/"+this.currentUser.userId;
        return this.http.get(GET_URL, this.reqOptions)
        .subscribe(resp => {
            this.currentUser.profile = resp.json();
            cb(null, this.currentUser);
        }, (err) => {
          console.log("Login Failed:>> ", err);
          cb(err, null);
        });
    }
  }

}
