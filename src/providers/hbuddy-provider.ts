import { Injectable } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';
import { Events } from 'ionic-angular';
import 'rxjs/add/operator/map';

import { AuthProvider } from './auth-provider';
import { SharedProvider } from './shared-provider';

@Injectable()
export class HbuddyProvider {

  private reqOptions: RequestOptions;
  private currentUser: any;
  
  constructor(private http: Http, private authProvider: AuthProvider, private sharedProvider: SharedProvider, private events: Events) {
    console.log("authProvider: >>>", authProvider.headers);
    this.currentUser = this.sharedProvider.getCurrentUser();
  }

  fetchUserGroups(userObj, cb){
        let email: string = userObj.profile && userObj.profile.email;
      	if(!email){
      		email = userObj.email;
      	}
        let ownerId: string = userObj.id;
    		    	if(userObj.userId){
    		    		ownerId = userObj.userId;
    		    	}
        let findReq: any = {
                            filter: {
    			    			  		            where: {"or": [{"members": {"elemMatch": {"username": {"$eq": email}}}},
    			    			  		                {"ownerId": ownerId}]}
    	    				   		             }
                            };
        let GET_URL: string = this.sharedProvider.CONFIG.API_BASE_URL + "/Groups?";
        // this.authProvider.setAuthHeaders();
        this.reqOptions = new RequestOptions({headers: this.authProvider.headers});
        this.reqOptions.params = findReq;
        return this.http.get(GET_URL, this.reqOptions)
        .subscribe(resp => {
            cb(null, resp.json());
        }, (err) => {
          this.handleError("Error while fetching User Groups:>> ", err, cb);
        });

  }

  fetchUserPlaces(userObj, cb){
      if(this.sharedProvider.isDemoAccount()){
          this.sharedProvider.getDemoData("places", (dummyPlaces)=>{
              cb(null, dummyPlaces);
          });
          return false;
      }

    this.fetchUserGroups(userObj, (err, groups) =>{
          console.log("GROUPS RESP: >>> ", groups);
          // this.authProvider.setAuthHeaders();
          this.reqOptions = new RequestOptions({headers: this.authProvider.headers});
          userObj.groups = groups;
          let ownerId: string = userObj.id;
                if(userObj.userId){
                  ownerId = userObj.userId;
                }
          let findReq: any = {filter: {where: {or: [{ownerId: ownerId}]}}};
        	let placeIds: Array<string> = [];
          for (let group of userObj.groups) {
              placeIds.push(group.placeId);
          }
      		if(placeIds.length > 0){
      			findReq.filter.where.or.push({id: {inq: placeIds}});
      		}

          let GET_URL: string = this.sharedProvider.CONFIG.API_BASE_URL + "/Places?";
          this.reqOptions.params = findReq;
          return this.http.get(GET_URL, this.reqOptions)
          .subscribe(resp => {
              cb(null, resp.json());
          }, (err) => {
            this.handleError("Error while fetching User Places:>> ", err, cb);
          });
    });

  }

  fetchPlaceAreas(selectedPlace, cb){
      delete this.reqOptions["params"];
      if(this.sharedProvider.isDemoAccount()){
          this.sharedProvider.getDemoData("placeAreas", (dummyAreas)=>{
              cb(null, dummyAreas);
          });
          return false;
      }

      let findReq: any = {filter: {where: {placeId: selectedPlace.id}}};
      let GET_URL: string = this.sharedProvider.CONFIG.API_BASE_URL + "/PlaceAreas?";
      this.authProvider.setAuthHeaders();
      this.reqOptions = new RequestOptions({headers: this.authProvider.headers});
      this.reqOptions.params = findReq;
      return this.http.get(GET_URL, this.reqOptions)
      .subscribe(resp => {
          cb(null, resp.json());
      }, (err) => {
        this.handleError("Erron in fetching PlaceAreas:>> ", err, cb);
      });
  }

  fetchBoards(placeArea, cb){
    console.log("IN hbuddyProvider.fetchBoards: >> ", placeArea.id);
    if(this.sharedProvider.isDemoAccount()){
      this.sharedProvider.getDemoData("boards", (dummyBoards)=>{
          cb(null, dummyBoards);
      });
      return false;
    }

    let findReq: any = {
    				filter:{
        			  		 where: {"and": [{"connectedToId": placeArea.id},
        			  		                 {"status": "active"}
        			  		 				]}
    								}
    						};
    let GET_URL: string = this.sharedProvider.CONFIG.API_BASE_URL + "/Boards?";
    this.authProvider.setAuthHeaders();
    this.reqOptions = new RequestOptions({headers: this.authProvider.headers});
    this.reqOptions.params = findReq;
    return this.http.get(GET_URL, this.reqOptions)
    .subscribe(resp => {
        console.log("Fetched Boards RESP: >>> ", resp.json());
        cb(null, resp.json());
    }, (err) => {
      this.handleError("Erron in fetching Boards:>> ", err, cb);
    });
  }

  fetchScenes(selectedPlace, cb){
    if(this.sharedProvider.isDemoAccount()){
        this.sharedProvider.getDemoData("scenes", (dummyScenes)=>{
            cb(null, dummyScenes);
        });
        return false;
    }

    let findReq: any = {filter: {where: {placeId: selectedPlace.id}}};
    let GET_URL: string = this.sharedProvider.CONFIG.API_BASE_URL + "/Scenes?";
    this.authProvider.setAuthHeaders();
    this.reqOptions = new RequestOptions({headers: this.authProvider.headers});
    this.reqOptions.params = findReq;
    return this.http.get(GET_URL, this.reqOptions)
    .subscribe(resp => {
        cb(null, resp.json());
    }, (err) => {
      this.handleError("Erron in fetching PlaceAreas:>> ", err, cb);
    });
  }

  private handleError(msg, err, cb){
      console.log("ERROR: ",msg, err);
      if(err.status == 401){
        this.events.publish("auth:required", err);
      }
      cb(err, null);
  }


}
