import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MakeLinkMethodSelectPage } from './make-link-method-select';

@NgModule({
  declarations: [
    MakeLinkMethodSelectPage,
  ],
  imports: [
    IonicPageModule.forChild(MakeLinkMethodSelectPage),
  ],
})
export class MakeLinkMethodSelectPageModule {}
