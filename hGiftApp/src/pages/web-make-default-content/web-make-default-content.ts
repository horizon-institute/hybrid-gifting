import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, Platform } from 'ionic-angular';

import { ImagePicker } from '@ionic-native/image-picker';

import { Base64 } from 'js-base64';

import { Timeline } from '../../objects/timeline/timeline';
import { TimelineEntry } from '../../objects/timeline-entry/timeline-entry';
import { TimelineEntryId } from '../../objects/timeline-entry-id/timeline-entry-id';

import { TimelineProvider } from '../../providers/timeline/timeline';

import { MakeLinkMethodSelectPage } from '../make-link-method-select/make-link-method-select';

import { HybridHttpProvider } from '../../providers/hybrid-http/hybrid-http';

import { UserIdProvider } from '../../providers/user-id/user-id';

import { InAppBrowser } from '@ionic-native/in-app-browser';

import { GiftNamesProvider } from '../../providers/gift-names/gift-names';
import { GlobalUtils } from '../../objects/global-utils/global-utils';

@IonicPage()
@Component({
  selector: 'web-make-default-content',
  templateUrl: 'web-make-default-content.html',
})
export class WebMakeDefaultContentPage {

  private timeline: Timeline;
  private timelineEntries: TimelineEntry[] = [];

  private clientID: string = "1";

  private giftMemorableName: string = "";

  private addLinkCount: number = 0; // UI use only
  private addContentCount: number = 0; // UI use only

  private containsUnpublishedData = false;

  private shouldAddDefaultContent = false;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private zone: NgZone,
    private timelineProvider: TimelineProvider,
    private imagePicker: ImagePicker,
    private http: HybridHttpProvider,
    public loadingCtrl: LoadingController,
    private userIdProvider: UserIdProvider,
    private iab: InAppBrowser,
    public plt: Platform,
    private giftNamesProvider: GiftNamesProvider
  ) {
    console.log('Debug: Platform(s): '+this.plt.platforms().join(', '));

    userIdProvider.getUserId().then((userId)=>{ this.clientID = userId});

    this.timeline = this.navParams.get("timeline");


    let ids: TimelineEntryId[] = [];
    for (var i=0; i<this.timeline.getNumberOfEntries(); ++i) {
      ids.push(this.timeline.getEntryId(i));
    }

    console.log(ids.length + " IDs");
    console.log(ids);


    Promise.all(ids.map((id)=>{return this.timelineProvider.getTimelineEntry(id)})).then((timelineEntries)=>{
      console.log("loaded "+timelineEntries.length + " entries from "+ids.length+" IDs");

      timelineEntries = timelineEntries.sort((a, b)=>{
        return (new Date(a.getCreatedAt()).getTime()) - (new Date(b.getCreatedAt()).getTime());
      });

      this.timelineEntries = timelineEntries;

      this.zone.run(()=>{
        for (var i=0; i<this.timelineEntries.length; ++i) {
          let entry = this.timelineEntries[i];
          if (entry.getId().isLocal()) {
            this.containsUnpublishedData = true;
          }
          if (entry.isLink()) {
            ++this.addLinkCount;
          }
          if (!entry.isLink() && !entry.isReveal() && !entry.isThankYouNote()) {
            ++this.addContentCount;
          }
        }
      });
    }).catch((reason)=>{
      alert("There was an error. (1)");
      console.log(reason);
    });

    let debug = false;
    if (debug) {
      this.timeline = new Timeline({
        "status": "local",
        "id": 1000,
        "shortDescription": "",
        "longDescription": "",
        "entries": [
          { "id": 1, "createdAt": ""},
          { "id": 2, "createdAt": ""}
        ]
      });

      this.timelineEntries = [
      ];
    }

  }


  public ionViewWillEnter() {
    // Runs when the page is about to enter and become the active page.
    this.giftNamesProvider.getGiftName(this.timeline.getTimelineID()).then((giftName)=>{
      this.zone.run(()=>{
        this.giftMemorableName = giftName;
      });
    });
  }
  public ionViewWillLeave() {
    // Runs when the page is about to leave and no longer be the active page.
    this.giftNamesProvider.setGiftName(this.timeline.getTimelineID(), this.giftMemorableName).then(()=>{
      console.log("Memorable gift name saved.");
    }).catch((reason)=>{
      console.error("Failed to save memorable gift name.");
    });

    if (GlobalUtils.isWebBuild()) {
      this.removeAnyPreviousCordovaCameraSelectElement();
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TimelineViewPage');
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

  private addedManufactureContent = false;
  private addLink() {
    this.navCtrl.push(MakeLinkMethodSelectPage, {"callback": (linkType:string, uri:string)=>{
      let entry = TimelineEntry.createLinkEntry(this.timeline.getTimelineID(), this.clientID, uri, linkType);
      this.timelineProvider.addSaveTimelineEntry(this.timeline, entry).then((value)=>{
        this.zone.run(()=>{
          ++this.addLinkCount;
          this.timelineEntries.push(
            entry
          );
        });
        if (this.shouldAddDefaultContent && !this.addedManufactureContent) {
          this.addedManufactureContent = true;
          this.pushContentEntry(TimelineEntry.createUrlEntry(this.timeline.getTimelineID(), this.clientID, entry.getMetadata(TimelineEntry.METADATA_KEY_LINK_URI), "https://debbiebryan.co.uk/artcodes/", "Debbie Bryan"));
        }
      }).catch((reason)=>{
        alert("There was a problem.");
        console.log(reason);
      });
    }});
  }

  private removeLink(linkUri: string) {
    this.zone.run(()=>{
      var promises = [];
      for (var i=0; i<this.timelineEntries.length; ++i) {
        if (this.timelineEntries[i].getMetadata("hg_link_uri") == linkUri) {
          promises.push(this.timelineProvider.deleteTimelineEntry(this.timelineEntries[i]));
          this.timeline.removeLocalEntry(this.timelineEntries[i].getId());
          this.timelineEntries.splice(i, 1);
          --i;
        }
      }
      Promise.all(promises).then(()=>{}).catch((reason)=>{ console.log("Error deleting many timeline entries: "+JSON.stringify(reason)); });
      this.timelineProvider.saveTimeline(this.timeline).then(()=>{}).catch((reason)=>{ console.log("Error saving updated timeline: "+JSON.stringify(reason)); });
    });
  }

  private debugPlaceholderImageCount=0;
  private addContent(link: string, contentType: string) {
    if (contentType == "image") {

      if (GlobalUtils.isWebBuild()) {
        this.removeAnyPreviousCordovaCameraSelectElement();
      }
      eval('navigator.camera').getPicture((imageData)=>{
        this.zone.run(()=>{
          ++this.addContentCount;
          this.pushContentEntry(
            TimelineEntry.createImageEntry(
              this.timeline.getTimelineID(), 
              this.clientID, 
              link, 
              "data:image/jpeg;base64,"+imageData,
              "image/jpeg"
            )
          );
          //console.log({"imagedata":"data:image/jpeg;base64,"+imageData});
        })
      }, ()=>{/*errorCallback*/}, {
        'sourceType':0,
        'destinationType':0,
        'targetWidth': 800,
        'targetHeight': 800
      });

      if (GlobalUtils.isWebBuild()) {
        this.autoClickCordovaCameraSelectElement();
      }

    } else if (contentType == "text") {


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
                  ++this.addContentCount;
                  this.pushContentEntry(
                    TimelineEntry.createTextEntry(this.timeline.getTimelineID(), this.clientID, link, trimmedMessage)
                  );
                });
              }
            }
          }
        ]
      });
      alert.present();
    } else if (contentType == "url") {


      let alert = this.alertCtrl.create({
        title: 'Add a web link',
        inputs: [
          {
            name: 'title',
            placeholder: 'Title'
          },
          {
            name: 'url',
            placeholder: 'web address e.g. www.google.com'
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
              let trimmedTitle= (data.title as string).trim();
              let trimmedUrl= (data.url as string).trim();
              if (trimmedUrl != "") {
                this.zone.run(()=>{
                  ++this.addContentCount;
                  this.pushContentEntry(
                    TimelineEntry.createUrlEntry(this.timeline.getTimelineID(), this.clientID, link, trimmedUrl, trimmedTitle)
                  );
                });
              }
            }
          }
        ]
      });
      alert.present();
    }
  }

  /** 
   * When built as a website the cordova-plugin-camera adds an input element to the body.
   * We use this function to auto click it, when it becomes available (it's also hidden in the css).
   */
  private autoClickCordovaCameraSelectElement() {
    let inputElement: HTMLInputElement = document.querySelector('.cordova-camera-select') as HTMLInputElement;
    if (inputElement != null) {
      inputElement.click();
    } else {
      setTimeout(()=>{ this.autoClickCordovaCameraSelectElement() }, 100);
    }
  }

  /**
   * This function removes elements added by cordova-plugin-camera.
   * Use this before calling getPicture as if the user clicks cancel 
   * the old element is left there with the old click handler.
   */
  private removeAnyPreviousCordovaCameraSelectElement() {
    let elesToRemove = document.querySelectorAll('.cordova-camera-select');
    for (var i=0; i<elesToRemove.length; ++i) {elesToRemove[i].remove();}
  }

  private pushContentEntry(entry: TimelineEntry) {
    this.timelineProvider.addSaveTimelineEntry(this.timeline, entry).then(()=>{
      console.log("Adding entry to timelineEntries / containsUnpublishedData = true...");
      this.zone.run(()=>{
        this.timelineEntries.push(entry);
        this.containsUnpublishedData =true;
      });
    }).catch((reason)=>{
      console.log("Error adding content to timeline: "+JSON.stringify(reason));
    });
  }

  private removeContent(id: TimelineEntryId) {
    this.zone.run(()=>{
      for (var i=0; i<this.timelineEntries.length; ++i) {
        if (this.timelineEntries[i].getId().getID() == id.getID()) {
          this.timelineEntries.splice(i, 1);
          break;
        }
      }
    });

    this.timelineProvider.getTimelineEntry(id).then((entry)=>{
      return this.timelineProvider.removeSaveTimelineEntry(this.timeline, entry);
    }).catch((reason)=>{
      console.log("Error saving updated timeline: "+JSON.stringify(reason));
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

  private tasks = [];
  private taskIndex = -1;
  private taskLoadingScreen = null;
  private showTaskLoadingScreen() {
    this.taskLoadingScreen = this.loadingCtrl.create({
      content: 'Uploading your content...'
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
  private nextTask() {
    ++this.taskIndex;
    if (this.taskIndex < this.tasks.length) {
      console.log("Running task "+(this.taskIndex+1)+"/"+this.tasks.length+"...");
      this.setTaskLoadingScreenMessage("Uploading your content... ("+(this.taskIndex+1)+"/"+this.tasks.length+")");
      this.tasks[this.taskIndex]();
    } else {
      this.tasksFinished();
    }
  }
  private tasksFinished() {
    this.hideTaskLoadingScreen();
    console.log("Tasks finished.");
    //alert("Content successfully uploaded!");
    let alertBox = this.alertCtrl.create({
      title: 'Content successfully uploaded',
      subTitle: "Your gift is ready to go and can be sent to it's recipient!",
      buttons: ['Dismiss']
    });
    alertBox.present();
    this.clearTasks();

    this.timeline.regenerateEntries();
    this.timelineProvider.saveTimeline(this.timeline).catch((reason)=>{
      console.log("Error in saving updated timeline after publish opterations.");
    });
  }
  private tasksError(error) {
    this.hideTaskLoadingScreen();
    console.log("Task error:");
    console.error(error);
    //alert("There was an error uploading your content.");
    let alertBox = this.alertCtrl.create({
      title: 'There was an error uploading your content',
      message: 'Would you like to retry?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            this.clearTasks();
          }
        },
        {
          text: 'Retry',
          handler: () => {
            this.showTaskLoadingScreen();
            this.taskIndex -= 1;
            this.nextTask();
          }
        }
      ]
    });
    alertBox.present();
  }
  private clearTasks() {
    this.tasks = [];
    this.taskIndex = -1;
  }
  private publish() {
    console.log("Generating tasks...");
    this.showTaskLoadingScreen();
    this.setTaskLoadingScreenMessage("Generating tasks...");

    if (this.timeline.getTimelineID() < 0) {
      // Publish timeline object
      console.log(" - Publish timeline task...");
      this.tasks.push(()=>{
        console.log("TASK: Publishing timeline...");
        let oldTimelineID =this.timeline.getTimelineID();
        this.timelineProvider.publishTimeline(this.timeline, this.timelineEntries).then(()=>{
          console.log("TASK: ...timeline id: "+this.timeline.getTimelineID());

          this.giftNamesProvider.switchGiftName(oldTimelineID, this.timeline.getTimelineID());

          // double check entries have the right id
          for (var i=0; i<this.timelineEntries.length; ++i) {
            let entry = this.timelineEntries[i];
            entry.getId().setPublishedTimelineID(this.timeline.getTimelineID());
          }

          this.nextTask();
        }).catch((reason)=>{
          this.tasksError(reason);
        });
      });
    }

    // gather uris to associate with this timeline
    var registeredUris = new Set();
    var unregisteredUris = new Set();
    for (var i=0; i<this.timelineEntries.length; ++i) {
      let entry = this.timelineEntries[i];
      if (entry.isLink() && !entry.isArtcode()) {
        if (entry.getId().isLocal()) {
          unregisteredUris.add(entry.getMetadata(TimelineEntry.METADATA_KEY_LINK_URI));
        } else {
          registeredUris.add(entry.getMetadata(TimelineEntry.METADATA_KEY_LINK_URI));
        }
      }
    }

    // check they are available
    unregisteredUris.forEach((unregisteredUri)=>{
      console.log(" - register uri task...");
      this.tasks.push(()=>{
        console.log("TASK: Checking if uri is registered... ("+unregisteredUri+")");
        this.http.get("https://www.artcodes.co.uk/wp-admin/admin-ajax.php?action=hg_mirror_check_use&hgid="+encodeURIComponent(unregisteredUri)+"&hghash="+encodeURIComponent(""+Math.floor((Math.random() * 1000000) + 1))+"&client_id="+encodeURIComponent(this.clientID)).then((value)=>{
          if (value['code']==200) {
            var body = typeof value['body'] == "string" ? JSON.parse(value['body']) : value['body'];
            if (body.hasOwnProperty("not_in_use")) {
              console.log("TASK: registering ["+unregisteredUri+"] for timeline "+this.timeline.getTimelineID());
              this.http.get("https://www.artcodes.co.uk/wp-admin/admin-ajax.php?action=hg_mirror_reserve_uri&timeline_id="+encodeURIComponent(""+this.timeline.getTimelineID())+"&hgid="+encodeURIComponent(unregisteredUri)+"&hghash="+encodeURIComponent(""+Math.floor((Math.random() * 1000000) + 1))+"&client_id="+encodeURIComponent(this.clientID)).then((value)=>{
                if (value['code']==200) {
                  var body = typeof value['body'] == "string" ? JSON.parse(value['body']) : value['body'];
                  if (body.hasOwnProperty("reserved")) {
                    this.nextTask();
                  } else {
                    this.tasksError("Error: link "+unregisteredUri+" is in use by another gift! (2ASSINGING)");
                  }
                } else {
                  this.tasksError("Network error.");
                }
              }).catch((reason)=>{this.tasksError(reason);});
            } else {
              this.tasksError("Error: link "+unregisteredUri+" is in use by another gift! (1CHECKING)");
            }
          } else {
            this.tasksError("Network error.");
          }
        }).catch((reason)=>{
          this.tasksError(reason);
        });
      });
    });

    // if timeline uses artcodes register for artcode uri
    for (var i=0; i<this.timelineEntries.length; ++i) {
      let entry = this.timelineEntries[i];
      if (entry.isLink() && entry.isArtcode() && entry.getId().isLocal()) {
        console.log(" - register artcode uri task...");
        this.tasks.push(()=>{
          console.log("TASK: registering artcode uri...");
          this.http.get("https://www.artcodes.co.uk/wp-admin/admin-ajax.php?action=hg_mirror_make_artcode_link&timeline_id="+encodeURIComponent(""+this.timeline.getTimelineID())+"&client_id="+encodeURIComponent(this.clientID)).then((value)=>{
            var body = typeof value['body'] == "string" ? JSON.parse(value['body']) : value['body'];
            if (value['code']==200) {
              var body = typeof value['body'] == "string" ? JSON.parse(value['body']) : value['body'];
              if (body.hasOwnProperty("hgid")) {
                console.log("TASK: ...registered artcode uri ["+body['hgid']+"] for timeline "+this.timeline.getTimelineID());
                this.zone.run(()=>{
                  this.timeline.addArtcodesShareUrl(body['hgid']);
                });

                this.nextTask();
              } else {
                this.tasksError("Error: could not create link for artcodes.");
              }
            } else {
              this.tasksError("Network error.");
            }
          }).catch((reason)=>{this.tasksError(reason);});
        });
        break;
      }
    }

    for (var i=0; i<this.timelineEntries.length; ++i) {
      let entry = this.timelineEntries[i];
      if (entry.getId().isLocal()) {
        // publish timeline entry object
        console.log(" - publish timeline entry task...");
        this.tasks.push(()=>{
          console.log("TASK: publishing timeline entry... ("+entry.getId().getID()+")");
          this.timelineProvider.publishTimelineEntry(entry, this.timeline).then(()=>{
            console.log("TASK: ...published timeline entry ("+entry.getId().getID()+").");
            this.nextTask();
          }).catch((reason)=>{this.tasksError(reason);})
        });
      }
    }

    console.log("Generated "+this.tasks.length+" tasks.");
    this.setTaskLoadingScreenMessage("Generated "+this.tasks.length+" tasks.");
    this.nextTask();
  }
 
  private copyArtcodeUrl() {
    //let copyText: HTMLInputElement = event.currentTarget;
    //copyText.select();

    let el: HTMLTextAreaElement = document.querySelector(".artcode-url-textarea textarea") as HTMLTextAreaElement;
    var //oldContentEditable = el.contentEditable,
        //oldReadOnly = el.readOnly,
        range = document.createRange();

    //el.contentEditable = true;
    //el.readOnly = false;
    range.selectNodeContents(el);

    var s = window.getSelection();
    s.removeAllRanges();
    s.addRange(range);

    el.setSelectionRange(0, 999999); // A big number, to cover anything that could be inside the element.

    //el.contentEditable = oldContentEditable;
    //el.readOnly = oldReadOnly;

    document.execCommand('copy');
  }

  private copyArtcodeUrlAlert() {
    const prompt = this.alertCtrl.create({
      title: 'Artcode URL',
      message: "To share the digital content with the recipient please send them this link they can copy/paste into this app",
      inputs: [
        {
          name: 'title',
          value: this.timeline.getArtcodesShareUrl(),
          id: 'artcode-share-input'
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
          text: 'Copy',
          handler: data => {
            console.log('Copy clicked');
            let ele = document.querySelector('#artcode-share-input') as HTMLInputElement;
            this.copyTextIn(ele);
          }
        }
      ]
    });
    prompt.present();
  }
  private copyTextIn(el: HTMLInputElement) {
    //let copyText: HTMLInputElement = event.currentTarget;
    //copyText.select();

    //let el: HTMLTextAreaElement = document.querySelector(".artcode-url-textarea textarea") as HTMLTextAreaElement;
    var //oldContentEditable = el.contentEditable,
        //oldReadOnly = el.readOnly,
        range = document.createRange();

    //el.contentEditable = true;
    //el.readOnly = false;
    range.selectNodeContents(el);

    var s = window.getSelection();
    s.removeAllRanges();
    s.addRange(range);

    el.setSelectionRange(0, 999999); // A big number, to cover anything that could be inside the element.

    //el.contentEditable = oldContentEditable;
    //el.readOnly = oldReadOnly;

    document.execCommand('copy');
  }


  private closeModal() {
    this.navCtrl.pop();
  }
}
