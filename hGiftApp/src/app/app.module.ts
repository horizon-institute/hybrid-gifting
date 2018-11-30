import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { IonicStorageModule } from '@ionic/storage';

import { MyApp } from './app.component';

import { HomePage } from '../pages/home/home';
import { ReceiveMethodSelectPage } from '../pages/receive-method-select/receive-method-select';
import { MakeGiftPage } from '../pages/make-gift/make-gift';

import { TimelineViewPage } from '../pages/timeline-view/timeline-view';

import { MakeTimelineGiftPage } from '../pages/make-timeline-gift/make-timeline-gift';
import { MakeLinkMethodSelectPage } from '../pages/make-link-method-select/make-link-method-select';


import { ReceiveTimelineGiftPage } from '../pages/receive-timeline-gift/receive-timeline-gift';

import { QrCodeScannerPage } from '../pages/qr-code-scanner/qr-code-scanner';

import { UserIdProvider } from '../providers/user-id/user-id';
import { TimelineProvider } from '../providers/timeline/timeline';


import { ImagePicker } from '@ionic-native/image-picker';
import { NFC, Ndef } from '@ionic-native/nfc';
import { QRScanner } from '@ionic-native/qr-scanner';
import { HybridHttpProvider } from '../providers/hybrid-http/hybrid-http';

import { HttpClientModule, HttpClient } from '@angular/common/http';
import { HTTP } from '@ionic-native/http';

import { File } from '@ionic-native/file';

import { InAppBrowser } from '@ionic-native/in-app-browser';
import { ImageEntryViewPage } from '../pages/image-entry-view/image-entry-view';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ReceiveMethodSelectPage,
    MakeGiftPage,
    TimelineViewPage,
    MakeTimelineGiftPage,
    MakeLinkMethodSelectPage,
    ReceiveTimelineGiftPage,
    QrCodeScannerPage,
    ImageEntryViewPage
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ReceiveMethodSelectPage,
    MakeGiftPage,
    TimelineViewPage,
    MakeTimelineGiftPage,
    MakeLinkMethodSelectPage,
    ReceiveTimelineGiftPage,
    QrCodeScannerPage,
    ImageEntryViewPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    UserIdProvider,
    TimelineProvider,
    NFC, Ndef,
    ImagePicker,
    QRScanner,
    HttpClient,
    HTTP,
    HybridHttpProvider,
    InAppBrowser,
    File
  ]
})
export class AppModule {}
