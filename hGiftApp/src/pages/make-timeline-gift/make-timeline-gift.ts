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
  selector: 'make-timeline-gift',
  templateUrl: 'make-timeline-gift.html',
})
export class MakeTimelineGiftPage {

  private timeline: Timeline;
  private timelineEntries: TimelineEntry[] = [];


  private addLinkCount: number = 0; // UI use only
  private addContentCount: number = 0; // UI use only

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
    }).catch((reason)=>{
      alert("There was an error. (1)");
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

  private addLink() {
    this.navCtrl.push(MakeLinkMethodSelectPage, {"callback": (linkType:string, uri:string)=>{
      let entry = TimelineEntry.createLinkEntry(this.timeline.getTimelineID(), "", uri, linkType);
      this.timelineProvider.addSaveTimelineEntry(this.timeline, entry).then((value)=>{
        this.zone.run(()=>{
          ++this.addLinkCount;
          this.timelineEntries.push(
            entry
          );
        });
      }).catch((reason)=>{
        alert("There was a problem.");
        console.log(reason);
      });
    }});
  }

  private removeLink(linkUri: string) {
    this.zone.run(()=>{
      var promises = [];
      for (var i=0; i<this.timelineEntries.length; ++i) {
        if (this.timelineEntries[i].getMetadata("hg_link_uri") == linkUri) {
          promises.push(this.timelineProvider.deleteTimelineEntry(this.timelineEntries[i]));
          this.timeline.removeLocalEntry(this.timelineEntries[i].getId());
          this.timelineEntries.splice(i, 1);
          --i;
        }
      }
      Promise.all(promises).then(()=>{}).catch((reason)=>{ console.log("Error deleting many timeline entries: "+JSON.stringify(reason)); });
      this.timelineProvider.saveTimeline(this.timeline).then(()=>{}).catch((reason)=>{ console.log("Error saving updated timeline: "+JSON.stringify(reason)); });
    });
  }

  private debugPlaceholderImageCount=0;
  private addContent(link: string, contentType: string) {
    if (contentType == "image") {
      this.zone.run(()=>{
        ++this.addContentCount;
        this.pushContentEntry(
          TimelineEntry.createImageEntry(this.timeline.getTimelineID(), "", link, "assets/imgs/placeholder"+(++this.debugPlaceholderImageCount%3+1)+".jpg")
        );
      });
    } else if (contentType == "text") {


      let alert = this.alertCtrl.create({
        title: 'Add a message',
        inputs: [
          {
            name: 'message',
            placeholder: 'Your message here 🦄'
          }
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: data => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Add',
            handler: data => {
              let trimmedMessage = (data.message as string).trim();
              if (trimmedMessage != "") {
                this.zone.run(()=>{
                  ++this.addContentCount;
                  this.pushContentEntry(
                    TimelineEntry.createTextEntry(this.timeline.getTimelineID(), "", link, trimmedMessage)
                  );
                });
              }
            }
          }
        ]
      });
      alert.present();
    }
  }

  private pushContentEntry(entry: TimelineEntry) {
    this.timelineProvider.addSaveTimelineEntry(this.timeline, entry).then(()=>{
      this.zone.run(()=>{
        this.timelineEntries.push(entry);
      });
    }).catch((reason)=>{
      console.log("Error adding content to timeline: "+JSON.stringify(reason));
    });
  }

  private removeContent(id: TimelineEntryId) {
    this.zone.run(()=>{
      for (var i=0; i<this.timelineEntries.length; ++i) {
        if (this.timelineEntries[i].getId().getID() == id.getID()) {
          this.timelineEntries.splice(i, 1);
          break;
        }
      }
    });

    this.timelineProvider.getTimelineEntry(id).then((entry)=>{
      return this.timelineProvider.removeSaveTimelineEntry(this.timeline, entry);
    }).catch((reason)=>{
      console.log("Error saving updated timeline: "+JSON.stringify(reason));
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

}
