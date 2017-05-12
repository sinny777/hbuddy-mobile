import { Injectable } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';

import { AuthProvider } from './auth-provider';
import { SharedProvider } from './shared-provider';

@Injectable()
export class HbuddyProvider {

  private reqOptions: RequestOptions;
  private currentUser: any;

  constructor(private http: Http, private authProvider: AuthProvider, private sharedProvider: SharedProvider) {
    console.log("authProvider: >>>", authProvider.reqOptions);
    this.reqOptions = authProvider.reqOptions;
    this.currentUser = this.authProvider.getCurrentUser();
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
        this.reqOptions.params = findReq;
        return this.http.get(GET_URL, this.reqOptions)
        .subscribe(resp => {
            cb(null, resp.json());
        }, (err) => {
          console.log("Error while fetching User Groups:>> ", err);
          cb(err, null);
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
            console.log("Error while fetching User Places:>> ", err);
            cb(err, null);
          });
    });

  }

  fetchPlaceAreas(selectedPlace, cb){
      if(this.sharedProvider.isDemoAccount()){
          this.sharedProvider.getDemoData("placeAreas", (dummyAreas)=>{
              cb(null, dummyAreas);
          });
          return false;
      }

      let findReq: any = {filter: {where: {placeId: selectedPlace.id}}};
      let GET_URL: string = this.sharedProvider.CONFIG.API_BASE_URL + "/PlaceAreas?";
      this.reqOptions.params = findReq;
      return this.http.get(GET_URL, this.reqOptions)
      .subscribe(resp => {
          cb(null, resp.json());
      }, (err) => {
        console.log("Erron in fetching PlaceAreas:>> ", err);
        cb(err, null);
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
    this.reqOptions.params = findReq;
    return this.http.get(GET_URL, this.reqOptions)
    .subscribe(resp => {
        console.log("Fetched Boards RESP: >>> ", resp.json());
        cb(null, resp.json());
    }, (err) => {
      console.log("Erron in fetching Boards:>> ", err);
      cb(err, null);
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
    this.reqOptions.params = findReq;
    return this.http.get(GET_URL, this.reqOptions)
    .subscribe(resp => {
        cb(null, resp.json());
    }, (err) => {
      console.log("Erron in fetching PlaceAreas:>> ", err);
      cb(err, null);
    });
  }


}
