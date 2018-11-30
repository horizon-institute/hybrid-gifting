import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { TimelineEntry } from '../../objects/timeline-entry/timeline-entry';
import { TimelineProvider } from '../../providers/timeline/timeline';


@IonicPage()
@Component({
  selector: 'page-image-entry-view',
  templateUrl: 'image-entry-view.html',
})
export class ImageEntryViewPage {

  private contentEntry: TimelineEntry;
  private viewportBackup: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, private timelineProvider: TimelineProvider) {
    this.contentEntry = this.navParams.get("entry");
  }

  public ionViewDidLoad() {
    //Runs when the page has loaded. This event only happens once per page 
    // being created. If a page leaves but is cached, then this event will 
    // not fire again on a subsequent viewing. The ionViewDidLoad event is 
    // good place to put your setup code for the page.
  }
  public ionViewWillEnter() { 
    // Runs when the page is about to enter and become the active page.
  }
  public ionViewDidEnter() {
    // Runs when the page has fully entered and is now the active page. This 
    // event will fire, whether it was the first load or a cached page.

    let viewport = this.getViewportEle();
    if (viewport != null) {
      this.viewportBackup = viewport.getAttribute("content");
      viewport.setAttribute("content", "width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=10.0, user-scalable=yes");
    }
  }
  public ionViewWillLeave() {
    // Runs when the page is about to leave and no longer be the active page.
    let viewport = this.getViewportEle();
    if (viewport != null) {
      viewport.setAttribute("content", this.viewportBackup);
      window.scrollTo(0,0);
    }
  }
  public ionViewDidLeave() {
    // Runs when the page has finished leaving and is no longer the active page.
  }
  public ionViewWillUnload() {
    // Runs when the page is about to be destroyed and have its elements removed.
  }

  private getViewportEle() {
    let metaEles = document.querySelectorAll('meta');
    for (var i=0; i<metaEles.length; ++i) {
      let metaEle = metaEles[i];
      if (metaEle.hasAttribute("name") && metaEle.getAttribute("name")=="viewport" && metaEle.hasAttribute("content")) {
        return metaEle;
      }
    }
    return null;
  }

  private back() { this.navCtrl.pop() }

  public static open(navCtrl: NavController, contentEntry: TimelineEntry) {
    navCtrl.push(ImageEntryViewPage, { "entry": contentEntry });
  }


}
