import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';


@Component({
  selector: 'page-gateway',
  templateUrl: 'gateway.html',
})
export class GatewayPage {

  configurations: any = {wifi: {ssid: "", password: ""}};
  bleDeviceConnected: boolean = false;
  bleDevices: any;
  selectedBLEDevice: any;
  selectedPeripheral: any;
  isScanning: boolean = false;
  showUpdateWifi: boolean = false;

  constructor(private ble: BLE, public navCtrl: NavController, public navParams: NavParams) {
    console.log("IN Gateway Component Constructor ");
    this.bleDevices = [];
    this.isScanning = false;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Gateway');
    this.selectedBLEDevice = "";
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

  startScanning(){
    console.log("IN startScanning BLE Devices: >>> ");
      this.bleDevices = [];
      this.isScanning = true;
      this.ble.scan([], 3).subscribe(bleDevice => {
          console.log("SCANNED DEVICE: >>> ", JSON.stringify(bleDevice));
          this.bleDevices.push(bleDevice);
          this.isScanning = false;
      });
  }

  connectBoardOnBLE(bleDevice){
    console.log("IN connectBoardOnBLE: >> ", JSON.stringify(bleDevice));
    this.ble.connect(bleDevice).subscribe(peripheralData => {
          console.log("BLE Device Connected, ", JSON.stringify(peripheralData));
        },
        peripheralData => {
         console.log('BLE Device Disconnected >>>>', JSON.stringify(peripheralData));
        });
  }

  showUpdateWifiCard(bleDevice){
    if(bleDevice && bleDevice.id){
      this.selectedPeripheral = bleDevice;
      this.showUpdateWifi = true;
    }else{
      this.showUpdateWifi = false;
    }
  }

  updateGatewayWifi(){
    console.log("IN updateGatewayWifi, WiFi credentials: >> ", this.configurations.wifi);
    console.log("Send WiFi Credentials to: ", this.selectedPeripheral);
    const serviceUUID = this.selectedPeripheral.characteristics[0].service;
    const characteristicUUID = this.selectedPeripheral.characteristics[0].characteristic;
    const data = "{\"ssidPrim\":\"+configurations.wifi.ssid+\",\"pwPrim\":\"+configurations.wifi.password+\",\"ssidSec\":\"hukam\",\"pwSec\":\"1SatnamW\"}";

    this.ble.write(this.selectedBLEDevice.id, serviceUUID, characteristicUUID, this.stringToBytes(data)).then(()=>{
          console.log("Data sent over BLE");
          this.showUpdateWifi = false;
    }).catch(()=>{
        console.log("Error while sending data over BLE");
        this.showUpdateWifi = false;
    });

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
