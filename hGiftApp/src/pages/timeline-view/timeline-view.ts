import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';

import { Base64 } from 'js-base64';

import { Timeline } from '../../objects/timeline/timeline';
import { TimelineEntry } from '../../objects/timeline-entry/timeline-entry';
import { TimelineEntryId } from '../../objects/timeline-entry-id/timeline-entry-id';


import { TimelineProvider } from '../../providers/timeline/timeline';

/**
 * Generated class for the TimelineViewPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-timeline-view',
  templateUrl: 'timeline-view.html',
})
export class TimelineViewPage {

  private timeline: Timeline;
  private timelineEntries: TimelineEntry[];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private loadingCtrl: LoadingController,
    private timelineProvider: TimelineProvider
  ) {
    let debug = false;
    if (debug) {
      this.timeline = new Timeline({
        "status": "local",
        "id": 1000,
        "shortDescription": "",
        "longDescription": "",
        "entries": [
          { "id": 1, "createdAt": ""},
          { "id": 2, "createdAt": ""}
        ]
      });

      this.timelineEntries = [
        TimelineEntry.createLinkEntry(1000, "", "https://www.artocdes.co.uk/hg?link=1", "qrcode"),
        TimelineEntry.createImageEntry(1000, "", "https://www.artocdes.co.uk/hg?link=1", "assets/imgs/logo.png"),
        TimelineEntry.createTextEntry(1000, "", "https://www.artocdes.co.uk/hg?link=1", "Hello! 😅 x 💩")
      ];
    } else {


      this.timeline = this.navParams.get("timeline");

      let ids: TimelineEntryId[] = [];
      for (var i=0; i<this.timeline.getNumberOfEntries(); ++i) {
        ids.push(this.timeline.getEntryId(i));
      }

      let loading = this.loadingCtrl.create({content:"Loading..."});
      loading.present();
      Promise.all(
        ids.map((id)=>{return this.timelineProvider.getTimelineEntry(id)})
      ).then((timelineEntries)=>{
        console.log("before then");
        console.log("loaded "+timelineEntries.length + " entries from "+ids.length+" IDs");

/*
        // Fix order, Promise.all does not preserve order.
        var timelineEntriesMap = {};
        for (var i=0; i<timelineEntries.length; ++i) {
          let id: TimelineEntryId = timelineEntries[i].getId();
          let key = "TL"+id.getTimelineId()+"E"+id.getID();
          timelineEntriesMap[key] = timelineEntries[i];
        }

        this.timelineEntries = ids.map((id)=>{
          let key = "TL"+id.getTimelineId()+"E"+id.getID();
          return timelineEntriesMap[key];
        });
        */

        this.timelineEntries = timelineEntries.sort((a, b)=>{return (new Date(a.getCreatedAt()).getTime()) - (new Date(b.getCreatedAt()).getTime());});


        loading.dismiss();

      }).catch((reason)=>{
        console.log("before catch");
        loading.dismiss();
        alert("There was an error loading timeline entries. (1)");
        console.log(reason);
      });
      console.log("after promise");

    }

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TimelineViewPage');
  }

  private decodeBase64TextURI(uri: string): string {
    if (uri.startsWith("data:text/plain;base64,")) {
      uri = uri.substr("data:text/plain;base64,".length);
    }
    return Base64.decode(uri);
  }

}
