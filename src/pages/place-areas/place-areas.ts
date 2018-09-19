import { Component } from '@angular/core';
import { NavController, NavParams, Events } from 'ionic-angular';

import { SharedProvider } from '../../providers/shared-provider';
import { HbuddyProvider } from '../../providers/hbuddy-provider';
import { MqttProvider } from '../../providers/mqtt-provider'
import { SpeechProvider } from '../../providers/speech-provider'

import { DevicesPage } from '../devices/devices';
import { SettingsPage } from '../settings/settings';

@Component({
  selector: 'page-place-areas',
  templateUrl: 'place-areas.html',
})
export class PlaceAreasPage {

  private currentUser: any;
  private isListening: boolean = false;
  private conversationContext = {"initConversation": false};
  private selectedPlace: any;
  private placeAreas: any;
  private selectedPlaceArea: any;
  private connectionOptions: any = {};
  private showPlaceAreas: boolean = true;
  private showAddUpdatePlaceArea: boolean = false;
  private floors = ["Ground"];
  placeAreaTypes = ['livingroom', 'bedroom', 'bathroom', 'kitchen', 'store', 'gallery', 'parking', 'balcony', 'other'];

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public sharedProvider: SharedProvider, public hbuddyProvider: HbuddyProvider,
              public mqttProvider: MqttProvider, private events: Events, private speechProvider: SpeechProvider) {
              this.selectedPlace = navParams.get('selectedPlace');
              if(!this.selectedPlace){
                this.selectedPlace = this.sharedProvider.getSessionData("selectedPlace");
              }
              for(let i = 1; i <= 150; i++){
      				      this.floors.push(''+i);
      			  }
  }

  ionViewDidLoad() {
    this.currentUser = this.sharedProvider.getCurrentUser();
    if(!this.currentUser || !this.currentUser.id || !this.selectedPlace){
        this.events.publish("auth:required", new Error("User not found !"));
        return false;
    }
    if(!this.sharedProvider.isDemoAccount()){
      let placeTopic: string = "iot-2/type/" +this.sharedProvider.CONFIG.GATEWAY_TYPE +"/id/"+this.selectedPlace.gatewayId+"/cmd/gateway/fmt/json";
      this.connectionOptions.subscribeToTopic = placeTopic;
      this.mqttProvider.connectMQTT(this.connectionOptions);
      this.sharedProvider.subscribeToTopic(this.selectedPlace.gatewayId);
      console.log("Notifications subscribed to >>>> ", this.selectedPlace.gatewayId);
    }

    this.sharedProvider.presentLoading("Fetching place areas...");
    console.log("selectedPlace: >>>> ", JSON.stringify(this.selectedPlace));
    this.getUserSetting((err, settings)  => {
        if(!settings || !settings.id){
          settings = {notify: true, syncWithCloud: true, placeId: this.selectedPlace.id};
        }
        this.currentUser.settings = settings;
        this.getPlaceAreas(false, (err, placeAreas) =>{
          this.placeAreas = placeAreas;
          this.sharedProvider.dismissLoading();
        });
    });

  }

  doRefresh(refresher){
    this.getPlaceAreas(true, (err, placeAreas) =>{
      this.placeAreas = placeAreas;
      refresher.complete();
    });
  }

  sayCommands(){
    this.isListening = true;
    this.speechProvider.sayCommands((err, resp) =>{
        console.log("FINAL RESULT OF STT: >>>> ", resp);
        if(resp && resp.length > 0){
          console.log("FINAL RESULT OF STT at 0 index: >>>> ", resp[0]);
        }
        this.isListening = false;
        var conversationReq = {
								"params": {
											"input": {"text": resp[0]},
											"context": this.conversationContext
										}
								};

        this.hbuddyProvider.callConversation(conversationReq).then( resp => {
          console.log("Conversation Response: >>> ", JSON.stringify(resp));
          let conversationResp = resp.conversation;
          this.conversationContext = conversationResp.context;
          for(let outputTxt of conversationResp.output.text){
              let ttsOptions = {
                "text": outputTxt,
                "locale": "en-IN",
                "rate": 1.5
              };
              this.speechProvider.convertTTS(ttsOptions);
          }

        },
        error => {
            if(error.status == 401){
              this.events.publish("auth:required", error);
            }else{
              console.log("Error in callConversation: >>> ", err);
            }
        });

    });
  }

  stopListening(){
    this.speechProvider.stopListening();
    this.isListening = false;
  }

  getUserSetting(cb){
    this.hbuddyProvider.fetchUserSettings(this.currentUser.id, this.selectedPlace.id).then( settings => {
      console.log("Fetched UserSettings:  ", settings);
      cb(null, settings);
    },
    error => {
        if(error.status == 401){
          this.events.publish("auth:required", error);
          cb(error, null);
        }else{
          cb(error, null);
        }
    });
  }

  getPlaceAreas(refresh, cb){
      this.placeAreas = this.sharedProvider.getSessionData(this.selectedPlace.id+"_AREAS");
       if(!this.placeAreas || refresh){
        this.hbuddyProvider.fetchPlaceAreas(this.selectedPlace).then( areas => {
          console.log("Fetched PlaceAreas:  ", areas);
          this.sharedProvider.setSessionData(this.selectedPlace.id+"_AREAS", areas);
          cb(null, areas);
        },
        error => {
            if(error.status == 401){
              this.events.publish("auth:required", error);
              cb(error, null);
            }else{
              cb(error, null);
            }
        });
      }else{
          cb(null, this.placeAreas);
      }
  }

  showAddNewPlaceArea(){
    this.selectedPlaceArea = {"placeId": this.selectedPlace.id};
    this.showAddUpdatePlaceArea = true;
    this.showPlaceAreas = false;
  }

  showEditPlaceArea(placeArea){
      console.log("IN showEditPlaceArea: >> ", placeArea);
      this.selectedPlaceArea = placeArea;
      this.selectedPlaceArea.placeId = this.selectedPlace.id;
      this.showAddUpdatePlaceArea = true;
      this.showPlaceAreas = false;
      // this.navCtrl.setRoot(DashboardPage, {"selectedPlace": place});
  }

  viewSettings(){
      this.navCtrl.push(SettingsPage, {});
  }

  savePlaceArea(){
    console.log("IN addOrUpdatePlaceArea: >> ", this.selectedPlaceArea);
    this.hbuddyProvider.savePlaceArea(this.selectedPlaceArea).then( placeArea => {
      console.log("Saved PlaceArea:  ", placeArea);
      this.selectedPlaceArea = {};
      let found: boolean = false;
      for(let area of this.placeAreas){
          if(area.id == placeArea.id){
              found = true;
              area = placeArea;
          }
      }
      if(!found){
        this.placeAreas.push(placeArea);
      }
      this.sharedProvider.setSessionData(this.selectedPlace.id+"_AREAS", this.placeAreas);
      this.showAddUpdatePlaceArea = false;
      this.showPlaceAreas = true;
    },
    error => {
        if(error.status == 401){
          this.events.publish("auth:required", error);
        }else{
          console.log("ERROR: >>> ", error);
        }
    });

  }

  viewPlaceArea(placeArea){
    console.log("IN viewPlaceArea: >> ", placeArea);
    this.selectedPlaceArea = placeArea;
    this.navCtrl.push(DevicesPage, {"selectedPlace": this.selectedPlace, "selectedPlaceArea": this.selectedPlaceArea});
  }

  dismiss(){
    this.selectedPlaceArea = {};
    this.showAddUpdatePlaceArea = false;
    this.showPlaceAreas = true;
  }


}
