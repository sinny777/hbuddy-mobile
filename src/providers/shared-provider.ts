import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Storage } from '@ionic/storage';

@Injectable()
export class SharedProvider {

  private forDemo: boolean = false;
  private sharedData: any;

  public CONFIG = {
                    API_BASE_URL: "http://granslive-web.mybluemix.net/api",
                    GATEWAY_TYPE: "HukamGateway",
                    MQTT_OPTIONS: {
                                    api_key: "a-o6oosq-dyotpfmyhq",
                                    auth_token: "skJ0-ZuchsIfN7cwFW",
                                    orgId: "o6oosq",
                                    clientId: "a:o6oosq:",
                                    hostname: "o6oosq.messaging.internetofthings.ibmcloud.com",
                                    port: 8883,
                                    protocol: "https",
                                    connectOnCreate: false,
                                    path: '/mqtt',
                                    keepAliveInterval: 3600,
                                    useSSL: true
                                  }
                  };

  constructor(private storage: Storage, private http: Http) {
    console.log('Hello SharedProvider Provider');
    this.sharedData = {};
  }

  public setForDemoAccount(forDemo){
    this.forDemo = forDemo;
  }

  public isDemoAccount(){
    return this.forDemo;
  }

  public getData(){
    return this.sharedData;
  }

  public refreshData(){
    this.sharedData = {};
    this.forDemo = false;
  }

  public getDemoData(key, cb){
    this.storage.get('demoData').then((data) => {
          let jsonObj: any = data[key];
          console.log("Data for ", key, ": >>", jsonObj);
          cb(jsonObj);
          return jsonObj;
       })
  }

}
