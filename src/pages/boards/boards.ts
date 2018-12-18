import { Component, NgZone } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';


@Component({
  selector: 'page-boards',
  templateUrl: 'boards.html',
})
export class BoardsPage {

  showBoards: boolean = false;
  configurations: any = {wifi: {ssid: "", password: ""}};
  bleBoardConnected: boolean = false;
  bleBoards: any;
  selectedPeripheral: any;
  isScanning: boolean = false;
  showUpdateWifi: boolean = false;
  SERVICE_UUID: string =  "430cbe63-a0bf-4090-819a-0355f4ca2c68";

  constructor(private zone: NgZone, private ble: BLE, public navCtrl: NavController, public navParams: NavParams) {
    console.log("IN Boards Component Constructor ");
    this.bleBoards = [];
    this.isScanning = false;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Gateway');
    this.ble.isEnabled().then(()=>{
          console.log("Bluetooth is enabled");
          this.startScanning();
    }).catch(()=>{
        console.log("Bluetooth is *not* enabled");
        this.ble.enable().then(()=>{
            this.startScanning();
        });
    });
  }

  doRefresh(refresher){
    this.bleBoards = [];
    this.startScanning();
  }

  startScanning(){
    console.log("IN startScanning BLE Devices: >>> ");
      this.isScanning = true;
      this.showBoards = false;

      this.ble.connectedPeripheralsWithServices([this.SERVICE_UUID]).then(resp => {
          console.log("CONNECTED BOARDS: >>> ", JSON.stringify(resp));
          this.zone.run(() => {
                // bleBoard.connected = false;
              if(resp && resp.length > 0){
                for (var i = 0, l = resp.length; i < l; i++) {
                    resp[i].connected = true;
                    this.bleBoards.push(resp[i]);
                 }
                this.showBoards = true;
              }
          });
        },
        err => {
         console.log('ERROR in finding connected Boards >>>>', JSON.stringify(err));
      });

      this.ble.scan([], 5).subscribe(bleBoard => {
          console.log("SCANNED BOARDS: >>> ", JSON.stringify(bleBoard));
          this.zone.run(() => {
                bleBoard.connected = false;
                this.bleBoards.push(bleBoard);
                this.showBoards = true;
          });
      },
      err => {
       console.log('ERROR in BLE SCAN >>>>', JSON.stringify(err));
      },
      () => {
        console.log("<<< BLE SCAN COMPLETED >>>> ", this.bleBoards);
        this.zone.run(() => {
            this.isScanning = false;
         });
      });

  }

  toggleBLEForBoard(bleBoard){
    console.log("IN toggleBLEForBoard: >> ", JSON.stringify(bleBoard));
    if(bleBoard.connected){
      this.ble.disconnect(bleBoard.id).then(resp => {
            console.log("BLE Board Disconnected, ", JSON.stringify(resp));
            this.zone.run(() => { // <== added
                bleBoard.connected = false;
             });
          },
          err => {
           console.log('ERROR in BLE Board Disconnect >>>>', JSON.stringify(err));
          });
    }else{
      this.ble.connect(bleBoard.id).subscribe(peripheralData => {
            console.log("BLE Board Connected, ", JSON.stringify(peripheralData));
            this.zone.run(() => { // <== added
                bleBoard.characteristics = peripheralData.characteristics;
                bleBoard.services = peripheralData.services;
                bleBoard.connected = true;
             });
          },
          err => {
           console.log('ERROR in BLE Board Connect >>>>', JSON.stringify(err));
          });
    }

  }

  showUpdateWifiCard(bleBoard){
    console.log("IN showUpdateWifiCard: >> ", bleBoard);
    if(bleBoard && bleBoard.id){
      this.selectedPeripheral = bleBoard;
      this.showUpdateWifi = true;
      this.showBoards = false;
    }else{
      this.selectedPeripheral = null;
      this.showUpdateWifi = false;
      this.showBoards = true;
    }
  }

  updateGatewayWifi(){
    console.log("IN updateGatewayWifi, WiFi credentials: >> ", this.configurations.wifi);
    console.log("Send WiFi Credentials to: ", JSON.stringify(this.selectedPeripheral));
    const serviceUUID = this.selectedPeripheral.characteristics[0].service;
    const characteristicUUID = this.selectedPeripheral.characteristics[0].characteristic;
    // const data = "{\"ssidPrim\":\"+this.configurations.wifi.ssid+\",\"pwPrim\":\"+configurations.wifi.password+\",\"ssidSec\":\"hukam\",\"pwSec\":\"1SatnamW\"}";
    const jsonData = {
      "ssidPrim": this.configurations.wifi.ssid,
      "pwPrim": this.configurations.wifi.password,
      "ssidSec": "hukam",
      "pwSec": "1SatnamW"
    }
    console.log("Data to send over BLE: >>>>> ", JSON.stringify(jsonData));
    /*
    this.ble.write(this.selectedBLEBoard.id, serviceUUID, characteristicUUID, this.stringToBytes(JSON.stringify(jsonData))).then(()=>{
          console.log("Data sent over BLE");
          this.showUpdateWifi = false;
          this.showBoards = true;
    }).catch(()=>{
        console.log("Error while sending data over BLE");
        this.showUpdateWifi = false;
        this.showBoards = true;
    });
    */

    this.ble.write(this.selectedPeripheral.id, serviceUUID, characteristicUUID, this.stringToBytes(JSON.stringify(jsonData))).then(resp => {
          console.log("Data sent over BLE: >>> ", resp);
          this.zone.run(() => { // <== added
              this.showUpdateWifi = false;
              this.showBoards = true;
           });
        },
        err => {
           console.log('ERROR while sending data over BLE >>>>', JSON.stringify(err));
           this.showUpdateWifi = false;
           this.showBoards = true;
        });

  }

  cancelUpdateWifi(){
    this.selectedPeripheral = null;
    this.showUpdateWifi = false;
    this.showBoards = true;
  }

    // ASCII only
  stringToBytes(string) {
     var array = new Uint8Array(string.length);
     for (var i = 0, l = string.length; i < l; i++) {
         array[i] = string.charCodeAt(i);
      }
      return array.buffer;
  }

  // ASCII only
  bytesToString(buffer) {
      return String.fromCharCode.apply(null, new Uint8Array(buffer));
  }

}
