import { Component, NgZone } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';

import { ReceiveMethodSelectPage } from '../receive-method-select/receive-method-select';
import { MakeGiftPage } from '../make-gift/make-gift';

import { TimelineViewPage } from '../timeline-view/timeline-view';
import { MakeTimelineGiftPage } from '../make-timeline-gift/make-timeline-gift';

import { Timeline } from '../../objects/timeline/timeline';
import { TimelineEntry } from '../../objects/timeline-entry/timeline-entry';

import { TimelineProvider } from '../../providers/timeline/timeline';

import { ReceiveTimelineGiftPage } from '../receive-timeline-gift/receive-timeline-gift';


import { GlobalUtils } from '../../objects/global-utils/global-utils';
import { HybridHttpProvider } from '../../providers/hybrid-http/hybrid-http';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  private sent: Timeline[] = [];
  private received: Timeline[] = [];

  constructor(
    public navCtrl: NavController,
    private timelineProvider: TimelineProvider,
    public loadingCtrl: LoadingController,
    private http: HybridHttpProvider,
    private zone: NgZone
  ) {
  }

  public ionViewDidLoad() {
    //Runs when the page has loaded. This event only happens once per page 
    // being created. If a page leaves but is cached, then this event will 
    // not fire again on a subsequent viewing. The ionViewDidLoad event is 
    // good place to put your setup code for the page.
    this.timelineProvider.getSentGifts().then((value)=>{ this.sent = value; });
    this.timelineProvider.getReceivedGifts().then((value)=>{ this.received = value; });

    if (GlobalUtils.isWebBuild()) {
      let url = window.location.toString();
      if (url.lastIndexOf("?") >= 0 && url.lastIndexOf("hgid=")) {
        this.zone.run(()=>{
          this.webGiftIsAvailble = true;
        });
      }
    }

  }

  private webGiftIsAvailble = false;
  private webLoadingScreen = null;
  private isWebBuild = GlobalUtils.isWebBuild(); // Can't access directly from html template.
  private loadWebGift() {
    if (GlobalUtils.isWebBuild()) {
      let url = window.location.toString();
      if (url.lastIndexOf("?") >= 0 && url.lastIndexOf("hgid=")) {
        ReceiveMethodSelectPage.OpenTimelineGift(
          url, 
          "", 
          ()=>{if (this.webLoadingScreen==null) this.webLoadingScreen = this.loadingCtrl.create({"content":"Please wait..."}); this.webLoadingScreen.present();}, 
          (msg:string)=>{this.zone.run(()=>{ this.webLoadingScreen.setContent(msg); });},
          ()=>{this.webLoadingScreen.dismiss()},
          this.http,
          this.timelineProvider,
          this.navCtrl,
          "1"
        );
      }
    }
  }
  public ionViewWillEnter() { 
    // Runs when the page is about to enter and become the active page.
  }
  public ionViewDidEnter() {
    // Runs when the page has fully entered and is now the active page. This 
    // event will fire, whether it was the first load or a cached page.
  }
  public ionViewWillLeave() {
    // Runs when the page is about to leave and no longer be the active page.
  }
  public ionViewDidLeave() {
    // Runs when the page has finished leaving and is no longer the active page.
  }
  public ionViewWillUnload() {
    // Runs when the page is about to be destroyed and have its elements removed.
  }


  private sendGift() {
    console.log("sendGift()");

    let timeline = new Timeline(null);

    this.timelineProvider.saveTimeline(timeline).then((value)=>{
      return this.timelineProvider.addTimelineToSentGifts(timeline);
    }).then(()=>{
      this.navCtrl.push(MakeTimelineGiftPage, { "timeline": timeline });
    }).catch((reason)=>{
      alert("There was an error.");
      console.log(reason);
    });

  }
  private receiveGift() {
    console.log("receiveGift()");

    this.navCtrl.push(ReceiveMethodSelectPage);
  }

  private openSentGift(giftData: Timeline) {
    console.log("openSentGift("+JSON.stringify(giftData)+")");
    if (giftData.getTimelineID() < 0) {
      this.navCtrl.push(MakeTimelineGiftPage, { "timeline": giftData });
    } else {
      let loading = this.loadingCtrl.create({content: 'Checking for updates...'});
      loading.present();
      var updatedTimeline = null;
      this.timelineProvider.checkServerForUpdate(giftData).then((timeline)=>{
        updatedTimeline = timeline;
        return this.timelineProvider.saveTimeline(timeline);
      }).then(()=>{
        loading.dismiss();
        this.navCtrl.push(MakeTimelineGiftPage, { "timeline": updatedTimeline });
      }).catch((reason)=>{
        loading.dismiss();
        console.error("Error while attempting to save updated timeline.", reason);
        this.navCtrl.push(MakeTimelineGiftPage, { "timeline": giftData });
      });
    }
  }

  private openReceiveGift(giftData) {
    console.log("openReceiveGift("+JSON.stringify(giftData)+")");

    //this.navCtrl.push(ReceiveTimelineGiftPage, { "timeline": giftData });

    let loading = this.loadingCtrl.create({content: 'Checking for updates...'});
    loading.present();
    var updatedTimeline = null;
    this.timelineProvider.checkServerForUpdate(giftData).then((timeline)=>{
      updatedTimeline = timeline;
      return this.timelineProvider.saveTimeline(timeline)
    }).then(()=>{
      loading.dismiss();
      this.navCtrl.push(ReceiveTimelineGiftPage, { "timeline": updatedTimeline });
    }).catch((reason)=>{
      loading.dismiss();
      console.error("Error while attempting to save updated timeline.", reason);
      this.navCtrl.push(ReceiveTimelineGiftPage, { "timeline": giftData });
    });
  }


  private deleteGift(timeline: Timeline) {
    this.timelineProvider.deleteTimeline(timeline);
  }

  private debugAddGiftToReceived(timeline: Timeline) {
    this.timelineProvider.addTimelineToReceivedGifts(timeline);
  }

  private debugRawTimelineView(timeline: Timeline) {
    this.navCtrl.push(TimelineViewPage);
  }

  private debugDeleteFromSentList(timeline: Timeline) {
    this.timelineProvider.removeTimelineFromSentGifts(timeline);
  }
  private debugDeleteFromReceivedList(timeline: Timeline) {
    this.timelineProvider.removeTimelineFromReceivedGifts(timeline);
  }


  private addTimeline3() {
    console.log("getting timeline 3");
    this.timelineProvider.getTimeline(3).then((timeline)=>{
      console.log("adding timeline 3 to gifts");
      this.timelineProvider.addTimelineToReceivedGifts(timeline).then(()=>{
        console.log("added");
      }).catch((reason)=>{
        console.log("not added");
        console.log(reason);
      })
    }).catch((reason)=>{
      console.log("could not get timeline 3");
      console.log(reason);
    });
  }

  private testUploadTimeline() {
    var shortDesc = prompt("shortDesc:", "");
    var longDesc = prompt("longDesc:", "");
    let timeline = new Timeline(null);
    timeline.setDescriptions(shortDesc, longDesc);
    this.timelineProvider.publishTimeline(timeline, []).then((value)=>{
      console.log("publishTimeline then");
      console.log(value);
    }).catch((reason)=>{
      console.log("publishTimeline catch");
      console.log(reason);
    });
  }
  private testUploadTimelineEntry() {
    var id = parseInt(prompt("timeline id:", "4"));
    var text = prompt("Enter message:", "");
    let timelineEntry = TimelineEntry.createTextEntry(id, "", "http://www.artcodes.co.uk/hg/?hgid=test1", text);
    this.timelineProvider.publishTimelineEntry(timelineEntry, null).then((value)=>{
      console.log("publishTimelineEntry then");
      console.log(value);
    }).catch((reason)=>{
      console.log("publishTimelineEntry catch");
      console.log(reason);
    });
  }


  

}
