import { Component } from '@angular/core';
import { NavController, NavParams, Events } from 'ionic-angular';

import { SharedProvider } from '../../providers/shared-provider';
import { HbuddyProvider } from '../../providers/hbuddy-provider';
import { MqttProvider } from '../../providers/mqtt-provider'

import { DevicesPage } from '../devices/devices';
import { SettingsPage } from '../settings/settings';

@Component({
  selector: 'page-place-areas',
  templateUrl: 'place-areas.html',
})
export class PlaceAreasPage {

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
              public mqttProvider: MqttProvider, private events: Events) {
              this.selectedPlace = navParams.get('selectedPlace');
              if(!this.selectedPlace){
                this.selectedPlace = this.sharedProvider.getSessionData("selectedPlace");
              }
              for(let i = 1; i <= 150; i++){
      				      this.floors.push(''+i);
      			  }
  }

  ionViewDidLoad() {
    if(!this.sharedProvider.isDemoAccount()){
      let placeTopic: string = "iot-2/type/" +this.sharedProvider.CONFIG.GATEWAY_TYPE +"/id/"+this.selectedPlace.gatewayId+"/cmd/gateway/fmt/json";
      this.connectionOptions.subscribeToTopic = placeTopic;
      this.mqttProvider.connectMQTT(this.connectionOptions);
    }
    this.sharedProvider.presentLoading("Fetching place areas...");
    console.log("selectedPlace: >>>> ", JSON.stringify(this.selectedPlace));
    this.getPlaceAreas(false, (err, placeAreas) =>{
      this.placeAreas = placeAreas;
      this.sharedProvider.dismissLoading();
    });
  }

  doRefresh(refresher){
    this.getPlaceAreas(true, (err, placeAreas) =>{
      this.placeAreas = placeAreas;
      refresher.complete();
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
