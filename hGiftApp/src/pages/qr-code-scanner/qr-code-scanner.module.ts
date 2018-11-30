import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { QrCodeScannerPage } from './qr-code-scanner';

@NgModule({
  declarations: [
    QrCodeScannerPage,
  ],
  imports: [
    IonicPageModule.forChild(QrCodeScannerPage),
  ],
})
export class QrCodeScannerPageModule {}
