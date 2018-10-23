import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the MakeGiftPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-make-gift',
  templateUrl: 'make-gift.html',
})
export class MakeGiftPage {

  private usersName: string = "";
  private recipientsName: string = "";

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  private content_data: {}[] = [
    {
      "connection_type": "qrcode", 
      "connection_uri": "https://artcodes.app.com/?", 
      "content_items": [
        {"content_type": "photo", "local_content_uri": "assets/imgs/logo.png"},
        {"content_type": "text", "data": "Hello!"}
      ]
    },
    {
      "connection_type": "nfc", 
      "connection_uri": "https://artcodes.app.com/?", 
      "content_items": []
    },
    {
      "connection_type": "artcode", 
      "connection_uri": "?code=1:1:2:4:4", 
      "content_items": []
    }
  ];

  ionViewDidLoad() {
    console.log('ionViewDidLoad MakeGiftPage');
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
