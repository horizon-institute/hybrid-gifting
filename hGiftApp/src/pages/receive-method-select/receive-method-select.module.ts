import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReceiveMethodSelectPage } from './receive-method-select';

@NgModule({
  declarations: [
    ReceiveMethodSelectPage,
  ],
  imports: [
    IonicPageModule.forChild(ReceiveMethodSelectPage),
  ],
})
export class ReceiveMethodSelectPageModule {}
