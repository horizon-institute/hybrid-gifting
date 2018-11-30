import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, Platform } from 'ionic-angular';

import { NFC, Ndef, NdefTag, NdefRecord } from '@ionic-native/nfc';
import { Subscription } from 'rxjs/Subscription';
import { QrCodeScannerPage } from '../qr-code-scanner/qr-code-scanner';


import { Timeline } from '../../objects/timeline/timeline';
import { TimelineEntry } from '../../objects/timeline-entry/timeline-entry';

import { TimelineProvider } from '../../providers/timeline/timeline';


import { HybridHttpProvider } from '../../providers/hybrid-http/hybrid-http';

import { ReceiveTimelineGiftPage } from '../receive-timeline-gift/receive-timeline-gift';

declare var Artcodes;

@IonicPage()
@Component({
  selector: 'page-receive-method-select',
  templateUrl: 'receive-method-select.html',
})
export class ReceiveMethodSelectPage {

  private clientID: string = "1";

  constructor(
    private alertCtrl: AlertController,
    private zone: NgZone,
    public navCtrl: NavController, public navParams: NavParams,
    private nfc: NFC, private ndef: Ndef,
    private timelineProvider: TimelineProvider,
    private http: HybridHttpProvider,
    public loadingCtrl: LoadingController,
    public plt: Platform
    ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ReceiveMethodSelectPage');
  }

  public ionViewWillEnter() { 
    // Runs when the page is about to enter and become the active page.

    this.nfcCheck();
  }

  public ionViewWillLeave() {
    // Runs when the page is about to leave and no longer be the active page.

    this.closeNfc();
  }


  private readQR() {
    this.navCtrl.push(QrCodeScannerPage, { callback: (uri:string)=>{
      this.openTimelineGift(uri, "qrcode");
    } });
  }

  private nfcIsSupported = false;
  private nfcIsEnabled = false;
  private nfcSubscriber: Subscription = null;

  private nfcCheck() {
    this.nfc.enabled().then(()=>{
      this.zone.run(()=>{
        document.body.classList.add('nfcSupported');
        this.nfcIsSupported = this.nfcIsEnabled = true;
      });
    }).catch((reason)=>{
      this.zone.run(()=>{
        document.body.classList.add('nfcNotSupported');
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
    if (this.androidNfcAlert != null) {
      this.androidNfcAlert.dismiss();
    }
  }

  private androidNfcAlert = null;
  /**
   * Read a URI from an NFC tag.
   * @param callback Function to pass the URI to (only called if there is a URI, nothing happens if user cancels).
   */
  private readNFC() {
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

      let nfcSessionFn = ()=>{
        console.log("NFC: Session started");

        if (this.nfcSubscriber == null) {
          console.log("Creating nfcSubscriber");
          this.nfcSubscriber = this.nfc.addNdefListener(() => {
            console.log('successfully attached ndef listener');

            if (this.plt.is('android')) {
              this.androidNfcAlert = this.alertCtrl.create({
                title: 'Tap NFC tag now',
                subTitle: 'Tap the back of your device against the NFC tag on your gift.',
                buttons: ['Dismiss']
              });
              this.androidNfcAlert.present();
            }
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
                this.openTimelineGift(str, "nfc");
              } else {
                alert("Not a valid NFC tag.");
              }

            }
            if (this.plt.is('ios')) window['nfc'].invalidateSession();
          });
        } else {
          console.log("nfcSubscriber already exists");
        }
      };

      if (this.plt.is('ios')) {
        window['nfc'].beginSession(nfcSessionFn, ()=>{
          alert("NFC: Unable to start session");
        });
      } else {
        nfcSessionFn();
      }
    }
  }

  public enterArtcodes() {

    let alert = this.alertCtrl.create({
      title: 'Enter the webaddress you were given here:',
      inputs: [
        {
          name: 'message',
          placeholder: 'e.g. https://www.artcodes.co.uk/hg/?hgid=i4892yt'
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
          text: 'Continue',
          handler: data => {
            let trimmedMessage = (data.message as string).trim();
            if (trimmedMessage != "") {
              this.openTimelineGift(trimmedMessage, "artcodes");
            }
          }
        }
      ]
    });
    alert.present();
  }

  public openTimelineGift(uri: string, linkType: string) {
    console.log("openTimelineGift("+uri+","+linkType+")");
    this.showTaskLoadingScreen();
    var timelineFound: Timeline = null;
    // TODO: get timeline id from HG server
    let linkUrl = TimelineEntry.removeHash(uri);
    this.setTaskLoadingScreenMessage("Getting timeline ID...");
    this.http.get("https://www.artcodes.co.uk/wp-admin/admin-ajax.php?action=hg_mirror_get_timeline_id&hgid="+encodeURIComponent(linkUrl)+"&hghash="+encodeURIComponent(""+Math.floor((Math.random() * 1000000) + 1))+"&client_id="+encodeURIComponent(this.clientID)).then((value)=>{
      if (value['code']==200) {
        var body = typeof value['body'] == "string" ? JSON.parse(value['body']) : value['body'];
        if (body.hasOwnProperty("timeline_id")) {
          let timelineID = parseInt(body['timeline_id']);
          console.log("link resolved to timeline id "+timelineID);
          this.setTaskLoadingScreenMessage("Loading timeline...");
          return this.timelineProvider.getTimeline(timelineID);
        } else {
          throw("This link does not appear to be linked to a physical gift.");
        }
      } else {
        throw("Network error. ("+value['code']+")");
      }
    }).then((timeline)=>{
      console.log("Timeline loaded");
      timelineFound = timeline;

      this.setTaskLoadingScreenMessage("Adding to received gifts...");
      return this.timelineProvider.addTimelineToReceivedGifts(timeline);
    }).then(()=>{
      console.log("Timeline added to received gifts");
      let timelineEntry = TimelineEntry.createRevealLinkEntry(timelineFound.getTimelineID(), this.clientID, linkUrl, linkType);

      this.hideTaskLoadingScreen();
      if (linkType=="artcodes") {
        this.navCtrl.push(ReceiveTimelineGiftPage, { "timeline": timelineFound });
      } else {
        this.navCtrl.push(ReceiveTimelineGiftPage, { "timeline": timelineFound, "reveal": timelineEntry });
      }
    }).catch((reason)=>{
      this.hideTaskLoadingScreen();
      console.log("reason");
      alert(reason);
    });

    // TODO: Get timeline from timeline provider
    // TODO: Mark link as revealed
    // TODO: Open view.
  }



  private taskLoadingScreen = null;
  private showTaskLoadingScreen() {
    this.taskLoadingScreen = this.loadingCtrl.create({
      content: '...'
    });
    this.taskLoadingScreen.present();
  }
  private hideTaskLoadingScreen() {
    this.taskLoadingScreen.dismiss();
  }
  private setTaskLoadingScreenMessage(msg: string) {
    this.zone.run(()=>{
      this.taskLoadingScreen.setContent(msg);
    });
  }

}
