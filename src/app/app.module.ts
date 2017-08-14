import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicStorageModule } from '@ionic/storage';
import { HttpModule } from '@angular/http';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { Network } from '@ionic-native/network';
import { BLE } from '@ionic-native/ble';
import { Push } from '@ionic-native/push';
import { GooglePlus } from '@ionic-native/google-plus';
import { CloudSettings, CloudModule } from '@ionic/cloud-angular';

import { MyApp } from './app.component';

import { LoginPage } from '../pages/login/login';
import { PlacesPage } from '../pages/places/places';
import { DashboardPage } from '../pages/dashboard/dashboard';
import { PlaceAreasPage } from '../pages/place-areas/place-areas';
import { DevicesPage } from '../pages/devices/devices';

import { ScenesPage } from '../pages/scenes/scenes';
import { EnergyPage } from '../pages/energy/energy';
import { GroupsPage } from '../pages/groups/groups';
import { SettingsPage } from '../pages/settings/settings';
import { GatewayPage } from '../pages/gateway/gateway';
import { ContactPage } from '../pages/contact/contact';
import { CamerasPage } from '../pages/cameras/cameras';

import { AuthProvider } from '../providers/auth-provider';
import { HbuddyProvider } from '../providers/hbuddy-provider';
import { SharedProvider } from '../providers/shared-provider';
import { MqttProvider } from '../providers/mqtt-provider';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

const cloudSettings: CloudSettings = {
  'core': {
    'app_id': '1176742f'
  },
  'push': {
    'sender_id': '874807563899',
    'pluginConfig': {
      'ios': {
        'badge': true,
        'sound': true
      },
      'android': {
        'iconColor': '#343434'
      }
    }
  }
};

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    PlacesPage,
    DashboardPage,
    PlaceAreasPage,
    DevicesPage,
    ScenesPage,
    EnergyPage,
    GroupsPage,
    SettingsPage,
    GatewayPage,
    ContactPage,
    CamerasPage
  ],
  imports: [
    HttpModule,
    BrowserModule,
    IonicModule.forRoot(MyApp),
    CloudModule.forRoot(cloudSettings),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    PlacesPage,
    DashboardPage,
    PlaceAreasPage,
    DevicesPage,
    ScenesPage,
    EnergyPage,
    GroupsPage,
    SettingsPage,
    GatewayPage,
    ContactPage,
    CamerasPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    AuthProvider,
    HbuddyProvider,
    SharedProvider,
    MqttProvider,
    BLE,
    Push,
    Network,
    GooglePlus,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
