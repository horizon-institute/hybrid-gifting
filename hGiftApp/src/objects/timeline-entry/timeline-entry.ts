import { TimelineEntryId } from '../timeline-entry-id/timeline-entry-id';


import { Base64 } from 'js-base64';


/*
This class represents a users state along a journey.
*/
export class TimelineEntry {

    private source: {};

    private CRONICAL_BASE_URL = "https://timeline.chronicle.horizon.ac.uk/";

    private id: TimelineEntryId;
  
    constructor(data: any, timeline_id = -1) {
      if (data!=null && typeof data == "object") {
        this.source = data;
        this.source['remoteContentURI'] = this.CRONICAL_BASE_URL + "timeline/" + timeline_id + "/entry/" + this.source['id'];
        this.id = new TimelineEntryId(timeline_id, "remote", this.source['id']);
      } else {
        this.id = new TimelineEntryId(timeline_id, "local");
        this.source = {
            "status": "local",
            "id": this.id.getID(),
            "createdAt": "",
            "mimeType": "",
            "metadata": [
                /*{"key": "256 max length string", "value": "256 max length string"}*/
            ],
            "localContentURI": ""
        };
      }
    }

    public getId(): TimelineEntryId {
        return this.id;
    }


    public getData(): {} {
        return this.source;
    }

    public addMetadata(key: string, value: string): boolean {
        if (key.length < 256 && value.length < 256 && this.source['status'] == "local") {
            this.source['metadata'].push({"key": key, "value": value});
            return true;
        }
        return false;
    }

    public getMetadata(key: string): string {
        for (var i=0; i < this.source['metadata'].length; ++i) {
            if (this.source['metadata'][i]['key'] == key) {
                return this.source['metadata'][i]['value'];
            }
        }
        return null;
    }

    public getMetadataAt(i: number): {} {
        return this.source['metadata'][i];
    }
    public getMetadataSize(): {} {
        return this.source['metadata'].length;
    }

    /* WARNING: do not edit returned value */
    public getMetadataDictionary(): {} {
        return this.source['metadata'];
    }

    public setMimeType(mimeType: string) {
        if (this.source['status'] == "local") {
            this.source['mimeType'] = mimeType;
        }
    }
    public getMimeType() {
        return this.source['mimeType'];
    }

    public setLocalURI(uri: string) {
        this.source['localContentURI'] = uri;
    }

    public getLocalContentURI(): string {
        return this.source['localContentURI'];
    }

    // HG specific methods

    public isReveal(): boolean { return this.getMetadata("hg_entry_type") == "reveal"; }
    public isLink():   boolean { return this.getMetadata("hg_entry_type") == "link"; }

    public static METADATA_KEY_LINK_TYPE = "hg_link_type";
    public static METADATA_KEY_LINK_URI = "hg_link_uri";

    public static LINK_TYPE_ARTCODE = "artcode";
    public static LINK_TYPE_QRCODE = "qrcode";
    public static LINK_TYPE_NFC = "nfc";

    public isArtcode(): boolean { return this.getMetadata("hg_link_type") == TimelineEntry.LINK_TYPE_ARTCODE; }
    public isNFC():     boolean { return this.getMetadata("hg_link_type") == TimelineEntry.LINK_TYPE_NFC; }
    public isQR():      boolean { return this.getMetadata("hg_link_type") == TimelineEntry.LINK_TYPE_QRCODE; }

    public static createLinkEntry(timeline_id: number, hg_userId: string, linkUri: string, linkType: string): TimelineEntry {
        var entry = new TimelineEntry(null, timeline_id);

        entry.addMetadata("hg_user_id", hg_userId);
        entry.addMetadata("hg_entry_type", "link");
        entry.addMetadata(TimelineEntry.METADATA_KEY_LINK_TYPE, linkType);
        entry.addMetadata(TimelineEntry.METADATA_KEY_LINK_URI, linkUri);

        return entry;
    }
    public static createRevealLinkEntry(timeline_id: number, hg_userId: string, linkUri: string, linkType: string): TimelineEntry {
        var entry = new TimelineEntry(null, timeline_id);

        entry.addMetadata("hg_user_id", hg_userId);
        entry.addMetadata("hg_entry_type", "reveal");
        entry.addMetadata(TimelineEntry.METADATA_KEY_LINK_TYPE, linkType);
        entry.addMetadata(TimelineEntry.METADATA_KEY_LINK_URI, linkUri);

        return entry;
    }
    public static createImageEntry(timeline_id: number, hg_userId: string, linkUri: string, imageUri: string, mimeType = ""): TimelineEntry {
        var entry = new TimelineEntry(null, timeline_id);

        entry.addMetadata("hg_user_id", hg_userId);
        entry.addMetadata(TimelineEntry.METADATA_KEY_LINK_URI, linkUri);
        entry.addMetadata("hg_entry_type", "image");
        if (mimeType != "") {
            entry.setMimeType(mimeType);
        } else if (imageUri.endsWith(".jpg") || imageUri.endsWith(".jpeg")) {
            entry.setMimeType("image/jpeg");
        } else if (imageUri.endsWith(".png")) {
            entry.setMimeType("image/png");
        } else if (imageUri.endsWith(".gif")) {
            entry.setMimeType("image/gif");
        }
        entry.setLocalURI(imageUri);

        return entry;
    }
    public static createTextEntry(timeline_id: number, hg_userId: string, linkUri: string, text: string): TimelineEntry {
        var entry = new TimelineEntry(null, timeline_id);

        entry.addMetadata("hg_user_id", hg_userId);
        entry.addMetadata(TimelineEntry.METADATA_KEY_LINK_URI, linkUri);
        entry.addMetadata("hg_entry_type", "text");
        entry.setMimeType("text/plain");

        entry.setLocalURI("data:text/plain;base64," + Base64.encode(text));

        return entry;
    }

}