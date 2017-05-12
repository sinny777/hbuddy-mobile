import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { SharedProvider } from '../../providers/shared-provider';
import { HbuddyProvider } from '../../providers/hbuddy-provider';
import { MqttProvider } from '../../providers/mqtt-provider'

import { DevicesPage } from '../devices/devices';

@IonicPage()
@Component({
  selector: 'page-place-areas',
  templateUrl: 'place-areas.html',
})
export class PlaceAreasPage {

  private selectedPlace: any;
  private connectionOptions: any = {};

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public sharedProvider: SharedProvider, public hbuddyProvider: HbuddyProvider,
              public mqttProvider: MqttProvider) {
              this.selectedPlace = navParams.get('selectedPlace');
              if(!this.selectedPlace){
                this.selectedPlace = this.sharedProvider.getData().selectedPlace;
              }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PlaceAreasPage: >> ', this.selectedPlace);
    if(!this.sharedProvider.isDemoAccount()){
      let placeTopic: string = "iot-2/type/" +this.sharedProvider.CONFIG.GATEWAY_TYPE +"/id/"+this.selectedPlace.gatewayId+"/evt/gateway/fmt/json";
      this.connectionOptions.subscribeToTopic = placeTopic;
      this.mqttProvider.connectMQTT(this.connectionOptions);
    }    
    this.getPlaceAreas(false, (err, placeAreas) =>{
      this.selectedPlace.areas = placeAreas;
    });
  }

  doRefresh(refresher){
    console.log("IN doRefresh for PlaceAreas: >> ");
    this.getPlaceAreas(true, (err, placeAreas) =>{
      this.selectedPlace.areas = placeAreas;
      refresher.complete();
    });
  }

  getPlaceAreas(refresh, cb){
      if(!this.selectedPlace.areas || refresh){
        this.hbuddyProvider.fetchPlaceAreas(this.selectedPlace, (err, placeAreas) => {
            console.log("Fetched PlaceAreas:  ", placeAreas);
            cb(err, placeAreas);
        });
      }else{
          cb(null, this.selectedPlace.areas);
      }
  }

  showAddNewPlaceArea(){
    console.log("IN showAddNewPlaceArea: >>> ");
  }

  editPlaceArea(placeArea){
    console.log("IN editPlaceArea: >> ", placeArea);
  }

  viewPlaceArea(placeArea){
    console.log("IN viewPlaceArea: >> ", placeArea);
    this.navCtrl.push(DevicesPage, {"selectedPlace": this.selectedPlace, "selectedPlaceArea":placeArea});
  }


}
