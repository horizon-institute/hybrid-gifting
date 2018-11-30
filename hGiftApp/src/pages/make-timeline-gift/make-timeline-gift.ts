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

@IonicPage()
@Component({
  selector: 'make-timeline-gift',
  templateUrl: 'make-timeline-gift.html',
})
export class MakeTimelineGiftPage {

  private timeline: Timeline;
  private timelineEntries: TimelineEntry[] = [];

  private clientID: string = "1";


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
    public plt: Platform
  ) {

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
      this.timelineEntries = timelineEntries;

      for (var i=0; i<this.timelineEntries.length; ++i) {
        let entry = this.timelineEntries[i];
        if (entry.getId().isLocal()) {
          this.containsUnpublishedData =true;
          break;
        }
      }
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

      if (this.plt.is('ios') || this.plt.is('android')) {
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
            console.log({"imagedata":"data:image/jpeg;base64,"+imageData});
          })
        }, ()=>{/*errorCallback*/}, {
          'sourceType':0,
          'destinationType':0,
          'targetWidth': 800,
          'targetHeight': 800
        });
      } else {

      
        this.imagePicker.getPictures({
          maximumImagesCount: 1,
          width: 800,
          height: 800,
          outputType:1
        }).then((results) => {
          for (var i = 0; i < results.length; i++) {
            //console.log('Image URI: ' + results[i]);

            this.zone.run(()=>{
              ++this.addContentCount;
              this.pushContentEntry(
                TimelineEntry.createImageEntry(
                  this.timeline.getTimelineID(), 
                  this.clientID, 
                  link, 
                  "data:image/jpeg;base64,"+results[i],
                  "image/jpeg"
                )
              );
            });
          }
        }, (err) => {
          alert("There was an error accessing this image. "+JSON.stringify(err));
          console.log(err);
        });
      }

      /*
      this.zone.run(()=>{
        ++this.addContentCount;
        this.pushContentEntry(
          TimelineEntry.createImageEntry(this.timeline.getTimelineID(), "", link, "assets/imgs/placeholder"+(++this.debugPlaceholderImageCount%3+1)+".jpg")
        );
      });
      */
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

  private pushContentEntry(entry: TimelineEntry) {
    this.timelineProvider.addSaveTimelineEntry(this.timeline, entry).then(()=>{
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
        this.timelineProvider.publishTimeline(this.timeline, this.timelineEntries).then(()=>{
          console.log("TASK: ...timeline id: "+this.timeline.getTimelineID());

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
}
