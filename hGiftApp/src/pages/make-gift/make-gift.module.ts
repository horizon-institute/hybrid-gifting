import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MakeGiftPage } from './make-gift';

@NgModule({
  declarations: [
    MakeGiftPage,
  ],
  imports: [
    IonicPageModule.forChild(MakeGiftPage),
  ],
})
export class MakeGiftPageModule {}
