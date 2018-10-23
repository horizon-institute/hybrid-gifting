import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Base64 } from 'js-base64';

import { Timeline } from '../../objects/timeline/timeline';
import { TimelineEntry } from '../../objects/timeline-entry/timeline-entry';
import { TimelineEntryId } from '../../objects/timeline-entry-id/timeline-entry-id';

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

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    let debug = true;
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
