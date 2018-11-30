
import { v4 as uuid } from 'uuid';

/*
This class represents a timeline entry id.
*/
export class TimelineEntryId {

    private timelineId: number;
    private type: string;
    private id: string;

    constructor(timelineId: number, type: string, id = -1) {
      this.timelineId = timelineId;
      if (type == "local") {
        this.id = id == -1 ? uuid() : id;
        this.type = this.id.length==uuid().length ? "local" : "remote";
      } else if (type == "remote") {
        this.type = "remote";
        this.id = ""+id;
      } else {
        // ?
      }
    }

    public getTimelineId(): number {
      return this.timelineId;
    }

    public getID(): string {
      return this.id;
    }

    public isLocal(): boolean {
      return this.type == "local";
    }
    public isRemote(): boolean {
      return this.type == "remote";
    }
    
    public setPublishedID(publishedId: number) {
      this.type = 'remote';
      this.id = ''+publishedId;
    }

    public setPublishedTimelineID(publishedId: number) {
      this.timelineId = publishedId;
    }


}