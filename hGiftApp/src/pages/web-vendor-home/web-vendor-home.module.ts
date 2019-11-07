import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WebVendorHomePage } from './web-vendor-home';

@NgModule({
  declarations: [
    WebVendorHomePage,
  ],
  imports: [
    IonicPageModule.forChild(WebVendorHomePage),
  ],
})
export class WebVendorHomePageModule {}
