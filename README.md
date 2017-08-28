# hBuddy - Hukam Mobile App

Mobile Hybrid application for Hukam Home Automation that includes IoT and Cognitive capabilities

## Technologies Used

1: [NodeJs](https://nodejs.org/en/)
2: [Ionic 2](http://ionic.io/2)
3: [Angular 4](https://angular.io/)

## Steps to run

*Prerequisites*
Your system should have NodeJs, latest Ionic installed

*Step 1*
Run following commands to add Platforms:
```
ionic cordova platform update android
ionic cordova platform add ios@4.1.0

ionic cordova plugin rm phonegap-plugin-push
ionic cordova plugin add phonegap-plugin-push --variable SENDER_ID=874807563899 --save

ionic cordova build ios

```
```

*Step 2*
run below command for running the app and verifying on browser
```
ionic serve -l
```

*Step 3*
Run following commands to build the app for iOS and android
```
ionic build ios
ionic build android
```

## SOME IMPORTANT commands
```
Sometimes below command is required
sudo chown -R $USER:$GROUP ~/.ionic

cordova plugin rm phonegap-plugin-push
cordova plugin add phonegap-plugin-push --variable SENDER_ID=874807563899 --save

ionic cordova plugin add cordova-plugin-facebook4 --variable APP_ID="330079704089458" --variable APP_NAME="hbuddy"

ionic cordova -d plugin add /Users/gurvindersingh/Documents/development/personal/hukam/repository/phonegap-facebook-plugin --variable APP_ID="330079704089458" --variable APP_NAME="hbuddy"

````
