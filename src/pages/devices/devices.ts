import { Component } from '@angular/core';
import { IonicPage, NavParams } from 'ionic-angular';

import { SharedProvider } from '../../providers/shared-provider';
import { HbuddyProvider } from '../../providers/hbuddy-provider';
import { MqttProvider } from '../../providers/mqtt-provider';
import {Paho} from 'ng2-mqtt/mqttws31';
import { Events } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-devices',
  templateUrl: 'devices.html',
})
export class DevicesPage {

  private selectedPlaceArea: any;
  private selectedPlace: any;

  constructor(public navParams: NavParams, public hbuddyProvider: HbuddyProvider, public sharedProvider: SharedProvider, public mqttProvider: MqttProvider, public events: Events) {
    this.selectedPlaceArea = this.navParams.get("selectedPlaceArea");
    this.selectedPlace = this.navParams.get("selectedPlace");
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Devices: >> ');
    this.events.subscribe('mqtt:messageReceived', (message: Paho.MQTT.Message) => {
        console.log('MQTT Message Payload: >> ', message.payloadString);
        let msg: any = JSON.parse(message.payloadString);
        this.refreshBoard(msg);
    });
    this.fetchBoardsAndDevices(this.selectedPlaceArea, false, (err, boards) => {
        this.selectedPlaceArea.boards = boards;
    });
  }

  refreshBoard(mqttMsg){
      for(let board of this.selectedPlaceArea.boards){
          for(let device of board.devices){
            if(device.parentId == mqttMsg.d.boardId && device.deviceIndex == mqttMsg.d.deviceIndex){
              // console.log("Change in Device: ", device);
                  device.value = mqttMsg.d.deviceValue;
                   if(device.value == 0){
                     device.status = "OFF";
                   }else{
                     device.status = "ON";
                   }

                   if(mqttMsg.d.analogValue){
                    device.analogValue = mqttMsg.d.analogValue;
                   }

                   device.updatedAt = new Date();
                   console.log("DEVICE UPDATED>> ", device);
             }
          }
      }
  }

  doRefresh(refresher){
    console.log("IN doRefresh for BoardsAndDevices: >> ");
    this.fetchBoardsAndDevices(this.selectedPlaceArea, true, (err, boards) => {
        this.selectedPlaceArea.boards = boards;
        refresher.complete();
    });
  }

  fetchBoardsAndDevices(placeArea, refresh, cb){
    console.log("In fetchBoardsAndDevices: >>> ", placeArea);
    if(!placeArea.boards || refresh){
      this.hbuddyProvider.fetchBoards(placeArea, (err, boards) => {
          console.log("Fetched PlaceArea Boards:  ", boards);
          cb(err, boards);
      });
    }else{
        cb(null, placeArea.boards);
    }
  }

  deviceChanged(board, device){
    // console.log("IN deviceChanged: >> ", device);
    if(device.status == 'ON'){
    		device.status = 'OFF';
    		device.value = 0;
    }else{
    		device.status = 'ON';
    		device.value = 1;
    }

    let topic: string = "iot-2/type/" +this.sharedProvider.CONFIG.GATEWAY_TYPE +"/id/"+this.selectedPlace.gatewayId+"/evt/gateway/fmt/json";
    let msg = {
                d:{
                    gatewayId: this.selectedPlace.gatewayId,
                    boardId: board.uniqueIdentifier,
                    deviceIndex: device.deviceIndex,
                    deviceValue: device.value
                 }
              };

    this.mqttProvider.publishTopic(topic, msg);
  }

  editDevice(device){
    console.log("IN editDevice:>>> ", device);
  }

}
