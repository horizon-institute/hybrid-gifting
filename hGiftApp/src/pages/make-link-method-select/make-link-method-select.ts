import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the ReceiveMethodSelectPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-make-link-method-select',
  templateUrl: 'make-link-method-select.html',
})
export class MakeLinkMethodSelectPage {

  private callback: (linkType: string, uri: string) => void = null;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.callback = this.navParams.get('callback');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MakeLinkMethodSelectPage');
  }

  private makeLinkQRCode() {
    this.callback("qrcode", "http://www.artcodes.co.uk/hg?linkid="+Date.now());
    this.navCtrl.pop();
  }
  private makeLinkNFCTag() {
    this.callback("nfc", "http://www.artcodes.co.uk/hg?linkid="+Date.now());
    this.navCtrl.pop();
  }
  private makeLinkArtcode() {
    this.callback("artcode", "?code="+"1:1:1:1:2");
    this.navCtrl.pop();
  }
}
