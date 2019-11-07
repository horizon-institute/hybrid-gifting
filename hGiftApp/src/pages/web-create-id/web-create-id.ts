import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';


import { HybridHttpProvider } from '../../providers/hybrid-http/hybrid-http';
import { GlobalUtils } from '../../objects/global-utils/global-utils';



@IonicPage()
@Component({
  selector: 'page-web-create-id',
  templateUrl: 'web-create-id.html',
})
export class WebCreateIdPage {

  private debug = true;

  private commentForIds: string = "";

  private numberOfIdsToCreate: number = 5;

  private selectedDefaultContent: number = 0;

  private defaultContentArray: {}[] = [
    {"comment": "None", "timeline_id": -10000}
  ];

  private giftURIs: {}[] = null;

  private customDismissFn: (ids: {}[])=>void = null;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private loadingCtrl: LoadingController,
    private http: HybridHttpProvider,
    private alertCtrl: AlertController
  ) {


    this.defaultContentArray = [
      {"comment": "None", "default_content_timeline_id": -10000}
    ].concat(this.navParams.get("defaultContent"));

    this.customDismissFn = this.navParams.get("custom_dismiss_function");

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TimelineViewPage');
  }

  private createIds() {

    let loading = this.loadingCtrl.create({});
    loading.present();
    this.http.get(
      "https://www.artcodes.co.uk/wp-admin/admin-ajax.php?" + 
      "action=hg_mirror_create_new_hg_ids&" + 
      "number_of_ids_to_create="+this.numberOfIdsToCreate + "&" + 
      "comment="+encodeURIComponent(this.commentForIds) + 
      (this.defaultContentArray[this.selectedDefaultContent]['default_content_timeline_id'] < 0 ? ""
        :"&default_content_timeline_id="+encodeURIComponent(this.defaultContentArray[this.selectedDefaultContent]['default_content_timeline_id']))
    ).then((value)=>{
      value = value['body'];

      if ("success" in value && value['success'] && "hgids" in value) {
        this.giftURIs = (value["hgids"] as string[]).map((id)=>{
          return {
            'comment': this.commentForIds,
            'hg_uri': id,
            'default_content_timeline_id': this.defaultContentArray[this.selectedDefaultContent]['timeline_id']
          };
        });
        loading.dismiss();
        this.closeModal();
      } else {
        if ('user_message' in value) {
          throw value['user_message'];
        } else {
          throw "An unknown error occurred";
        }
      }
    }).catch((reason)=>{
      loading.dismiss();
      if (typeof reason == "string") {
        GlobalUtils.simpleAlert(this.alertCtrl, "Error", reason);
      } else {
        GlobalUtils.simpleAlert(this.alertCtrl, "Error", "An unknown error occurred.");
      }
    });

  }

  closeModal() {
    this.navCtrl.pop();
    if (this.customDismissFn != null) this.customDismissFn(this.giftURIs);
  }

}
