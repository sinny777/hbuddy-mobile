import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';


@Component({
  selector: 'page-gateway',
  templateUrl: 'gateway.html',
})
export class GatewayPage {

  configurations: any = {wifi: {ssid: "", password: ""}};
  gatewayConnected: boolean = false;
  bleDevices: any;
  selectedPeripheral: any;
  isScanning: boolean = false;

  constructor(private ble: BLE, public navCtrl: NavController, public navParams: NavParams) {
    console.log("IN Gateway Component Constructor ");
    this.bleDevices = [];
    this.isScanning = false;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Gateway');
    this.selectedPeripheral = "";
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
      this.ble.scan([], 3).subscribe(peripheral => {
          console.log("SCANNED DEVICE: >>> ", JSON.stringify(peripheral));
          this.bleDevices.push(peripheral);
          this.isScanning = false;
      });
  }

  bleDeviceSelected(){
    console.log("IN bleDeviceSelected: >> ", this.selectedPeripheral);
    this.ble.connect(this.selectedPeripheral).subscribe(peripheralData => {
          console.log("BLE Device Connected, ", JSON.stringify(peripheralData));
          this.gatewayConnected = true;
        },
        peripheralData => {
         console.log('BLE Device Disconnected >>>>', JSON.stringify(peripheralData));
         this.gatewayConnected = false;
        });
  }

  updateGatewayWifi(){
    console.log("IN updateGatewayWifi, WiFi credentials: >> ", this.configurations.wifi);
  }

}
