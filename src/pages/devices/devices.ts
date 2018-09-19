import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';

import { SharedProvider } from '../../providers/shared-provider';
import { HbuddyProvider } from '../../providers/hbuddy-provider';
import { MqttProvider } from '../../providers/mqtt-provider';
import {Paho} from 'ng2-mqtt/mqttws31';
import { Events } from 'ionic-angular';

@Component({
  selector: 'page-devices',
  templateUrl: 'devices.html',
})
export class DevicesPage {

  private selectedPlaceArea: any;
  private selectedPlace: any;
  private showEditDevice = false;
  private showDevices = true;
  private selectedDevice: any;
  deviceTypes: any;

  constructor(public navParams: NavParams, public hbuddyProvider: HbuddyProvider, public sharedProvider: SharedProvider, public mqttProvider: MqttProvider, public events: Events) {
    this.selectedPlaceArea = this.navParams.get("selectedPlaceArea");
    this.selectedPlace = this.navParams.get("selectedPlace");
    this.sharedProvider.getDemoData("deviceTypes").then(types => {
      this.deviceTypes = types;
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Devices: >> ');
    this.events.subscribe('mqtt:messageReceived', (message: Paho.MQTT.Message) => {
        console.log('MQTT Message Payload: >> ', message.payloadString);
        let msg: any = JSON.parse(message.payloadString);
        this.refreshBoard(msg);
    });
    this.sharedProvider.presentLoading("Fetching boards...");
    this.fetchBoards(this.selectedPlaceArea, false, (err, boards) => {
        // this.selectedPlaceArea.boards = boards;
        this.sharedProvider.dismissLoading();
        if(boards && boards.length > 0){
            this.sharedProvider.presentLoading("Fetching devices...");
              for(let board of boards){
                this.fetchDevices(board, false, (err, devices) => {
                    this.sharedProvider.dismissLoading();
                });
              }
        }
    });
  }

  refreshBoard(mqttMsg){
      for(let board of this.selectedPlaceArea.boards){
          for(let device of board.devices){
            if(device.parentId == mqttMsg.d.boardId && device.deviceIndex == mqttMsg.d.deviceIndex){
              // console.log("Change in Device: ", device);
                  device.deviceValue = mqttMsg.d.deviceValue;
                  device.status = mqttMsg.d.status;
                  device.updatedAt = new Date();
                   console.log("DEVICE UPDATED>> ", device);
             }
          }
      }
  }

  doRefresh(refresher){
    console.log("IN doRefresh for BoardsAndDevices: >> ");
    this.fetchBoards(this.selectedPlaceArea, true, (err, boards) => {
        // this.selectedPlaceArea.boards = boards;
        for(let board of boards){
          this.fetchDevices(board, true, (err, devices) => {
              refresher.complete();
          });
        }
    });
  }

  fetchBoards(placeArea, refresh, cb){
    console.log("In fetchBoardsAndDevices: >>> ", placeArea);
    if(!placeArea.boards || refresh){
      this.hbuddyProvider.fetchBoards(placeArea).then( boards => {
        console.log("Fetched Boards:  ", boards);
        placeArea.boards = boards;
        cb(null, placeArea.boards);
      },
      error => {
          if(error.status == 401){
            this.events.publish("auth:required", error);
          }else{
            cb(error, null);
          }
      });
    }else{
        cb(null, placeArea.boards);
    }
  }

  fetchDevices(board, refresh, cb){
    console.log("In fetchDevices: >>> ", board);
    if(!board.devices || refresh){
      this.hbuddyProvider.fetchDevices(board).then( devices => {
        console.log("Fetched Devices:  ", devices);
        board.devices = devices;
        cb(null, board.devices);
      },
      error => {
          if(error.status == 401){
            this.events.publish("auth:required", error);
          }else{
            cb(error, null);
          }
      });
    }else{
        cb(null, board.devices);
    }
  }

  deviceChanged(board, device){
    if(device.status == 1){
    		device.status = 0;
    		device.deviceValue = 0;
    }else{
    		device.status = 1;
    		device.deviceValue = 1;
    }
    console.log("IN deviceChanged: >> ", device);
    let topic: string = "iot-2/type/" +this.sharedProvider.CONFIG.GATEWAY_TYPE +"/id/"+this.selectedPlace.gatewayId+"/cmd/gateway/fmt/json";
    let msg = {
                d:{
                    gatewayId: this.selectedPlace.gatewayId,
                    boardId: board.uniqueIdentifier,
                    deviceIndex: device.deviceIndex,
                    deviceValue: device.deviceValue,
                    status: device.status
                 }
              };

    this.mqttProvider.publishTopic(topic, msg);
  }

  showEditDevicePanel(device){
    console.log("IN showEditDevicePanel:>>> ", device);
    this.selectedDevice = device;
    this.showEditDevice = true;
    this.showDevices = false;
  }

  saveDevice(device){
        this.hbuddyProvider.saveDevice(device).then( savedDevice => {
          console.log("Saved Device:  ", savedDevice);
          this.selectedDevice = {};
          this.showEditDevice = false;
          this.showDevices = true;
        },
        error => {
            if(error.status == 401){
              this.events.publish("auth:required", error);
            }else{
              console.log("ERROR: >>> ", error);
            }
        });
  }

  dismiss(){
    this.selectedDevice = {};
    this.showEditDevice = false;
    this.showDevices = true;
  }

}
