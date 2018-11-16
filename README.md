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

sudo gem install cocoapods

<!-- ionic cordova platform update android -->
ionic platform add android@6.4.0
ionic platform add ios@4.5.5

ionic plugin rm phonegap-plugin-push
ionic plugin add phonegap-plugin-push@2.2.3 --variable SENDER_ID=874807563899 --save

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

### For android

Let’s generate our private key using the keytool command that comes with the JDK. If this tool isn’t found

`keytool -genkey -v -keystore my-release-key.keystore -alias hbuddy -keyalg RSA -keysize 2048 -validity 10000`

You’ll first be prompted to create a password for the keystore. Then, answer the rest of the nice tools’s questions and when it’s all done, you should have a file called my-release-key.keystore created in the current directory.

Note: Make sure to save this file somewhere safe, if you lose it you won’t be able to submit updates to your app!

To sign the unsigned APK, run the jarsigner tool which is also included in the JDK.  Also make sure you copy the keystore file generated in last step in the same folder as apk file.

`jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore android-release-unsigned.apk hbuddy`

'zipalign -v 4 android-release-unsigned.apk hbuddy.apk'

## SOME IMPORTANT commands
```

Sometimes below command is required
sudo chown -R $USER:$GROUP ~/.ionic

ionic plugin rm phonegap-plugin-push
ionic plugin add phonegap-plugin-push --variable SENDER_ID=874807563899 --save

ionic cordova plugin add cordova-plugin-facebook4 --variable APP_ID="330079704089458" --variable APP_NAME="hbuddy"

ionic cordova -d plugin add /Users/gurvindersingh/Documents/development/personal/hukam/repository/phonegap-facebook-plugin --variable APP_ID="330079704089458" --variable APP_NAME="hbuddy"

````

## FIXING SOME ISSUES

### Build issue on new Android Build

1: In build.gradle file under platforms/android, make sure it has following entry

```
allprojects {
    repositories {
        mavenCentral();
        jcenter()
        maven {
            url "https://maven.google.com"
        }
    }
}

```

Also, before running the build for android make sure project.properties has following entries:
```
target=android-26
cdvCompileSdkVersion=26.0.1

```
