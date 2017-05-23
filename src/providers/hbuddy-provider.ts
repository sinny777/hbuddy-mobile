import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions } from '@angular/http';
import { Events } from 'ionic-angular';
// import { Observable } from 'rxjs';
// import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

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

  fetchUserGroups(userObj): Promise<any>{
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
        this.reqOptions = new RequestOptions({headers: this.authProvider.headers});
        this.reqOptions.params = findReq;
        return this.http.get(GET_URL, this.reqOptions)
        .toPromise()
		    .then(this.extractData)
	      .catch(this.handleErrorPromise);
  }

  fetchUserPlaces(userObj): Promise<any>{
      if(this.sharedProvider.isDemoAccount()){
          this.sharedProvider.getDemoData("places", (dummyPlaces)=>{
            return new Promise((resolve, reject) => {
                resolve(dummyPlaces);
            });
          });
      }
    return this.fetchUserGroups(userObj).then( groups => {
        console.log("Fetched User Groups:  ", groups);
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
        let GET_PLACES_URL: string = this.sharedProvider.CONFIG.API_BASE_URL + "/Places?";
        this.authProvider.setAuthHeaders();
        this.reqOptions = new RequestOptions({headers: this.authProvider.headers});
        this.reqOptions.params = findReq;
          return this.http.get(GET_PLACES_URL, this.reqOptions)
          .toPromise()
  		    .then(this.extractData)
  	            .catch(this.handleErrorPromise);
    },
    error => {
        console.log("ERROR IN Fetching Groups: >> ", error);
        return this.handleErrorPromise(error);
    });
  }

  fetchPlaceAreas(selectedPlace): Promise<any>{
      delete this.reqOptions["params"];
      if(this.sharedProvider.isDemoAccount()){
          this.sharedProvider.getDemoData("placeAreas", (dummyAreas)=>{
            return new Promise((resolve, reject) => {
                resolve(dummyAreas);
            });
          });
      }

      let findReq: any = {filter: {where: {placeId: selectedPlace.id}}};
      let GET_URL: string = this.sharedProvider.CONFIG.API_BASE_URL + "/PlaceAreas?";
      this.authProvider.setAuthHeaders();
      this.reqOptions = new RequestOptions({headers: this.authProvider.headers});
      this.reqOptions.params = findReq;
      return this.http.get(GET_URL, this.reqOptions)
      .toPromise()
      .then(this.extractData)
      .catch(this.handleErrorPromise);
  }

  fetchBoards(placeArea): Promise<any>{
    console.log("IN hbuddyProvider.fetchBoards: >> ", placeArea.id);
    if(this.sharedProvider.isDemoAccount()){
      this.sharedProvider.getDemoData("boards", (dummyBoards)=>{
        return new Promise((resolve, reject) => {
            resolve(dummyBoards);
        });
      });
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
    .toPromise()
    .then(this.extractData)
          .catch(this.handleErrorPromise);
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

  savePlace(place, cb){
    /*
    let POST_URL: string = this.sharedProvider.CONFIG.API_BASE_URL + "/Places";
    this.authProvider.setAuthHeaders();
    this.reqOptions = new RequestOptions({headers: this.authProvider.headers});
    return this.http.post(POST_URL, place this.reqOptions)
    .subscribe(resp => {
        cb(null, resp.json());
    }, (err) => {
      this.handleError("Erron in fetching PlaceAreas:>> ", err, cb);
    });
    */
  }

  private handleError(msg, err, cb){
      console.log("ERROR: ",msg, err);
      if(err.status == 401){
        this.events.publish("auth:required", err);
      }
      cb(err, null);
  }

  private extractData(res: Response) {
        let body = res.json();
        return body;
  }

/*
  private handleErrorObservable (error: Response | any) {
    	console.error(error.message || error);
      if(err.status == 401){
        this.events.publish("auth:required", err);
      }else{
        return Observable.throw(error.message || error);
      }
  }
*/

  private handleErrorPromise (error: Response | any) {
	     console.error(error.message || error);
       return Promise.reject(error.message || error);
  }


}
