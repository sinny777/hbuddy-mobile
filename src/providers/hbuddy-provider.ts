import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
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

  fetchGatewayInfo(): Promise<any>{
    let GET_URL: string = this.sharedProvider.CONFIG.GATEWAY_ENDPOINT + ":9000/api/gateway/info";
    this.reqOptions = new RequestOptions({headers: this.authProvider.headers});
    return this.http.get(GET_URL, this.reqOptions)
    .toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise);
  }

  fetchUserGroups(userObj): Promise<any>{
        if(this.sharedProvider.isDemoAccount()){
            return this.sharedProvider.getDemoData("groups");
        }

        let ownerId: string = userObj.id;
	    	if(userObj.userId){
	    		ownerId = userObj.userId;
	    	}
        if(!ownerId){
          return Promise.reject("<<< Cannot fetch Groups for an unknown ownerId >>>>> ");
        }
        let findReq: any = {
                            filter: {
    			    			  		            where: {"or": [{"members": {"elemMatch": {"userId": {"$eq": ownerId}}}},
    			    			  		                {"ownerId": ownerId}]}
    	    				   		             }
                            };
        console.log("In fetchUserGroups, findReq: ", JSON.stringify(findReq));
        let GET_URL: string = this.sharedProvider.CONFIG.API_BASE_URL + "/Groups?";
        this.reqOptions = new RequestOptions({headers: this.authProvider.headers});
        this.reqOptions.params = findReq;
        return this.http.get(GET_URL, this.reqOptions)
        .toPromise()
		    .then(this.extractData)
	      .catch(this.handleErrorPromise);
  }

  fetchUserPlaces(userObj): Promise<any>{

    return this.fetchUserGroups(userObj).then( groups => {
        console.log("Fetched User Groups:  ", JSON.stringify(groups));
        userObj.groups = groups;

        if(this.sharedProvider.isDemoAccount()){
            return this.sharedProvider.getDemoData("places");
        }

        let ownerId: string = userObj.id;
        if(userObj.userId){
          ownerId = userObj.userId;
        }
        if(!ownerId){
          return Promise.reject("<<< Cannot fetch Places for an unknown ownerId >>>>> ");
        }
        let findReq: any = {filter: {where: {or: [{ownerId: ownerId}]}}};
        let placeIds: Array<string> = [];
        for (let group of userObj.groups) {
            placeIds.push(group.placeId);
        }
        if(placeIds.length > 0){
          findReq.filter.where.or.push({id: {inq: placeIds}});
        }
        console.log("In fetchUserPlaces, findReq: ", JSON.stringify(findReq));
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

  fetchUserSettings(userId, placeId){
      console.log("Find UserSettings for userId: ", userId, ", placeId: ", placeId);
      let findReq: any = {filter: {where: {and: [{userId: userId}, {placeId: placeId}]}}};
      let GET_URL: string = this.sharedProvider.CONFIG.API_BASE_URL + "/UserSettings?";
      this.authProvider.setAuthHeaders();
      this.reqOptions = new RequestOptions({headers: this.authProvider.headers});
      this.reqOptions.params = findReq;
      return this.http.get(GET_URL, this.reqOptions)
      .toPromise()
      .then(this.extractData)
      .catch(this.handleErrorPromise);

  }


  fetchPlaceAreas(selectedPlace): Promise<any>{
      if(this.sharedProvider.isDemoAccount()){
          return this.sharedProvider.getDemoData("placeAreas");
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
        return this.sharedProvider.getDemoData("boards");
    }

    let findReq: any = {
    				filter:{
        			  		 where: {"and": [{"connectedToId": placeArea.id},
        			  		                 {"status": "ACTIVE"}
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

  fetchDevices(board): Promise<any>{
    console.log("IN hbuddyProvider.fetchDevices: >> ", board.id);
    if(this.sharedProvider.isDemoAccount()){
        return this.sharedProvider.getDemoData("devices");
    }

    let findReq: any = {
    				filter:{
        			  		 where: {"parentId": board.uniqueIdentifier}
    								}
    						};
    let GET_URL: string = this.sharedProvider.CONFIG.API_BASE_URL + "/Devices?";
    this.authProvider.setAuthHeaders();
    this.reqOptions = new RequestOptions({headers: this.authProvider.headers});
    this.reqOptions.params = findReq;
    return this.http.get(GET_URL, this.reqOptions)
    .toPromise()
    .then(this.extractData)
          .catch(this.handleErrorPromise);
  }

  fetchScenes(selectedPlace){
    if(this.sharedProvider.isDemoAccount()){
        return this.sharedProvider.getDemoData("scenes");
    }

    let findReq: any = {filter: {where: {placeId: selectedPlace.id}}};
    let GET_URL: string = this.sharedProvider.CONFIG.API_BASE_URL + "/Scenes?";
    this.authProvider.setAuthHeaders();
    this.reqOptions = new RequestOptions({headers: this.authProvider.headers});
    this.reqOptions.params = findReq;
    return this.http.get(GET_URL, this.reqOptions)
    .toPromise()
    .then(this.extractData)
          .catch(this.handleErrorPromise);
  }

  fetchPlaceGroups(placeId): Promise<any>{
        if(this.sharedProvider.isDemoAccount()){
            return this.sharedProvider.getDemoData("groups");
        }

        let findReq: any = {filter: {where: {placeId: placeId}}};
        let GET_URL: string = this.sharedProvider.CONFIG.API_BASE_URL + "/Groups?";
        this.reqOptions = new RequestOptions({headers: this.authProvider.headers});
        this.reqOptions.params = findReq;
        return this.http.get(GET_URL, this.reqOptions)
        .toPromise()
		    .then(this.extractData)
	      .catch(this.handleErrorPromise);
  }

  savePlace(place){
    let POST_URL: string = this.sharedProvider.CONFIG.API_BASE_URL + "/Places";
    if(place.id){
      POST_URL = POST_URL + "?id="+place.id;
    }
    this.authProvider.setAuthHeaders();
    this.reqOptions = new RequestOptions({headers: this.authProvider.headers});
    return this.http.put(POST_URL, place, this.reqOptions)
    .toPromise()
    .then(this.extractData)
          .catch(this.handleErrorPromise);
  }

  saveUserSettings(settings){
    let POST_URL: string = this.sharedProvider.CONFIG.API_BASE_URL + "/UserSettings";
    if(settings.id){
      POST_URL = POST_URL + "?id="+settings.id;
    }
    this.authProvider.setAuthHeaders();
    this.reqOptions = new RequestOptions({headers: this.authProvider.headers});
    return this.http.put(POST_URL, settings, this.reqOptions)
    .toPromise()
    .then(this.extractData)
          .catch(this.handleErrorPromise);
  }

  savePlaceArea(placeArea){
    let POST_URL: string = this.sharedProvider.CONFIG.API_BASE_URL + "/PlaceAreas";
    if(placeArea.id){
      POST_URL = POST_URL + "?id="+placeArea.id;
    }
    this.authProvider.setAuthHeaders();
    this.reqOptions = new RequestOptions({headers: this.authProvider.headers});
    return this.http.put(POST_URL, placeArea, this.reqOptions)
    .toPromise()
    .then(this.extractData)
          .catch(this.handleErrorPromise);
  }

  saveBoard(board){
    let POST_URL: string = this.sharedProvider.CONFIG.API_BASE_URL + "/Boards";
    if(board.id){
      POST_URL = POST_URL + "?id="+board.id;
    }
    this.authProvider.setAuthHeaders();
    this.reqOptions = new RequestOptions({headers: this.authProvider.headers});
    return this.http.put(POST_URL, board, this.reqOptions)
    .toPromise()
    .then(this.extractData)
          .catch(this.handleErrorPromise);
  }

  saveDevice(device){
    let POST_URL: string = this.sharedProvider.CONFIG.API_BASE_URL + "/Devices";
    if(device.id){
      POST_URL = POST_URL + "?id="+device.id;
    }
    this.authProvider.setAuthHeaders();
    this.reqOptions = new RequestOptions({headers: this.authProvider.headers});
    return this.http.put(POST_URL, device, this.reqOptions)
    .toPromise()
    .then(this.extractData)
          .catch(this.handleErrorPromise);
  }

  callConversation(conversationReq){
    let POST_URL: string = this.sharedProvider.CONFIG.API_BASE_URL + "/Conversations";
    if(!conversationReq || !conversationReq.params || !conversationReq.params.input){
      return Promise.reject("<<< Cannot call Conversation without Text ! >>>>> ");
    }
    console.log("IN hbuddyProvider.callConversation: >>> ", conversationReq);
    this.authProvider.setAuthHeaders();
    this.reqOptions = new RequestOptions({headers: this.authProvider.headers});
    return this.http.post(POST_URL, conversationReq, this.reqOptions)
    .toPromise()
    .then(this.extractData)
          .catch(this.handleErrorPromise);
  }

  startDetection(){
       var headers = new Headers();
      //  headers.append('Content-Type', 'application/json');

      let GET_URL: string = this.sharedProvider.CONFIG.GATEWAY_ENDPOINT + "/0/detection/start";
      this.reqOptions = new RequestOptions({headers: headers});
      return this.http.get(GET_URL, this.reqOptions)
      .toPromise()
      .then(this.extractData)
          .catch(this.handleErrorPromise);
  }

  pauseDetection(){
      var headers = new Headers();
      //  headers.append('Content-Type', 'application/json');
      let GET_URL: string = this.sharedProvider.CONFIG.GATEWAY_ENDPOINT + "/0/detection/pause";
      this.reqOptions = new RequestOptions({headers: headers});
      return this.http.get(GET_URL, this.reqOptions)
      .toPromise()
      .then(this.extractData)
          .catch(this.handleErrorPromise);
  }

  private extractData(res: Response) {
        let body = res.json();
        return body;
  }

/*

  private handleError(msg, err, cb){
      console.log("ERROR: ",msg, err);
      if(err.status == 401){
        this.events.publish("auth:required", err);
      }
      cb(err, null);
  }

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
