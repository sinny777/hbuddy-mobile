import { Component, SecurityContext } from '@angular/core';

import {SafeResourceUrl, DomSanitizer} from '@angular/platform-browser';

import { SharedProvider } from '../../providers/shared-provider';
import { HbuddyProvider } from '../../providers/hbuddy-provider';


@Component({
  selector: 'page-cameras',
  templateUrl: 'cameras.html',
})
export class CamerasPage {

  cameraSrc: SafeResourceUrl;
  htmlContent: any;

  constructor(private domSanitizer: DomSanitizer, public sharedProvider: SharedProvider,  public hbuddyProvider: HbuddyProvider) {
     this.cameraSrc = this.domSanitizer.bypassSecurityTrustResourceUrl(this.sharedProvider.CONFIG.CAMERA_PUBLIC_URL);
    //  this.cameraSrc = this.domSanitizer.bypassSecurityTrustResourceUrl("https://www.youtube.com/embed/ePQUMgVnTRs?wmode=opaque&modestbranding=1&autohide=1&controls=1&showinfo=0&color=red&vq=hd720");
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Cameras');
  }

  startDetection(){
    this.hbuddyProvider.startDetection().then(()=>{
        console.log("Motion Detection Started ");       
      },
      error => {
          console.log("ERROR: >> ", error);
      });
  }

  pauseDetection(){
    this.hbuddyProvider.pauseDetection().then(()=>{
        console.log("Motion Detection Paused ");       
      },
      error => {
          console.log("ERROR: >> ", error);
      });
  }

}
