import { TimelineEntryId } from '../timeline-entry-id/timeline-entry-id';

/*
This class represents a users state along a journey.
*/
export class Timeline {

    private source: {};
    private entries: TimelineEntryId[] = [];
  
    constructor(data: any) {
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

    public setDescriptions(shortDesc, longDesc) {
        this.source['shortDescription'] = shortDesc;
        this.source['longDescription'] = longDesc;
    }

    public getTimelineID(): number {
        return this.source['id'];
    }
    public setPublishedID(publishedId: number) {
        this.source['id'] = publishedId;
        for (var i=0; i<this.entries.length; ++i) {
            this.entries[i].setPublishedTimelineID(publishedId);
        }
    }

    public getData(): {} {
        return this.source;
    }

    /**
     * Call this after publishing timeline entries and before saving this timeline.
     */
    public regenerateEntries() {
        this.source['entries'] = this.entries.map((entryId)=>{ return { "id": entryId.getID(), "createdAt": ""} });
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

    public containsEntry(id: TimelineEntryId) {
        for (var i=0; i<this.entries.length; ++i) {
            if (id.getID() == this.entries[i].getID()) {
                return true;
            }
        }
        return false;
    }

    public addLocalEntry(id: TimelineEntryId) {
        if (id.isLocal()) {
            this.entries.push(id);
            this.source['entries'].push({"id": id.getID()});
        }
    }
    public addRemoteEntry(id: TimelineEntryId) {
        if (id.isRemote()) {
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
                if (this.source['entries'][i]['id'] == id.getID()) {
                    this.source['entries'].splice(i, 1);
                    break;
                }
            }
        }
    }

    public addArtcodesShareUrl(url: string) {
        let pos = url.lastIndexOf('#');
        var artcodeUrl = "";
        var artcodeHash= "";
        if (pos == -1) {
            artcodeUrl =  url;
        } else {
            artcodeUrl = url.substring(0, pos);
            artcodeHash =  url.substring(pos+1);
        }

        this.source["artcodeUrl"] = artcodeUrl;
        this.source["artcodeHash"] = artcodeHash;
    }
    public hasArtcodesShareUrl(): boolean {
        if (this.source["artcodeUrl"]) return true;
        return false;
    }
    public getArtcodesShareUrl(): string {
        return this.source["artcodeUrl"];
    }
    
}