import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';

import { Base64 } from 'js-base64';

import { Timeline } from '../../objects/timeline/timeline';
import { TimelineEntry } from '../../objects/timeline-entry/timeline-entry';
import { TimelineEntryId } from '../../objects/timeline-entry-id/timeline-entry-id';

import { TimelineProvider } from '../../providers/timeline/timeline';

import { MakeLinkMethodSelectPage } from '../make-link-method-select/make-link-method-select';

/**
 * Generated class for the TimelineViewPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'receive-timeline-gift',
  templateUrl: 'receive-timeline-gift.html',
})
export class ReceiveTimelineGiftPage {

  private timeline: Timeline;
  private timelineEntries: TimelineEntry[] = [];


  private addLinkCount: number = 0; // UI use only
  private addContentCount: number = 0; // UI use only

  private toRevealQRCodes = 0;
  private toRevealNFCTags = 0;
  private toRevealArtcodes = 0;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private zone: NgZone,
    private timelineProvider: TimelineProvider
  ) {

    this.timeline = this.navParams.get("timeline");


    let ids: TimelineEntryId[] = [];
    for (var i=0; i<this.timeline.getNumberOfEntries(); ++i) {
      ids.push(this.timeline.getEntryId(i));
    }

    console.log(ids.length + " IDs");
    console.log(ids);


    Promise.all(ids.map((id)=>{return this.timelineProvider.getTimelineEntry(id)})).then((timelineEntries)=>{
      console.log("loaded "+timelineEntries.length + " entries from "+ids.length+" IDs");
      this.timelineEntries = timelineEntries;

      this.zone.run(()=>{
        for (var i=0; i<this.timelineEntries.length; ++i) {
          let entry = this.timelineEntries[i];
          if (entry.isLink()) {
            if (entry.isArtcode()) {
              ++this.toRevealArtcodes;
            } else if (entry.isQR()) {
              ++this.toRevealQRCodes;
            } else if (entry.isNFC()) {
              ++this.toRevealNFCTags;
            }
          } else if (entry.isReveal()) {
            if (entry.isArtcode()) {
              --this.toRevealArtcodes;
            } else if (entry.isQR()) {
              --this.toRevealQRCodes;
            } else if (entry.isNFC()) {
              --this.toRevealNFCTags;
            }
          }
        }
      });

    }).catch((reason)=>{
      alert("There was an error loading timeline entries. (1)");
      console.log(reason);
    });

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

  private pushRevealEntry(entry: TimelineEntry) {
    this.timelineProvider.addSaveTimelineEntry(this.timeline, entry).then(()=>{
      this.zone.run(()=>{
        this.timelineEntries.push(entry);
        if (entry.isArtcode()) { --this.toRevealArtcodes; }
        if (entry.isQR()) { --this.toRevealQRCodes; }
        if (entry.isNFC()) { --this.toRevealNFCTags; }
      });
    }).catch((reason)=>{
      console.log("Error adding content to timeline: "+JSON.stringify(reason));
    });
  }

  private getArtcodeCodeFromUri(uri: string): string {
    var re = /code=([0-9:]+)/;
    let result = re.exec(uri);
    if (result && result[1]) {
      return result[1];
    }
    return null;
  }

  private scanQR() {
    // TODO: ...

    let debug = true;
    if (debug) {
      for (var i=0; i<this.timelineEntries.length; ++i) {
        let entry = this.timelineEntries[i];
        if (entry.isLink() && entry.isQR()) {
          let revealEntry = TimelineEntry.createRevealLinkEntry(
            this.timeline.getTimelineID(), 
            "", 
            entry.getMetadata(TimelineEntry.METADATA_KEY_LINK_URI), 
            entry.getMetadata(TimelineEntry.METADATA_KEY_LINK_TYPE)
          );

          this.pushRevealEntry(revealEntry);
        }
      }
    }
  }

  private scanArtcode() {
    // TODO: ...

    let debug = true;
    if (debug) {
      for (var i=0; i<this.timelineEntries.length; ++i) {
        let entry = this.timelineEntries[i];
        if (entry.isLink() && entry.isArtcode()) {
          let revealEntry = TimelineEntry.createRevealLinkEntry(
            this.timeline.getTimelineID(), 
            "", 
            entry.getMetadata(TimelineEntry.METADATA_KEY_LINK_URI), 
            entry.getMetadata(TimelineEntry.METADATA_KEY_LINK_TYPE)
          );

          this.pushRevealEntry(revealEntry);
        }
      }
    }
  }

  private startNFC() {
    // TODO: ...

    let debug = true;
    if (debug) {
      for (var i=0; i<this.timelineEntries.length; ++i) {
        let entry = this.timelineEntries[i];
        if (entry.isLink() && entry.isNFC()) {
          let revealEntry = TimelineEntry.createRevealLinkEntry(
            this.timeline.getTimelineID(), 
            "", 
            entry.getMetadata(TimelineEntry.METADATA_KEY_LINK_URI), 
            entry.getMetadata(TimelineEntry.METADATA_KEY_LINK_TYPE)
          );

          this.pushRevealEntry(revealEntry);
        }
      }
    }
  }

}
