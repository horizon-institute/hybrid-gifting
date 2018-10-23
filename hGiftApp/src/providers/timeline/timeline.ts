import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';

import { Timeline } from '../../objects/timeline/timeline';
import { TimelineEntry } from '../../objects/timeline-entry/timeline-entry';
import { TimelineEntryId } from '../../objects/timeline-entry-id/timeline-entry-id';

import { Storage } from '@ionic/storage';

/*
  Generated class for the TimelineProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class TimelineProvider {

  constructor(
    private storage: Storage,
    private zone: NgZone
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
  public getTimeline(timelineId: number): Promise<Timeline> {
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
        setTimeout(()=>{this.checkServerForUpdate(existing);},1);
        resolve(existing);
        return;
      }

      // load timeline from sever:
      return this.downloadTimelineFromServer(timelineId);
    });
  };

  private checkServerForUpdate(timeline: Timeline) {
    if (timeline.getTimelineID() >= 0) {
      // TODO: check server for update
    }
  }

  private downloadTimelineFromServer(timelineId: number): Promise<Timeline> {
    return null; // TODO: 
  }

  /* Push changes to a timeline to the server */
  public publishTimeline(timeline: Timeline): Promise<Timeline> {
    return null; // TODO: 
  };

  /* Deletes a timeline (and entries) from local storage. */
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

  /* Get a timeline object. This method will either:
    - get the timeline from local memory
    or
    - get the timeline from server (and store in local memory). */
  public getTimelineEntry(id: TimelineEntryId): Promise<TimelineEntry> {
    let key = TimelineProvider.KEY_hg_timeline_prefix + id.getTimelineId() + 
      TimelineProvider.KEY_hg_entry_prefix + id.getID()
    return new Promise<TimelineEntry>((resolve, reject)=>{
      this.storage.get(key).then((value)=>{
        console.log("Storage result for [" + key + "] = "+value);
        if (value) {
          let jsonObj = JSON.parse(value);
          let entry = new TimelineEntry(jsonObj, id.getTimelineId());
          resolve(entry);
        } else {
          return this.downloadTimelineEntry();
        }
      }).catch((reason)=>{
        reject(reason);
      });
    });
  }

  private downloadTimelineEntry(): Promise<TimelineEntry> {
    return new Promise<TimelineEntry>((resolve, reject)=>{
      reject();
      // TODO: get auth token(s)
      // TODO: get timeline entry (mimetype/metadata)
      // TODO: download and cache content
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

  public publishTimelineEntry(entry: TimelineEntry): Promise<TimelineEntry> {
    return new Promise<TimelineEntry>((resolve, reject)=>{
      reject();
      // TODO:
    });
  }

  /* Delete a single entry from local storage */
  public deleteTimelineEntry(entry: TimelineEntry): Promise<any> {
    return this.deleteTimelineEntryFromId(entry.getId());
  }
  public deleteTimelineEntryFromId(entry: TimelineEntryId): Promise<any> {
    return new Promise<any>((resolve, reject)=>{
      if (entry.isLocal()) {
        // if local unpublished
        // remove TimelineEntry storage key/pair
        let key = TimelineProvider.KEY_hg_timeline_prefix + entry.getTimelineId() + 
          TimelineProvider.KEY_hg_entry_prefix + entry.getID();
        this.storage.remove(key).then(()=>{
          // TODO: delete any cached content file
          resolve(); 
        }).catch((reason)=>{
          reject(reason);
        })
      } else {
        reject("Cannot delete published entry ("+entry.getTimelineId()+"/"+entry.getID()+").");
      }
    });
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
}
