import { Injectable, NgZone } from '@angular/core';

import { Timeline } from '../../objects/timeline/timeline';
import { TimelineEntry } from '../../objects/timeline-entry/timeline-entry';
import { TimelineEntryId } from '../../objects/timeline-entry-id/timeline-entry-id';

import { HybridHttpProvider } from '../hybrid-http/hybrid-http';

import { Storage } from '@ionic/storage';

import { Base64 } from 'js-base64';


import { File, FileEntry } from '@ionic-native/file';
import { Platform } from 'ionic-angular';

/*
  Generated class for the TimelineProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class TimelineProvider {

  constructor(
    private storage: Storage,
    private zone: NgZone,
    private http: HybridHttpProvider,
    private file: File,
    private plt: Platform
  ) {
    console.log('Hello TimelineProvider Provider');
  }

  private static KEY_hg_sent_gifts_ids = "HG_IDS_SENT";
  private static KEY_hg_received_gifts_ids = "HG_IDS_RECEIVED";
  private static KEY_hg_timeline_prefix = "HG_TIMELINE_";
  private static KEY_hg_entry_prefix = "_ENTRY_";

  private hg_sent_gifts_ids: number[];
  private hg_received_gifts_ids: number[];

  private hg_sent_gifts: Timeline[];
  private hg_received_gifts: Timeline[];

  private loadIdListsFromStorage(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.loadIdListFromStorage(TimelineProvider.KEY_hg_sent_gifts_ids).then((value)=>{
        this.hg_sent_gifts_ids = value;
        this.loadIdListFromStorage(TimelineProvider.KEY_hg_received_gifts_ids).then((value)=>{
          this.hg_received_gifts_ids = value;
          resolve();
        }, (reason)=>{
          reject(reason);
        });
      }, (reason)=>{
        reject(reason);
      });
    });
  }

  private loadIdListFromStorage(key: string): Promise<number[]> {
    console.log("loadIdListFromStorage("+key+")");
    return new Promise<number[]>((resolve, reject) => {
      this.storage.get(key).then(
        (value)=>{
          var ids = [];
          if (value) {
            try {
              ids = JSON.parse(value);
            } catch (err) {
              reject("ID list ("+key+") is corrupt: "+err);
              return;
            }
          }
          console.log("Found "+ids.length+" IDs in storage ("+key+").");
          resolve(ids);
        }, (reason)=>{
          reject(reason);
        }
      );
    });
  }

  private writeIdListsToStorage(): Promise<any> {
    return new Promise((resolve, reject)=>{
      this.storage.set(TimelineProvider.KEY_hg_sent_gifts_ids, JSON.stringify(this.hg_sent_gifts_ids)).then((value)=>{
        this.storage.set(TimelineProvider.KEY_hg_received_gifts_ids, JSON.stringify(this.hg_received_gifts_ids)).then((value)=>{
          resolve();
        }, (reason)=>{
          reject(reason);
        });
      }, (reason)=>{
        reject(reason);
      });
    });
  }

  private loadTimelineFromStorage(id: number): Promise<Timeline> {
    return new Promise<Timeline>((resolve, reject)=>{
      this.storage.get(TimelineProvider.KEY_hg_timeline_prefix + id).then((value)=>{
        if (value) {
          try {
            resolve(new Timeline(JSON.parse(value)));
          } catch (err) {
            reject("Timeline ID"+id+" is corrupt!");
          }
        } else {
          reject("Timeline ID"+id+" does not exist.");
        }
      }, (reason)=>{
        reject(reason);
      });
    });
  }

  private writeTimelineToStorage(timeline: Timeline): Promise<any> {
    return new Promise<any>((resolve, reject)=>{

      timeline.regenerateEntries();
      this.storage.set(TimelineProvider.KEY_hg_timeline_prefix + timeline.getTimelineID(), JSON.stringify(timeline.getData())).then((value)=>{
        resolve();
      },(reason)=>{
        reject(reason);
      });
    });
  }

  public getSentGifts(): Promise<Timeline[]> {
    return this.loadIdListFromStorage(TimelineProvider.KEY_hg_sent_gifts_ids).then((ids)=>{
      this.hg_sent_gifts_ids = ids;
      return Promise.all(this.hg_sent_gifts_ids.map((id: number)=>{ return this.loadTimelineFromStorage(id); }));
    }).then((timelines)=>{
      this.hg_sent_gifts = timelines;
      return timelines;
    })
  }

  public getReceivedGifts(): Promise<Timeline[]> {
    return this.loadIdListFromStorage(TimelineProvider.KEY_hg_received_gifts_ids).then((ids)=>{
      this.hg_received_gifts_ids = ids;
      return Promise.all(this.hg_received_gifts_ids.map((id: number)=>{ return this.loadTimelineFromStorage(id); }));
    }).then((timelines)=>{
      this.hg_received_gifts = timelines;
      return timelines;
    })
  }

  public addTimelineToSentGifts(timeline: Timeline): Promise<any> {
    var index = this.hg_sent_gifts_ids.indexOf(timeline.getTimelineID(), 0);

    if (index < 0) {
      this.hg_sent_gifts_ids.push(timeline.getTimelineID());
      this.hg_sent_gifts.push(timeline);
      return this.writeIdListsToStorage();
    } else {
      return new Promise<any>((resolve, reject)=>{resolve()});
    }
  }
  public addTimelineToReceivedGifts(timeline: Timeline): Promise<any> {
    var index = this.hg_received_gifts_ids.indexOf(timeline.getTimelineID(), 0);

    if (index < 0) {
      this.hg_received_gifts_ids.push(timeline.getTimelineID());
      this.hg_received_gifts.push(timeline);
      return this.writeIdListsToStorage();
    } else {
      return new Promise<any>((resolve, reject)=>{resolve()});
    }
  }

  public removeTimelineFromSentGifts(timeline: Timeline): Promise<any> {
    var index = this.hg_sent_gifts_ids.indexOf(timeline.getTimelineID(), 0);

    if (index > -1) {
      this.zone.run(()=>{
        this.hg_sent_gifts_ids.splice(index, 1);
        index = this.hg_sent_gifts.indexOf(timeline, 0);
        if (index > -1) {
          this.hg_sent_gifts.splice(index, 1);
        }
      });
      return this.writeIdListsToStorage();
    } else {
      return new Promise<any>((resolve, reject)=>{resolve()});
    }
  }

  public removeTimelineFromReceivedGifts(timeline: Timeline): Promise<any> {
    var index = this.hg_received_gifts_ids.indexOf(timeline.getTimelineID(), 0);

    if (index > -1) {
      this.zone.run(()=>{
        this.hg_received_gifts_ids.splice(index, 1);
        index = this.hg_received_gifts.indexOf(timeline, 0);
        if (index > -1) {
          this.hg_received_gifts.splice(index, 1);
        }
      });
      return this.writeIdListsToStorage();
    } else {
      return new Promise<any>((resolve, reject)=>{resolve()});
    }
  }

  /* Save changes to a timeline to storage */
  public saveTimeline(timeline: Timeline): Promise<any> {
    return this.writeTimelineToStorage(timeline);
  };

  /* Get a timeline object. This method will either:
    - get the timeline from local memory and attempt to download updates.
    or
    - get the timeline from server. */
  public getTimeline(timelineId: number, waitForServerUpdate=false): Promise<Timeline> {
    return new Promise<Timeline>((resolve, reject)=>{

      // check if timeline is already stored locally:
      var existing: Timeline = null;
      for (var i=0; i<this.hg_sent_gifts.length; ++i) {
        if (timelineId == this.hg_sent_gifts[i].getTimelineID()) {
          existing = this.hg_sent_gifts[i];
          break;
        }
      }
      if (existing==null) {
        for (var i=0; i<this.hg_received_gifts.length; ++i) {
          if (timelineId == this.hg_received_gifts[i].getTimelineID()) {
            existing = this.hg_received_gifts[i];
            break;
          }
        }
      }
      if (existing!=null) {
        if (waitForServerUpdate) {
          this.checkServerForUpdate(existing).then((updatedTimeline)=>{
            resolve(updatedTimeline);
          })
        } else {
          //setTimeout(()=>{this.checkServerForUpdate(existing).then(()=>{});},1);
          console.log("getTimeline(): returning existing timeline");
          resolve(existing);
          return;
        }
      }

      // load timeline from sever:
      console.log("getTimeline(): load timeline from sever");
      this.downloadTimelineFromServer(timelineId).then((timeline)=>{
        resolve(timeline);
      }).catch((reason)=>{
        reject(reason);
      });
    });
  };

  /**
   * Check for updates to a timeline. (maintains local data, does not save to local storage)
   * @param timeline 
   */
  public checkServerForUpdate(timeline: Timeline): Promise<Timeline> {
    return new Promise<Timeline>((resolve, reject)=>{
      if (timeline.getTimelineID() >= 0) {
        // check server for update
        this.downloadTimelineFromServer(timeline.getTimelineID()).then((timelineFromServer)=>{

          for (var i=0; i<timelineFromServer.getNumberOfEntries(); ++i) {
            if (!timeline.containsEntry(timelineFromServer.getEntryId(i))) {
              timeline.addRemoteEntry(timelineFromServer.getEntryId(i));
            }
          }

          resolve(timeline);

        }).catch((reason)=>{
          console.error(reason);
          resolve(timeline);
        });
      } else {
        resolve(timeline);
      }
    });
  }

  private downloadTimelineFromServer(timelineId: number): Promise<Timeline> {
    console.log("downloadTimelineFromServer(): requesting from server");
    return this.http.get("https://www.artcodes.co.uk/static/hg/mirroronly.php?uri=https://development.timeline.chronicle.horizon.ac.uk/api/v1/timeline/"+timelineId+"/").then((value)=>{
      if (value['code'] == 200) {
        console.log("downloadTimelineFromServer(): success");
        let timeline = new Timeline(typeof value['body'] == "string" ? JSON.parse(value['body']) : value['body']);
        return timeline;
      } else {
        console.log("downloadTimelineFromServer(): error");
        console.log(value);
        throw("Network error ("+value['code']+")");
      }
    });
  }

  /* Push changes to a timeline to the server */
  public publishTimeline(timeline: Timeline, entries: TimelineEntry[]): Promise<Timeline> {
    let requestBody = {
      "shortDescription": timeline.getData()['shortDescription'],
      "longDescription": timeline.getData()['longDescription']
    };
    let localId = timeline.getTimelineID();
    return this.http.post(
      "https://www.artcodes.co.uk/static/hg/mirroronly.php?uri=https://development.timeline.chronicle.horizon.ac.uk/api/v1/timeline/",
      {"Content-Type": "application/json"},
      JSON.stringify(requestBody)
    ).then((value)=>{
      let serverResponce = typeof value['body'] == "string" ? JSON.parse(value['body']) : value['body'];
      if (value['code'] == 201 && serverResponce['id']) {
        let remoteId = serverResponce['id'];
        timeline.setPublishedID(remoteId);
        return this.swapTimelineIdsAndSave(localId, remoteId, timeline, entries);
      } else {
        throw "Error publishing timeline entry.";
      }
    }).then(()=>{
      return timeline;
    });
  };


  private swapTimelineIdsAndSave(localId: number, remoteID: number, timeline: Timeline, entries: TimelineEntry[]): Promise<Timeline> {
    return new Promise<any>((resolve, reject)=>{
      console.log("swapTimelineIdsAndSave(): write new storage entry");
      // write new storage entry
      this.storage.set(TimelineProvider.KEY_hg_timeline_prefix + timeline.getTimelineID(), JSON.stringify(timeline.getData())).then((value)=>{
        console.log("swapTimelineIdsAndSave(): change in all entries");
        // change in all entries:
        return Promise.all(entries.map((e)=>{return this.swapTimelineIdInEntryAndSave(localId, remoteID, e)}));
      }).then(()=>{
        console.log("swapTimelineIdsAndSave(): rewrite id in lists");
        // rewrite id in lists
        var index = this.hg_received_gifts_ids.indexOf(localId);
        if (index !== -1) {
          this.hg_received_gifts_ids[index] = remoteID;
        }
        index = this.hg_sent_gifts_ids.indexOf(localId);
        if (index !== -1) {
          this.hg_sent_gifts_ids[index] = remoteID;
        }
        return this.writeIdListsToStorage();
      }).then(()=>{
        console.log("swapTimelineIdsAndSave(): delete old storage entry");
        // delete old entry
        return this.storage.remove(TimelineProvider.KEY_hg_timeline_prefix + localId);
      }).then(()=>{
        console.log("swapTimelineIdsAndSave(): delete old entries");
        // delete old entries
        return Promise.all(entries.map((e)=>{return this.swapTimelineIdInEntryAndDelete(localId, remoteID, e)}));
      }).then(()=>{
        resolve(timeline)
      }).catch((reason)=>{
        reject(reason);
      });
    });
  }
  private swapTimelineIdInEntryAndSave(localId: number, remoteID: number, entry: TimelineEntry): Promise<any> {
      // write new entry
      return this.storage.set(TimelineProvider.KEY_hg_timeline_prefix + remoteID + TimelineProvider.KEY_hg_entry_prefix + entry.getId().getID(), JSON.stringify(entry.getData()));
  }
  private swapTimelineIdInEntryAndDelete(localId: number, remoteID: number, entry: TimelineEntry): Promise<any> {
      // delete old entry
      return this.storage.remove(TimelineProvider.KEY_hg_timeline_prefix + localId + TimelineProvider.KEY_hg_entry_prefix + entry.getId().getID());
  }



  /** 
   * Deletes a timeline (and entries) from local storage. This will not remove data from the server.
   */
  public deleteTimeline(timeline: Timeline): Promise<any> {
    let key = TimelineProvider.KEY_hg_timeline_prefix + timeline.getTimelineID();
    return this.removeTimelineFromReceivedGifts(timeline).then(()=>{
      return this.removeTimelineFromSentGifts(timeline);
    }).then(()=>{
      return this.storage.remove(key);
    }).then(()=>{
      return Promise.all(timeline.getEntryIds().map((id)=>{return this.deleteTimelineEntryFromId(id)}))
    });
  };

  /** 
   * Get a timeline object. This method will either:
   * - get the timeline from local memory, or
   * - get the timeline from server (and store in local memory). 
   */
  public getTimelineEntry(id: TimelineEntryId): Promise<TimelineEntry> {
    let key = TimelineProvider.KEY_hg_timeline_prefix + id.getTimelineId() + 
      TimelineProvider.KEY_hg_entry_prefix + id.getID()
    return new Promise<TimelineEntry>((resolve, reject)=>{
      this.storage.get(key).then((value)=>{
        console.log("Storage result for [" + key + "] = "+value);
        if (value != null) {
          console.log("Using storage value.");
          let jsonObj = JSON.parse(value);
          let entry = new TimelineEntry(jsonObj, id.getTimelineId());
          resolve(entry);
        } else {
          console.log("Downloading...");
          return this.downloadTimelineEntry(id).then((value)=>{
            resolve(value);
          }).catch((reason)=>{
            reject(reason);
          });
        }
      }).catch((reason)=>{
        reject(reason);
      });
    });
  }

  private downloadTimelineEntry(id: TimelineEntryId): Promise<TimelineEntry> {
    var timelineEntry: TimelineEntry;
    //var serverResponce;
    // download entry
    return this.http.get("https://www.artcodes.co.uk/static/hg/mirroronly.php?uri=https://development.timeline.chronicle.horizon.ac.uk/api/v1/timeline/"+id.getTimelineId()+"/entry/"+id.getID()).then((value)=>{
      if (value['code'] == 200) {
        timelineEntry = new TimelineEntry(
          typeof value['body'] == "string" ? JSON.parse(value['body']) : value['body'],
          id.getTimelineId()
        );
        //serverResponce = value;
        // save entry
        let mimeType = timelineEntry.getMimeType();

        var tempLoadingDataUri: string = "";
        if (mimeType=="text/plain") {
          tempLoadingDataUri = "data:"+mimeType+";base64," + Base64.encode("Loading...");
        } else if (mimeType=="image/jpeg" || mimeType=="image/jpg" || mimeType=="image/png") {
          tempLoadingDataUri = "assets/imgs/image_loading.png";
        }
        timelineEntry.setLocalURI(tempLoadingDataUri);

        return this.saveTimelineEntry(timelineEntry);
      } else {
        throw value;
      }
    }).then(()=>{
      setTimeout(()=>{
        // download content
        let mimeType = timelineEntry.getMimeType();
        var filePath = TimelineProvider.FILE_PATH_APP_DIR + "/TL_"+timelineEntry.getId().getTimelineId()+"_E_"+timelineEntry.getId().getID()+((mimeType=="image/jpeg" || mimeType=="image/jpg") ? ".jpg" : (mimeType=="image/png" ? ".png" : ".bin" ) );
        filePath = (this.plt.is('android')?"file://":"") + this.replaceFilePathVariables(filePath);
        console.log("File path = "+filePath);
        if (this.http.isDownloadAvailable() && (mimeType=="image/jpeg" || mimeType=="image/jpg" || mimeType=="image/png")) {
          this.http.download(
            "https://www.artcodes.co.uk/static/hg/mirroronly.php?uri=https://development.timeline.chronicle.horizon.ac.uk/api/v1/timeline/"+id.getTimelineId()+"/entry/"+id.getID()+"/content",
            {},
            filePath
          ).then((value)=>{
            console.log("Downloaded file:");
            console.log(value);
            let fe: FileEntry = value;
            let uri: string = fe.toURL();
            uri = this.addFilePathVariables(uri);
            console.log("Downloaded file URI = "+fe.toURL()+" = "+uri);

            this.zone.run(()=>{
              timelineEntry.setLocalURI(uri);
            });
            this.saveTimelineEntry(timelineEntry);
          }).catch((reason)=>{
            console.log("Failed to download file: ");
            console.log(reason);
          });
        } else {
          this.http.get("https://www.artcodes.co.uk/static/hg/mirroronly.php?uri=https://development.timeline.chronicle.horizon.ac.uk/api/v1/timeline/"+id.getTimelineId()+"/entry/"+id.getID()+"/content").then((value)=>{
            if (value['code'] == 200) {
              // update entry
              var base64uri: string;
              if (mimeType=="text/plain") {
                console.log(mimeType+"using Base64.encode");
                base64uri = "data:"+mimeType+";base64," + Base64.encode(value['body']);
              } else if (value.hasOwnProperty('base64')) {
                console.log(mimeType+" using value['base64']");
                base64uri = "data:"+mimeType+";base64," + value['base64'];
              } else {
                console.log(mimeType+" using btoa(value['body']");
                base64uri = "data:"+mimeType+";base64," + btoa(value['body']);
              }
              this.zone.run(()=>{
                timelineEntry.setLocalURI(base64uri);
              });
              this.saveTimelineEntry(timelineEntry);
            } else {
              throw "error downloading timeline entry content";
            }
          });
        }
      }, 1);
      return timelineEntry;
    });
  } 

  public saveTimelineEntry(entry: TimelineEntry): Promise<any> {
    return new Promise<any>((resolve, reject)=>{
      let key = TimelineProvider.KEY_hg_timeline_prefix + entry.getId().getTimelineId() + 
        TimelineProvider.KEY_hg_entry_prefix + entry.getId().getID();
      this.storage.set(
        key,
        JSON.stringify(entry.getData())
      ).then((value)=>{ 
        resolve(); 
      }).catch((reason)=>{
        reject("Error saving timeline entry ("+entry.getId().getTimelineId()+"/"+entry.getId().getID()+"): "+JSON.stringify(reason))
      });
    });
  }

  public publishTimelineEntry(entry: TimelineEntry, timeline: Timeline): Promise<TimelineEntry> {
    var metadata = [];
    for (var i=0; i<entry.getMetadataSize(); ++i) metadata.push(entry.getMetadataAt(i));
    var base64content: string;
    if (entry.getLocalContentURI().startsWith("data:")) {
      base64content = entry.getLocalContentURI().substr(("data:"+entry.getMimeType()+";base64,").length);
    } else {
      base64content = entry.getLocalContentURI();
    }
    let requestBody = {
      "mimeType": entry.getMimeType(),
      "content": base64content,
      "metadata": metadata
    };

    let localId = entry.getId().getID();

    return this.http.post(
      "https://www.artcodes.co.uk/static/hg/mirroronly.php?uri=https://development.timeline.chronicle.horizon.ac.uk/api/v1/timeline/"+entry.getId().getTimelineId()+"/entry/",
      {"Content-Type": "application/json"},
      JSON.stringify(requestBody)
    ).then((value)=>{
      let serverResponce = typeof value['body'] == "string" ? JSON.parse(value['body']) : value['body'];
      if (value['code'] == 201 && serverResponce['id']) {
        let remoteId = serverResponce['id'];
        this.zone.run(()=>{
          entry.getId().setPublishedID(remoteId);
        })
        return this.swapIdsAndSaveTimelineEntry(localId, remoteId, entry, timeline);
      } else {
        throw "Error publishing timeline entry.";
      }
    }).then(()=>{
      return entry;
    });
  }

  private swapIdsAndSaveTimelineEntry(localId: string, remoteId: number, entry: TimelineEntry, timeline: Timeline) {
    console.log("swapIdsAndSaveTimelineEntry("+localId+" -> "+remoteId+" in timeline "+entry.getId().getTimelineId()+")");
    return this.storage.set(TimelineProvider.KEY_hg_timeline_prefix + entry.getId().getTimelineId() + TimelineProvider.KEY_hg_entry_prefix + remoteId, JSON.stringify(entry.getData())).then(()=>{
      return this.storage.remove(TimelineProvider.KEY_hg_timeline_prefix + entry.getId().getTimelineId() + TimelineProvider.KEY_hg_entry_prefix + localId);
    }).then(()=>{
      if (timeline != null) {
        for (var i=0; i<timeline.getNumberOfEntries(); ++i) {
          console.log('swapIdsAndSaveTimelineEntry i='+i);
          console.log(timeline.getEntryId(i));
          var id = timeline.getEntryId(i);
          if (id != null && id != undefined) {
            if (id.getID() == localId) {
              id.setPublishedID(remoteId);
              return this.saveTimeline(timeline);
            }
          }
        }
      }
      return new Promise<any>((resolve,reject)=>{resolve();});
    });
  }

  /* Delete a single entry from local storage */
  public deleteTimelineEntry(entry: TimelineEntry): Promise<any> {
    return this.deleteTimelineEntryFromId(entry.getId(), entry);
  }
  public deleteTimelineEntryFromId(entryId: TimelineEntryId, entry: TimelineEntry=null): Promise<any> {
      this.getTimelineEntry(entryId)
    return new Promise<TimelineEntry>((resolve, reject)=>{
      if (entry==null) {
        console.log("delete("+entryId.getTimelineId()+"-"+entryId.getID()+"): Getting entry data...");
        this.getTimelineEntry(entryId).then((e)=>{resolve(e)}).catch((r)=>{reject(r)});
      } else {
        resolve(entry);
      }
    }).then((entry_: TimelineEntry)=>{
      console.log("delete("+entryId.getTimelineId()+"-"+entryId.getID()+"): Deleting cached files ("+entry_.getMimeType()+")...");
      return this.removeTimelineEntryCachedFile(entry_);
    }).catch((reason)=>{
      console.warn("delete("+entryId.getTimelineId()+"-"+entryId.getID()+"): There was a problem getting entry or deleting cached files:");
      console.warn(reason);
      console.log("delete("+entryId.getTimelineId()+"-"+entryId.getID()+"): Removing data from storage...");
      return this.removeTimelineEntryFromStorage(entryId);
    }).then(()=>{
      console.log("delete("+entryId.getTimelineId()+"-"+entryId.getID()+"): Removing data from storage...");
      return this.removeTimelineEntryFromStorage(entryId);
    });

  }

  private removeTimelineEntryFromStorage(entryId: TimelineEntryId): Promise<any> {
    let key = TimelineProvider.KEY_hg_timeline_prefix + entryId.getTimelineId() + 
      TimelineProvider.KEY_hg_entry_prefix + entryId.getID();
    return this.storage.remove(key);
  }
  private removeTimelineEntryCachedFile(entry: TimelineEntry): Promise<any> {
    let uri: string = this.replaceFilePathVariables(entry.getLocalContentURI());
    
    if (uri.startsWith("/")) {
      uri = "file://"+uri;
      let path = uri.substr(0, uri.lastIndexOf("/"));
      let filename = uri.substr(uri.lastIndexOf("/")+1);
      console.log("delete("+entry.getId().getTimelineId()+"-"+entry.getId().getID()+"): Deleting cached file " + filename + " in " + path);
      return this.file.removeFile(path, filename);
    } else {
      console.log("delete("+entry.getId().getTimelineId()+"-"+entry.getId().getID()+"): No cached files to delete.");
      return new Promise<any>((resolve, reject)=>{resolve();});
    }
  }


  public addSaveTimelineEntry(timeline: Timeline, entry: TimelineEntry): Promise<any> {
    return this.saveTimelineEntry(entry).then((value)=>{
      timeline.addLocalEntry(entry.getId());
      return this.saveTimeline(timeline);
    });
  }
  public removeSaveTimelineEntry(timeline: Timeline, entry: TimelineEntry): Promise<any> {
    return this.deleteTimelineEntry(entry).then((value)=>{
      timeline.removeLocalEntry(entry.getId());
      return this.saveTimeline(timeline);
    });
  }




  public createNewTimeline(): Promise<Timeline> {
    let timeline = new Timeline(null);
    return new Promise<Timeline>((resolve, reject)=>{
      this.saveTimeline(timeline).then((value)=>{
        resolve(timeline);
      }).catch((reason)=>{
        reject(reason);
      })
    });
  }


  public createNewTimelineEntry(timeline: Timeline, addDataFn: (e:TimelineEntry)=>void): Promise<TimelineEntry> {
    var entry = new TimelineEntry(null, timeline.getTimelineID());
    if (addDataFn != null) addDataFn(entry);
    return new Promise<TimelineEntry>((resolve, reject)=>{
      this.saveTimelineEntry(entry).then((value)=>{
        resolve(entry);
      }).catch((reason)=>{
        reject(reason);
      })
    });
  }

  public static FILE_PATH_APP_DIR: string = "%%APPROOT%%";
  /**
   * "%%APPROOT%%/photo.jpg" -> "/path/to/app/stuff/photo.jpg"
   * @param filePath 
   */
  public replaceFilePathVariables(filePath: string): string {
    var result: string = ""+filePath;
    result = result.replace(TimelineProvider.FILE_PATH_APP_DIR, this.file.dataDirectory);
    result = result.replace("file://", "");
    result = result.replace("//", "/");
    return result;
  }
  /**
   * "/path/to/app/stuff/photo.jpg" -> "%%APPROOT%%/photo.jpg"
   * @param filePath 
   */
  public addFilePathVariables(filePath: string): string {
    var result: string = ""+filePath;
    result = result.replace(this.file.dataDirectory, TimelineProvider.FILE_PATH_APP_DIR);
    result = result.replace("file://", "");
    result = result.replace("//", "/");
    return result;
  }

}
