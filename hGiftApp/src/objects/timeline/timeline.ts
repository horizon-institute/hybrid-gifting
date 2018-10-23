import { TimelineEntryId } from '../timeline-entry-id/timeline-entry-id';

/*
This class represents a users state along a journey.
*/
export class Timeline {

    private source: {};
    private entries: TimelineEntryId[] = [];
  
    constructor(data: any) {
        console.log("Timeline " + JSON.stringify(data));
        console.log("Timeline " + JSON.stringify(data));
      if (data != null && typeof data == "object") {
        this.source = data;
        for (var entryIndex=0; entryIndex<this.source['entries'].length; ++entryIndex) {
            let id = this.source['entries'][entryIndex]['id'];
            this.entries.push(new TimelineEntryId(this.source['id'], typeof id == "string" ? "local" : "remote", id));
        }
      } else {
        this.source = {
            "status": "local",
            "id": Date.now() * -1,
            "shortDescription": "",
            "longDescription": "",
            "entries": [
                /* { "id": 1234, "createdAt": ""} */
            ]
        };
      }
    }

    public getTimelineID(): number {
        return this.source['id'];
    }

    public getData(): {} {
        return this.source;
    }

    public getNumberOfEntries(): number {
        return this.entries.length;
    }

    public getEntryId(index: number): TimelineEntryId {
        return this.entries[index];
    }

    public getEntryIds(): TimelineEntryId[] {
        return this.entries;
    }

    public addLocalEntry(id: TimelineEntryId) {
        if (id.isLocal()) {
            this.entries.push(id);
            this.source['entries'].push({"id": id.getID()});
        }
    }
    public removeLocalEntry(id: TimelineEntryId) {
        if (id.isLocal()) {
            for (var i=0; i<this.entries.length; ++i) {
                if (this.entries[i].getID() == id.getID()) {
                    this.entries.splice(i, 1);
                    break;
                }
            }
            for (var i=0; i<this.source['entries'].length; ++i) {
                if (this.source['entries'][i].getID() == id.getID()) {
                    this.source['entries'].splice(i, 1);
                    break;
                }
            }
        }
    }

    
}