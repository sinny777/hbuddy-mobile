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
cordova platform update android
cordova platform add ios@4.1.0
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
