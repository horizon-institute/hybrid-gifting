import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';

import { Base64 } from 'js-base64';

import { Timeline } from '../../objects/timeline/timeline';
import { TimelineEntry } from '../../objects/timeline-entry/timeline-entry';
import { TimelineEntryId } from '../../objects/timeline-entry-id/timeline-entry-id';

import { TimelineProvider } from '../../providers/timeline/timeline';

import { QrCodeScannerPage } from '../qr-code-scanner/qr-code-scanner';
import { NFC, Ndef, NdefTag, NdefRecord } from '@ionic-native/nfc';
import { Subscription } from 'rxjs/Subscription';

import { UserIdProvider } from '../../providers/user-id/user-id';

import { InAppBrowser } from '@ionic-native/in-app-browser';
import { ImageEntryViewPage } from '../image-entry-view/image-entry-view';
import { GlobalUtils } from '../../objects/global-utils/global-utils';

// declare "Artcodes" so we can access the javascript object
declare var Artcodes;

@IonicPage()
@Component({
  selector: 'receive-timeline-gift',
  templateUrl: 'receive-timeline-gift.html',
})
export class ReceiveTimelineGiftPage {

  private isWebBuild = GlobalUtils.isWebBuild(); // Can't access directly from html template.

  private timeline: Timeline;
  private timelineEntries: TimelineEntry[] = [];

  private hasWritenThakyou = false;
  private clientId = "1";

  private addLinkCount: number = 0; // UI use only
  private addContentCount: number = 0; // UI use only

  private toRevealQRCodes = 0;
  private toRevealNFCTags = 0;
  private toRevealArtcodes = 0;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private nfc: NFC, private ndef: Ndef,
    private zone: NgZone,
    private alertCtrl: AlertController,
    private timelineProvider: TimelineProvider,
    private userIdProvider: UserIdProvider,
    private iab: InAppBrowser,
    private loadingCtrl: LoadingController
  ) {
    userIdProvider.getUserId().then((userId)=>{ this.clientId = userId});

    this.timeline = this.navParams.get("timeline");

    let revealEntry: TimelineEntry = this.navParams.get("reveal");


    let ids: TimelineEntryId[] = [];
    for (var i=0; i<this.timeline.getNumberOfEntries(); ++i) {
      ids.push(this.timeline.getEntryId(i));
    }

    console.log(ids.length + " IDs");
    console.log(ids);


    let loading = this.loadingCtrl.create({content:"Loading..."});
    loading.present();
    console.log("before promise");
    Promise.all(
      ids.map((id)=>{return this.timelineProvider.getTimelineEntry(id)})
    ).then((timelineEntries)=>{
      console.log("before then");
      console.log("loaded "+timelineEntries.length + " entries from "+ids.length+" IDs");

      for (var i=0; i<this.timelineEntries.length; ++i) {
        console.log(this.timelineEntries[i].getMimeType());
      }

      this.zone.run(()=>{
        this.timelineEntries = timelineEntries;
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
          } else if (entry.isThankYouNote() && entry.getUserId()==this.clientId) {
            this.hasWritenThakyou = true;
          }
        }
      });


      if (revealEntry != null) {
        var alreadyRevealed = false;
        for (var i=0; i<this.timelineEntries.length; ++i) {
          let entry = this.timelineEntries[i];
          if (
            entry.isReveal() && 
            entry.getMetadata(TimelineEntry.METADATA_KEY_LINK_URI) == revealEntry.getMetadata(TimelineEntry.METADATA_KEY_LINK_URI) &&
            entry.getUserId() == revealEntry.getUserId()
          ) {
            alreadyRevealed = true;
            break;
          }
        }

        // add reveal link type if not known (e.g a web event)
        if (revealEntry.getMetadata(TimelineEntry.METADATA_KEY_LINK_TYPE) == "") {
          for (var i=0; i<this.timelineEntries.length; ++i) {
            let entry = this.timelineEntries[i];
            if (entry.isLink() && entry.getMetadata(TimelineEntry.METADATA_KEY_LINK_URI) == revealEntry.getMetadata(TimelineEntry.METADATA_KEY_LINK_URI)) {
              console.log("Setting revealEntry link type to "+entry.getMetadata(TimelineEntry.METADATA_KEY_LINK_TYPE));
              revealEntry.addMetadata(TimelineEntry.METADATA_KEY_LINK_TYPE, entry.getMetadata(TimelineEntry.METADATA_KEY_LINK_TYPE));
            }
          }
        }

        if (!alreadyRevealed) {
          this.pushRevealEntry(revealEntry);
        }
      }

      loading.dismiss();

    }).catch((reason)=>{
      console.log("before catch");
      alert("There was an error loading timeline entries. (1)");
      console.log(reason);
    });
    console.log("after promise");

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TimelineViewPage');
  }

  public ionViewWillEnter() { 
    // Runs when the page is about to enter and become the active page.

    this.nfcCheck();
  }

  public ionViewWillLeave() {
    // Runs when the page is about to leave and no longer be the active page.

    this.closeNfc();
  }

  private openUrl(url: string) {
    this.iab.create(url, '_system');
  }

  private decodeBase64TextURI(uri: string): string {
    if (uri.startsWith("data:text/plain;base64,")) {
      uri = uri.substr("data:text/plain;base64,".length);
    }
    return Base64.decode(uri);
  }
  
  private fontStyleForText(text: string): number {
    let baseTextSize = 100.0;
    let maxChars = 30.0;
    var fontSize = (maxChars - Math.min(text.length, maxChars))/maxChars*200.0 + baseTextSize;
    //return "font-size: "+fontSize+"%;";
    return fontSize;
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

  private sendThankYouNote() {
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
                this.pushThankYouEntry(
                  TimelineEntry.createThankYouNoteEntry(this.timeline.getTimelineID(), this.clientId, trimmedMessage)
                );
              });
            }
          }
        }
      ]
    });
    alert.present();
  }

  private pushThankYouEntry(entry: TimelineEntry) {
    this.timelineProvider.publishTimelineEntry(entry, this.timeline).then((publishedEntry)=>{
      entry = publishedEntry;
      //return this.timelineProvider.addSaveTimelineEntry(this.timeline, publishedEntry);
    //}).then(()=>{
      this.timeline.addRemoteEntry(entry.getId());
      return this.timelineProvider.saveTimeline(this.timeline);
    }).then(()=>{
      this.zone.run(()=>{
        this.hasWritenThakyou = true;
        this.timelineEntries.push(entry);
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
    if (this.isWebBuild) return;
    this.navCtrl.push(QrCodeScannerPage, { callback: (uri:string)=>{
      this.handleResult(uri, TimelineEntry.LINK_TYPE_QRCODE);
    } });
  }

  private scanArtcode() {
    let this_ = this;

    var scanExperience = {};
    scanExperience['id'] = "id";

    var codes = new Set();
    for (var i=0; i<this.timelineEntries.length; ++i) {
      let entry = this.timelineEntries[i];
      if (entry.isArtcode()) {
        if (entry.isLink()) {
          codes.add(this.getArtcodeCodeFromUri(entry.getMetadata(TimelineEntry.METADATA_KEY_LINK_URI)));
        } else if (entry.isReveal()) {
          codes.delete(this.getArtcodeCodeFromUri(entry.getMetadata(TimelineEntry.METADATA_KEY_LINK_URI)));
        }
      }
    }
    var actions = [];
    codes.forEach(code => actions.push({"codes": [code], "name": "Continue"}));
    //for (let code of codes) {
      //actions.push({"codes": [code], "name": "Continue"});
    //}

    scanExperience['actions'] = actions;

    scanExperience['name'] = "";
    scanExperience['animationName'] =  "";
    scanExperience['pipeline'] = ["tile", "detect"];
    scanExperience['focusMode'] = "tapToFocus";
    scanExperience['requestedAutoFocusMode'] = "tapToFocus";
    
    scanExperience['foregroundColor'] = "#FFFFFF";
    scanExperience['backgroundColor'] = "#3F4C6B";
    scanExperience['highlightBackgroundColor'] = "#FFFFFF";
    scanExperience['highlightForegroundColor'] = "#3F4C6B";
    scanExperience['openWithoutUserInput'] = true;
    scanExperience['scanScreenTextTitle'] = "Scan the Artcode on your gift";
    scanExperience['scanScreenTextDesciption'] = "Tip: make sure the whole image is inside the screen below";
    
    let fn = ()=>{
      try {
        // open Artcode scanner:
        Artcodes.scan(
          scanExperience, 
          function (code) { this_.handleArtcodeScanResult(code); }
        );

      } catch (err) {
        // if Artcode plugin is not available (e.g. web browser debugging) show dialog for manual code entry:
        console.log("Artcodes failed.",[err]);
        let alert = this.alertCtrl.create({
          title: 'Artcodes error',
          inputs: [
            {
              name: 'code',
              placeholder: 'Code'
            }
          ],
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              handler: data => {
                this.handleArtcodeScanResult("BACK");
              }
            },
            {
              text: 'Continue',
              handler: data => {
                var code: string = data['code'];
                if (code.indexOf(':') < 0) {
                  code = code.split('').join(':');
                }
                this.handleArtcodeScanResult(code);
              }
            }
          ]
        });
        alert.present();
      }
    };
    fn();
  }

  private handleArtcodeScanResult(code: string) {
    this.handleResult(code, TimelineEntry.LINK_TYPE_ARTCODE);
  }

  private startNFC() {
    if (this.isWebBuild) return;

    let debug = false;
    if (debug) {
      for (var i=0; i<this.timelineEntries.length; ++i) {
        let entry = this.timelineEntries[i];
        if (entry.isLink() && entry.isNFC()) {
          let revealEntry = TimelineEntry.createRevealLinkEntry(
            this.timeline.getTimelineID(), 
            this.clientId, 
            entry.getMetadata(TimelineEntry.METADATA_KEY_LINK_URI), 
            entry.getMetadata(TimelineEntry.METADATA_KEY_LINK_TYPE)
          );

          this.pushRevealEntry(revealEntry);
        }
      }
    } else {
      this.makeLinkNFCTag();
    }
  }


  // NFC methods:

  private nfcIsSupported = false;
  private nfcIsEnabled = false;
  private nfcSubscriber: Subscription = null;

  private nfcCheck() {
    this.nfc.enabled().then(()=>{
      this.zone.run(()=>{
        this.nfcIsSupported = this.nfcIsEnabled = true;
      });
    }).catch((reason)=>{
      this.zone.run(()=>{
        if (reason == "NO_NFC") {
          this.nfcIsSupported = this.nfcIsEnabled = false;
        } else if (reason == "NFC_DISABLED") {
          this.nfcIsSupported = true; 
          this.nfcIsEnabled = false;
        } else {
          //alert("NFC is not available: "+JSON.stringify(reason));
        }
      });
    });
  }

  private closeNfc() {
    if (this.nfcSubscriber != null) {
      console.log("Closing nfcSubscriber (ionViewWillLeave)");
      this.nfcSubscriber.unsubscribe();
      this.nfcSubscriber = null;
    }
  }

  /**
   * Read a URI from an NFC tag.
   * @param callback Function to pass the URI to (only called if there is a URI, nothing happens if user cancels).
   */
  private makeLinkNFCTag() {
    if (!this.nfcIsSupported) {
      let alert = this.alertCtrl.create({
        title: 'NFC not supported',
        subTitle: 'NFC is not supported on this device.',
        buttons: ['Dismiss']
      });
      alert.present();
    } else if (!this.nfcIsEnabled) {
      let alert = this.alertCtrl.create({
        title: 'NFC is turned off',
        message: 'Please turn NFC on in settings to use NFC.',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Settings',
            handler: () => {
              console.log('Settings clicked');

              this.nfc.showSettings();
            }
          }
        ]
      });
      alert.present();
    } else {

      window['nfc'].beginSession(()=>{
        console.log("NFC: Session started");

        if (this.nfcSubscriber == null) {
          console.log("Creating nfcSubscriber");
          this.nfcSubscriber = this.nfc.addNdefListener(() => {
            console.log('successfully attached ndef listener');
          }, (err) => {
            console.log('error attaching ndef listener' + JSON.stringify(err));
          }).subscribe((event) => {
            let thisNdefTag: NdefTag = event.tag;
            let thisNdefRecord: NdefRecord[] = thisNdefTag.ndefMessage;
            for (var i=0; i<thisNdefRecord.length; ++i) {
              let record: NdefRecord = thisNdefRecord[i];

              if (window['util'].isType(record, window['ndef'].TNF_WELL_KNOWN, window['ndef'].RTD_URI)) {
                let str = window['ndef'].uriHelper.decodePayload(record.payload);
                console.log(i+": "+str);
                console.log("Closing nfcSubscriber");
                this.nfcSubscriber.unsubscribe();
                this.nfcSubscriber = null;
                this.handleResult(str, TimelineEntry.LINK_TYPE_NFC);
                //this.navCtrl.pop();
              } else {
                alert("Not a valid NFC tag.");
              }

            }
            window['nfc'].invalidateSession();
          });
        } else {
          console.log("nfcSubscriber already exists");
        }
      }, ()=>{
        alert("NFC: Unable to start session");
      });
    }
  }

  private handleResult(uri_in: string, linkType: string) {
    let uri = TimelineEntry.removeHash(uri_in);
    var found = false;
    var revealEntry = null;
    for (var i=0; i<this.timelineEntries.length; ++i) {
      let entry = this.timelineEntries[i];
      if (entry.isLink() && entry.getMetadata(TimelineEntry.METADATA_KEY_LINK_TYPE) == linkType) {
        if (
          (linkType==TimelineEntry.LINK_TYPE_ARTCODE && uri == this.getArtcodeCodeFromUri(entry.getMetadata(TimelineEntry.METADATA_KEY_LINK_URI))) || 
          (uri == entry.getMetadata(TimelineEntry.METADATA_KEY_LINK_URI))
        ) {
          revealEntry = TimelineEntry.createRevealLinkEntry(
            this.timeline.getTimelineID(), 
            this.clientId, 
            entry.getMetadata(TimelineEntry.METADATA_KEY_LINK_URI), 
            entry.getMetadata(TimelineEntry.METADATA_KEY_LINK_TYPE)
          );

          found = true;
        }
      } else if (entry.isReveal() && entry.getMetadata(TimelineEntry.METADATA_KEY_LINK_TYPE) == linkType) {
        if (
          (linkType==TimelineEntry.LINK_TYPE_ARTCODE && uri == this.getArtcodeCodeFromUri(entry.getMetadata(TimelineEntry.METADATA_KEY_LINK_URI))) || 
          (uri == entry.getMetadata(TimelineEntry.METADATA_KEY_LINK_URI))
        ) {
          revealEntry = null;
        }
      }
    }
    if (revealEntry != null) {
      // New content was found.
      this.pushRevealEntry(revealEntry);
    } else if (!found) {
      // The link is not part of the timeline.
      alert("This does not contain any content or is not part of your gift.");
    } else {
      // Content already found.
      alert("You have already revealed this content.");
    }
  }


  private openImage(entry: TimelineEntry) {
    ImageEntryViewPage.open(this.navCtrl, entry);
  }
}
