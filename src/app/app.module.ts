import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicStorageModule } from '@ionic/storage';
import { HttpModule } from '@angular/http';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { Network } from '@ionic-native/network';
import { BLE } from '@ionic-native/ble';
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

import { AuthProvider } from '../providers/auth-provider';
import { HbuddyProvider } from '../providers/hbuddy-provider';
import { SharedProvider } from '../providers/shared-provider';
import { MqttProvider } from '../providers/mqtt-provider';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

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
    ContactPage
  ],
  imports: [
    HttpModule,
    BrowserModule,
    IonicModule.forRoot(MyApp),
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
    ContactPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    AuthProvider,
    HbuddyProvider,
    SharedProvider,
    MqttProvider,
    BLE,
    Network,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
