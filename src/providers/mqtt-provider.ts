import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import 'rxjs/add/operator/map';
import { SharedProvider } from './shared-provider';

import {Paho} from 'ng2-mqtt/mqttws31';

@Injectable()
export class MqttProvider {

  private client: Paho.MQTT.Client;
  private isConnected: boolean = false;
  private connectOptions: any;

  constructor(public sharedProvider: SharedProvider, public events: Events) {
    console.log('IN MqttProvider Constructor >>>>>>>> ');
    this.createMqttClient();
  }

  private createMqttClient(){
    let clientId: string = this.sharedProvider.CONFIG.MQTT_OPTIONS.clientId+(new Date().getTime());
    this.client = new Paho.MQTT.Client(this.sharedProvider.CONFIG.MQTT_OPTIONS.hostname, this.sharedProvider.CONFIG.MQTT_OPTIONS.port, clientId);
    this.client.onConnectionLost = (responseObject: Object) => {
      console.log('MQTT Connection lost >>> ');
      this.isConnected = false;
      // this.connectMQTT(this.connectOptions);
    };
    this.client.onMessageArrived = (message: Paho.MQTT.Message) => {
      // console.log('MQTT Message arrived: >>> ', message.payloadString);
      this.events.publish('mqtt:messageReceived', message);
    };
  }

  public connectMQTT(connectOptions){
      try{
          this.connectOptions = connectOptions;
          this.client.connect({
                                keepAliveInterval: this.sharedProvider.CONFIG.MQTT_OPTIONS.keepAliveInterval,
                                useSSL: this.sharedProvider.CONFIG.MQTT_OPTIONS.useSSL,
                                userName: this.sharedProvider.CONFIG.MQTT_OPTIONS.api_key,
                                password: this.sharedProvider.CONFIG.MQTT_OPTIONS.auth_token,
                                onSuccess: this.onConnected.bind(this),
                                onFailure: this.onFailure.bind(this)
                              });
        }catch(err){
            console.log("Error while connectin to MQTT:  ", err);
            if(this.connectOptions.subscribeToTopic){
                this.client.subscribe(this.connectOptions.subscribeToTopic, {});
            }
        }
  }

  private onConnected() {
    console.log("MQTT Connected: >>>> ");
    this.isConnected = true;
    if(this.connectOptions.subscribeToTopic){
      this.client.subscribe(this.connectOptions.subscribeToTopic, {});
    }
  }

  private onFailure(e) {
    console.log("MQTT Connection Failed: >>> ", e);
    this.isConnected = false;
  }

  public subscribeTopic(topic, options){
    console.log("IN subscribeTopic: >> ", topic);
    if(this.client && this.isConnected){
        this.client.subscribe(topic, options);
    }else{
      return new Error("MQTT Client not available !! ");
    }
  }

  public publishTopic(topic, message){
    console.log("IN publichTopic: >> Topic: ", topic, ", Message: ", message);
    if(this.client && this.isConnected){
      let packet = new Paho.MQTT.Message(JSON.stringify(message));
      packet.destinationName = topic;
      this.client.send(packet);
    }else{
      return new Error("MQTT Client not available !! ");
    }
  }

}
