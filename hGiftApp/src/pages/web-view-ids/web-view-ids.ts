import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';


import { HybridHttpProvider } from '../../providers/hybrid-http/hybrid-http';
import { GlobalUtils } from '../../objects/global-utils/global-utils';



@IonicPage()
@Component({
  selector: 'page-web-view-ids',
  templateUrl: 'web-view-ids.html',
})
export class WebViewIdsPage {

  private debug = true;

  private giftURIs: {}[] = [];


  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private loadingCtrl: LoadingController,
    private http: HybridHttpProvider,
    private alertCtrl: AlertController
  ) {


    this.giftURIs = this.navParams.get("giftURIs");

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TimelineViewPage');
  }

  public ionViewDidEnter() {
    let ele: HTMLInputElement = document.getElementById('hgids-textarea') as HTMLInputElement;

    ele.value = this.giftURIs.map((id)=>{ return id['hg_uri'] }).join("\n");
  }

  closeModal() {
    this.navCtrl.pop();
  }

}
