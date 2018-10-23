import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { ReceiveMethodSelectPage } from '../receive-method-select/receive-method-select';
import { MakeGiftPage } from '../make-gift/make-gift';

import { TimelineViewPage } from '../timeline-view/timeline-view';
import { MakeTimelineGiftPage } from '../make-timeline-gift/make-timeline-gift';

import { Timeline } from '../../objects/timeline/timeline';
import { TimelineProvider } from '../../providers/timeline/timeline';

import { ReceiveTimelineGiftPage } from '../receive-timeline-gift/receive-timeline-gift';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  private sent: Timeline[] = [];
  private received: Timeline[] = [];

  constructor(
    public navCtrl: NavController,
    private timelineProvider: TimelineProvider
  ) {
  }


  public ionViewDidLoad() {
    //Runs when the page has loaded. This event only happens once per page 
    // being created. If a page leaves but is cached, then this event will 
    // not fire again on a subsequent viewing. The ionViewDidLoad event is 
    // good place to put your setup code for the page.
    this.timelineProvider.getSentGifts().then((value)=>{ this.sent = value; });
    this.timelineProvider.getReceivedGifts().then((value)=>{ this.received = value; });
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

  private openSentGift(giftData) {
    console.log("openSentGift("+JSON.stringify(giftData)+")");
    this.navCtrl.push(MakeTimelineGiftPage, { "timeline": giftData });
  }

  private openReceiveGift(giftData) {
    console.log("openReceiveGift("+JSON.stringify(giftData)+")");

    this.navCtrl.push(ReceiveTimelineGiftPage, { "timeline": giftData });
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
}
