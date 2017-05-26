import { Component } from '@angular/core';
import { NavController, Events } from 'ionic-angular';
import { SharedProvider } from '../../providers/shared-provider';
import { HbuddyProvider } from '../../providers/hbuddy-provider';

@Component({
  selector: 'page-groups',
  templateUrl: 'groups.html',
})
export class GroupsPage {

  private selectedPlace: any;
  private groups;

  constructor(public navCtrl: NavController, public events: Events, private sharedProvider: SharedProvider, private hbuddyProvider: HbuddyProvider) {
      this.selectedPlace = this.sharedProvider.getSessionData("selectedPlace");
  }

  ionViewDidLoad() {
    this.sharedProvider.presentLoading("Fetching place groups...");
    this.getPlaceGroups(false, (err, groups) =>{
      this.groups = groups;
      this.sharedProvider.dismissLoading();
    });
  }

  doRefresh(refresher){
    this.getPlaceGroups(true, (err, groups) =>{
      this.groups = groups;
      refresher.complete();
    });
  }

  getPlaceGroups(refresh, cb){
      this.groups = this.sharedProvider.getSessionData(this.selectedPlace.id+"_GROUPS");
      if(!this.groups || refresh){
        this.hbuddyProvider.fetchPlaceGroups(this.selectedPlace.id).then( groups => {
          console.log("Fetched Place Groups:  ", groups);
          this.sharedProvider.setSessionData(this.selectedPlace.id+"_GROUPS", groups);
          cb(null, groups);
        },
        error => {
            if(error.status == 401){
              this.events.publish("auth:required", error);
            }else{
              cb(error, null);
            }
        });
      }else{
          cb(null, this.groups);
      }
  }

  showAddMember(group){
    console.log("IN Add Member: >> ");
  }

}
