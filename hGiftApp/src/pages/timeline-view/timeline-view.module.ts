import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TimelineViewPage } from './timeline-view';

@NgModule({
  declarations: [
    TimelineViewPage,
  ],
  imports: [
    IonicPageModule.forChild(TimelineViewPage),
  ],
})
export class TimelineViewPageModule {}
