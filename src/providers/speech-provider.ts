import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { TextToSpeech } from '@ionic-native/text-to-speech';
import 'rxjs/add/operator/map';

/*
  Generated class for the SpeechProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class SpeechProvider {

  constructor(public platform: Platform, private speechRecognition: SpeechRecognition, private tts: TextToSpeech) {
    console.log('Hello SpeechProvider Provider');
  }

  sayCommands(cb){
    this.speechRecognition.hasPermission()
    .then((hasPermission: boolean) => {
      console.log("STT hasPermission: >> ", hasPermission);
      if(hasPermission){
          this.startListening(cb);
      }else{
        this.speechRecognition.requestPermission()
        .then(
          () => {
            console.log('STT Granted');
            this.startListening(cb);
          },
          () => {
            console.log('STT Denied');
            cb(new Error('STT Denied'), null);
          });
      }
    });
  }

  startListening(cb){
    this.speechRecognition.isRecognitionAvailable()
    .then((available: boolean) => {
        if(available){
          console.log("<<< In startListening >>> ");
          let options = {};
          this.speechRecognition.startListening(options)
          .subscribe(
            (matches: Array<string>) => {
              console.log(matches);
              cb(null, matches);
            },
            (onerror) => {
              console.log('Error in STT:', onerror);
              cb(onerror, null);
            });
        }
    });
  }

  stopListening(){
    if(this.platform.is('ios')){
        console.log("<< IN ios device stopListening >> ");
        this.speechRecognition.stopListening();
    }
  }

  convertTTS(ttsOptions){
      this.tts.speak(ttsOptions)
      .then(() => console.log('Success'))
      .catch((reason: any) => console.log(reason));
  }

}
