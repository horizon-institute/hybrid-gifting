import { Component, NgZone, wtfStartTimeRange } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ModalController, AlertController } from 'ionic-angular';

import { Base64 } from 'js-base64';

import { Timeline } from '../../objects/timeline/timeline';
import { TimelineEntry } from '../../objects/timeline-entry/timeline-entry';
import { TimelineEntryId } from '../../objects/timeline-entry-id/timeline-entry-id';


import { TimelineProvider } from '../../providers/timeline/timeline';
import { WebCreateIdPage } from '../web-create-id/web-create-id';

import { HybridHttpProvider } from '../../providers/hybrid-http/hybrid-http';
import { WebViewIdsPage } from '../web-view-ids/web-view-ids';
import { GlobalUtils } from '../../objects/global-utils/global-utils';
import { WebMakeDefaultContentPage } from '../web-make-default-content/web-make-default-content';
import { _appIdRandomProviderFactory } from '@angular/core/src/application_tokens';

declare var debug1;

@IonicPage()
@Component({
  selector: 'page-web-vendor-home',
  templateUrl: 'web-vendor-home.html',
})
export class WebVendorHomePage {

  private debug = false;

  private loadingStatus: string = ""; // "loading" or "loggedin", "loggedout", "error"
  private errorMessage: string = "";

  private defaultContent: {}[] = [];

  private giftURIs: {}[] = [];
  private giftURIGroups: {} = {};

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    public modalCtrl: ModalController,
    private http: HybridHttpProvider,
    private zone: NgZone,
    private timelineProvider: TimelineProvider
  ) {

  }

  private loadUserObjects() {
    if (this.debug) {

      this.setLoadingStatus("loading");
      this.defaultContent = [
        {"comment":"test1","default_content_timeline_id":"270","date_created":"2019-10-31 17:57:35"},
        {"comment":"test2","default_content_timeline_id":"271","date_created":"2019-10-31 17:58:38"},
        {"comment":"test3","default_content_timeline_id":"272","date_created":"2019-11-01 01:35:11"}
      ].sort((a, b) => {
        return (a['date_created'] > b['date_created'] ? -1 : 
          (a['date_created'] == b['date_created'] ? 0 : 1));
      });

      this.giftURIs = [
        {"comment":"test","in_use":false,"hg_uri":"https:\/\/www.artcodes.co.uk\/hg\/?hgid=99fec17b-c13a-42cf-91fa-3142f9e53136","salt":"1377406","default_content_timeline_id":null,"date_created":"2019-09-13 15:37:02"},
        {"comment":"test","in_use":false,"hg_uri":"https:\/\/www.artcodes.co.uk\/hg\/?hgid=d2124fb6-b3f2-4e3e-bd6f-5626c8e66ad8","salt":"1670413","default_content_timeline_id":null,"date_created":"2019-09-13 15:37:02"},
        {"comment":"test","in_use":false,"hg_uri":"https:\/\/www.artcodes.co.uk\/hg\/?hgid=1781fd8e-d461-4ed5-962c-886159469b86","salt":"1818549","default_content_timeline_id":null,"date_created":"2019-09-13 15:37:02"},
        {"comment":"test","in_use":false,"hg_uri":"https:\/\/www.artcodes.co.uk\/hg\/?hgid=74c3f39c-d8eb-4f68-ae26-8042ba0f4871","salt":"1069957","default_content_timeline_id":null,"date_created":"2019-09-13 15:37:02"},
        {"comment":"test","in_use":false,"hg_uri":"https:\/\/www.artcodes.co.uk\/hg\/?hgid=024cc2e3-31c9-41a6-b4bf-f628622bf64d","salt":"1985864","default_content_timeline_id":null,"date_created":"2019-09-13 15:37:02"},
        {"comment":"test2","in_use":false,"hg_uri":"https:\/\/www.artcodes.co.uk\/hg\/?hgid=04161428-91c1-4b74-a528-ab31e6fad9ca","salt":"1801445","default_content_timeline_id":null,"date_created":"2019-11-01 00:27:24"},
        {"comment":"test2","in_use":false,"hg_uri":"https:\/\/www.artcodes.co.uk\/hg\/?hgid=6ac35dbf-0188-4aef-8efe-aacd7d3603db","salt":"1279966","default_content_timeline_id":null,"date_created":"2019-11-01 00:27:24"},
        {"comment":"test2","in_use":false,"hg_uri":"https:\/\/www.artcodes.co.uk\/hg\/?hgid=74a7cb6c-1419-46ad-903a-e932debe14d1","salt":"1899287","default_content_timeline_id":null,"date_created":"2019-11-01 00:27:24"},
        {"comment":"test2","in_use":false,"hg_uri":"https:\/\/www.artcodes.co.uk\/hg\/?hgid=3f047ecb-c8f5-45fa-b4f8-991221225702","salt":"1450434","default_content_timeline_id":null,"date_created":"2019-11-01 00:27:24"},
        {"comment":"test3","in_use":false,"hg_uri":"https:\/\/www.artcodes.co.uk\/hg\/?hgid=e79216da-3030-47d0-bd55-ed96c71a0dc6","salt":"1068355","default_content_timeline_id":null,"date_created":"2019-11-01 00:33:19"},
        {"comment":"test3","in_use":false,"hg_uri":"https:\/\/www.artcodes.co.uk\/hg\/?hgid=9f41d3a7-b25d-4015-817e-331580cf91e8","salt":"1826395","default_content_timeline_id":null,"date_created":"2019-11-01 00:33:19"},
        {"comment":"test3","in_use":false,"hg_uri":"https:\/\/www.artcodes.co.uk\/hg\/?hgid=eee5b340-0d91-4eee-a7a0-cf99410954e3","salt":"1901197","default_content_timeline_id":null,"date_created":"2019-11-01 00:33:19"},
        {"comment":"test3","in_use":false,"hg_uri":"https:\/\/www.artcodes.co.uk\/hg\/?hgid=c542fa52-3ed3-4804-bc2a-4f3694c4434f","salt":"1879016","default_content_timeline_id":null,"date_created":"2019-11-01 00:33:19"},
        {"comment":"test3","in_use":false,"hg_uri":"https:\/\/www.artcodes.co.uk\/hg\/?hgid=1596aa08-bd18-4fe6-92cc-7310e5d3c273","salt":"1067518","default_content_timeline_id":null,"date_created":"2019-11-01 00:33:19"},
        {"comment":"test3","in_use":false,"hg_uri":"https:\/\/www.artcodes.co.uk\/hg\/?hgid=06a55093-a6d7-407b-8e68-fedbb736e3dd","salt":"1950178","default_content_timeline_id":null,"date_created":"2019-11-01 00:33:19"},
        {"comment":"test4defaultcontenttimelineidundefined","in_use":false,"hg_uri":"https:\/\/www.artcodes.co.uk\/hg\/?hgid=935c1ef7-a22a-47f2-9fa6-aac73b9425a8","salt":"1311943","default_content_timeline_id":null,"date_created":"2019-11-01 00:41:08"},
        {"comment":"test4defaultcontenttimelineidundefined","in_use":false,"hg_uri":"https:\/\/www.artcodes.co.uk\/hg\/?hgid=53af1360-415b-46e6-901a-0e99a1c627f1","salt":"1294287","default_content_timeline_id":null,"date_created":"2019-11-01 00:41:08"},
        {"comment":"test5defaultcontenttimelineidundefined","in_use":false,"hg_uri":"https:\/\/www.artcodes.co.uk\/hg\/?hgid=5d5bd2ce-ef08-4c13-8c27-7367f9b2ddce","salt":"1831305","default_content_timeline_id":null,"date_created":"2019-11-01 00:51:54"},
        {"comment":"test5defaultcontenttimelineidundefined","in_use":false,"hg_uri":"https:\/\/www.artcodes.co.uk\/hg\/?hgid=71dba00f-b296-413f-b3f1-99b914168233","salt":"1283413","default_content_timeline_id":null,"date_created":"2019-11-01 00:51:54"},
        {"comment":"test6","in_use":false,"hg_uri":"https:\/\/www.artcodes.co.uk\/hg\/?hgid=90176f13-5204-4ef0-80f6-490a84dfd30d","salt":"1901144","default_content_timeline_id":"270","date_created":"2019-11-01 01:01:25"},
        {"comment":"test6","in_use":false,"hg_uri":"https:\/\/www.artcodes.co.uk\/hg\/?hgid=60f0b5b1-af10-417c-8736-8c674a844f47","salt":"1402880","default_content_timeline_id":"270","date_created":"2019-11-01 01:01:25"},
        {"comment":"test6","in_use":false,"hg_uri":"https:\/\/www.artcodes.co.uk\/hg\/?hgid=6052f0a8-6c83-4749-9da5-8de074ea9355","salt":"1606716","default_content_timeline_id":"270","date_created":"2019-11-01 01:01:25"},
        {"comment":"test6","in_use":false,"hg_uri":"https:\/\/www.artcodes.co.uk\/hg\/?hgid=cefb139d-3135-4c81-a321-df4b415b8687","salt":"1438942","default_content_timeline_id":"270","date_created":"2019-11-01 01:01:25"},
        {"comment":"test6","in_use":false,"hg_uri":"https:\/\/www.artcodes.co.uk\/hg\/?hgid=f79a5521-5123-4254-888c-625c66ed5709","salt":"1764735","default_content_timeline_id":"270","date_created":"2019-11-01 01:01:25"}
      ];

      this.processGiftURIGroups();
      this.setLoadingStatus("loggedin");


    } else {
      this.setLoadingStatus("loading");
      this.http.get("https://www.artcodes.co.uk/wp-admin/admin-ajax.php?action=hg_mirror_default_timelines_by_current_user").then((value)=>{
        value = value['body'];

        if ("success" in value && value['success'] && "timelines" in value) {
          this.defaultContent = (value["timelines"] as {}[]).sort((a, b) => {
            return (a['date_created'] > b['date_created'] ? -1 : 
              (a['date_created'] == b['date_created'] ? 0 : 1));
          });
          return this.http.get("https://www.artcodes.co.uk/wp-admin/admin-ajax.php?action=hg_mirror_hg_ids_created_by_current_user");
        } else if ("user_is_logged_in" in value && value['user_is_logged_in']==false) {
          console.log("user is not logged in");
          throw 'loggedout';
        } else {
          if ('user_message' in value) {
            throw value['user_message'];
          } else {
            throw "An unknown error occurred";
          }
        }

      }).then((value)=>{
        value = value['body'];
        if ("success" in value && value['success'] && "hgids" in value) {
          this.giftURIs = value["hgids"];
          this.processGiftURIGroups();
          this.setLoadingStatus("loggedin");
        } else if ("user_is_logged_in" in value && value['user_is_logged_in']==false) {
          throw 'loggedout';
        } else {
          if ('user_message' in value) {
            throw value['user_message'];
          } else {
            throw "An unknown error occurred";
          }
        }

      }).catch((reason)=>{
        if (typeof reason == "string") {
          if (reason == 'loggedout') {
            this.setLoadingStatus("loggedout");
          } else {
            this.errorMessage = reason;
            this.setLoadingStatus("error");
          }
        } else {
          console.log(reason);
          this.errorMessage = "An unknown error occurred.";
          this.setLoadingStatus("error");
        }
      });

    }

  }

  private processGiftURIGroups() {
    var giftURIGroups = {};

    for (var i=0; i<this.giftURIs.length; ++i) {
      var key = this.giftURIs[i]['date_created'] + this.giftURIs[i]['comment'];
      if (key in giftURIGroups) {
        giftURIGroups[key].push(this.giftURIs[i]);
      } else {
        giftURIGroups[key] = [this.giftURIs[i]];
      }
    }

    this.zone.run(()=>{
      this.giftURIGroups = giftURIGroups;
    });
  }

  private setLoadingStatus(status: string) {
    this.zone.run(()=>{
      this.loadingStatus = status;
    });
  }

  public ionViewDidEnter() {
    // Runs when the page has fully entered and is now the active page. This
    // event will fire, whether it was the first load or a cached page.

    console.log('ionViewDidLoad WebVendorHomePage');
    this.loadUserObjects();
  }

  public ionViewDidLoad() {
    console.log('ionViewDidLoad WebVendorHomePage');
  }

  private createNewIds() {
    let createIdsModal = this.modalCtrl.create(WebCreateIdPage, { 
      'defaultContent': this.defaultContent,
      'custom_dismiss_function': (ids: {}[])=>{ 
        if (ids != null) {
          this.loadUserObjects();
          let viewIdsModal = this.modalCtrl.create(WebViewIdsPage, {
            'giftURIs': ids
          }); 
          viewIdsModal.present();
        }
      }
    });
    createIdsModal.present();
  }

  private giftUriGroupsList() {
    return Object.keys(this.giftURIGroups).map((k)=>{return {
      'comment': this.giftURIGroups[k][0]['comment'],
      'size': this.giftURIGroups[k].length,
      'default_content_timeline_id': this.giftURIGroups[k][0]['default_content_timeline_id'],
      'date_created': this.giftURIGroups[k][0]['date_created'],
      'key': k
    };}).sort((a, b) => {
      return (a['date_created'] > b['date_created'] ? -1 : 
        (a['date_created'] == b['date_created'] ? 0 : 1));
    });
  }

  private viewGiftIdGroupWithKey(key) {
    let viewIdsModal = this.modalCtrl.create(WebViewIdsPage, {
      'giftURIs': this.giftURIGroups[key]
    }); 
    viewIdsModal.present();
  }

  private getDefaultContentCommentFromTimelineID(timelineId): string {
    for (var i=0; i<this.defaultContent.length; ++i) {
      if (this.defaultContent[i]['default_content_timeline_id'] == timelineId) {
        return this.defaultContent[i]['comment'];
      }
    }
    return "";
  }

  private createNewDefaultTimeline() {

    const prompt = this.alertCtrl.create({
      title: 'New Default Content',
      message: "Enter a name or comment to help you remember what this new Default Content is for. Only you will see this.",
      inputs: [
        {
          name: 'comment',
          placeholder: 'Name/comment'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Continue',
          handler: data => {
            let comment = data['comment'];

            GlobalUtils.simpleLoadingShow(this.loadingCtrl, "Please wait...");
            this.http.get("https://www.artcodes.co.uk/wp-admin/admin-ajax.php?action=hg_mirror_create_new_default_content&comment="+encodeURIComponent(comment)).then((value)=>{
              value = value['body']; // e.g. {"success":true,"default_content_timeline_id":272}

              if ("success" in value && value['success'] && "default_content_timeline_id" in value) {
                let default_content_timeline_id = value["default_content_timeline_id"];

                let timeline = new Timeline({
                  "status": "remote",
                  "id": default_content_timeline_id,
                  "shortDescription": "",
                  "longDescription": "",
                  "entries": []
                });

                this.timelineProvider.saveTimeline(timeline).then(()=>{
                  this.openDefaultContent(default_content_timeline_id);
                  GlobalUtils.simpleLoadingDismiss();
                }).catch(()=>{
                  GlobalUtils.simpleLoadingDismiss();
                  GlobalUtils.simpleAlert(this.alertCtrl, "Error", "There was a problem saving the new Default Content");
                });

              } else if ("user_is_logged_in" in value && value['user_is_logged_in']==false) {
                this.setLoadingStatus("loggedout");
                GlobalUtils.simpleLoadingDismiss();
              } else {
                if ('user_message' in value) {
                  throw value['user_message'];
                } else {
                  throw "An unknown error occurred";
                }
              }
            }).catch((reason)=>{
              GlobalUtils.simpleLoadingDismiss();
              if (typeof reason == "string") {
                GlobalUtils.simpleAlert(this.alertCtrl, "Error", reason);
              } else {
                GlobalUtils.simpleAlert(this.alertCtrl, "Error", "An unknown error occurred.");
              }
            });
          }
        }
      ]
    });
    prompt.present();


  }

  private openDefaultContent(timelineId: number) {
    GlobalUtils.simpleLoadingShow(this.loadingCtrl, "Please wait...");
    this.timelineProvider.getTimeline(timelineId, true).then((timeline: Timeline)=>{
      GlobalUtils.simpleLoadingDismiss();

      this.navCtrl.push(WebMakeDefaultContentPage, {
        "timeline": timeline
      });

    }).catch((reason)=>{
      GlobalUtils.simpleLoadingDismiss();
      GlobalUtils.simpleAlert(this.alertCtrl, "Error", "There was a problem loading this Default Content.");
    });

  }

  private login() {
    window.location.href = "https://www.artcodes.co.uk/wp-login.php?redirect_to=index.php";
  }

}
