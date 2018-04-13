import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';
import {SafeResourceUrl, DomSanitizer} from '@angular/platform-browser';

import { SharedProvider } from '../../providers/shared-provider';
import { HbuddyProvider } from '../../providers/hbuddy-provider';
import { SpeechProvider } from '../../providers/speech-provider';
import { MqttProvider } from '../../providers/mqtt-provider';
import { YoutubeVideoPlayer } from '@ionic-native/youtube-video-player';


@Component({
  selector: 'page-cameras',
  templateUrl: 'cameras.html',
})
export class CamerasPage {

  private selectedPlace: any;
  private isListening: boolean = false;
  cameraSrc: SafeResourceUrl;
  htmlContent: any;

  constructor(private domSanitizer: DomSanitizer, public navParams: NavParams, public sharedProvider: SharedProvider,
    public hbuddyProvider: HbuddyProvider, private speechProvider: SpeechProvider, public mqttProvider: MqttProvider, private youtube: YoutubeVideoPlayer) {
     this.cameraSrc = this.domSanitizer.bypassSecurityTrustResourceUrl(this.sharedProvider.CONFIG.CAMERA_PUBLIC_URL);
     // this.cameraSrc = this.domSanitizer.bypassSecurityTrustResourceUrl("https://www.youtube.com/embed/"+this.sharedProvider.CONFIG.LIVE_CAM1_STREAM_ID+"?wmode=opaque&modestbranding=1&autohide=1&controls=1&showinfo=0&color=red&vq=hd720");
     // this.cameraSrc = this.domSanitizer.bypassSecurityTrustResourceUrl("https://www.youtube.com/embed/live_stream?channel="+this.sharedProvider.CONFIG.LIVE_CAM1_STREAM_ID);
     // https://www.youtube.com/watch?v=Kx4gZRAB10o&wmode=opaque&modestbranding=1&autohide=1&controls=1&showinfo=0&color=red&vq=hd720
    console.log("this.cameraSrc: >>> ", this.cameraSrc);
    this.selectedPlace = navParams.get('selectedPlace');
    if(!this.selectedPlace){
      this.selectedPlace = this.sharedProvider.getSessionData("selectedPlace");
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Cameras');
    // this.startDetection();
  }

  startDetection(){
    this.hbuddyProvider.startDetection().then(()=>{
        console.log("Motion Detection Started ");
      },
      error => {
          console.log("ERROR: >> ", error);
      });
     // this.youtube.openVideo(this.sharedProvider.CONFIG.LIVE_CAM1_STREAM_ID);
  }

  pauseDetection(){
    this.hbuddyProvider.pauseDetection().then(()=>{
        console.log("Motion Detection Paused ");
      },
      error => {
          console.log("ERROR: >> ", error);
      });
  }

  sayCommands(){
    this.isListening = true;
    this.speechProvider.sayCommands((err, resp) =>{
        console.log("FINAL RESULT OF STT: >>>> ", resp);
        this.isListening = false;
        let topic: string = "iot-2/type/" +this.sharedProvider.CONFIG.GATEWAY_TYPE +"/id/"+this.selectedPlace.gatewayId+"/cmd/gateway/fmt/json";

        let msg = {
                        gatewayId: this.selectedPlace.gatewayId,
                        action: "TTS",
                        text: resp[0]
                  };

        this.mqttProvider.publishTopic(topic, msg);
    });
  }

  stopListening(){
    this.speechProvider.stopListening();
    this.isListening = false;
  }

}
