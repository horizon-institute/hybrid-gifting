import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ImageEntryViewPage } from './image-entry-view';

@NgModule({
  declarations: [
    ImageEntryViewPage,
  ],
  imports: [
    IonicPageModule.forChild(ImageEntryViewPage),
  ],
})
export class ImageEntryViewPageModule {}
