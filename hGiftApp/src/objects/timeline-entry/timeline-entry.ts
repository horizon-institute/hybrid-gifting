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
        if (typeof this.source['id'] == "string" && this.source['id'].length == 36) {
            // local, unpublished
            this.id = new TimelineEntryId(timeline_id, "local", this.source['id']);
        } else {
            // published
            this.source['remoteContentURI'] = this.CRONICAL_BASE_URL + "timeline/" + timeline_id + "/entry/" + this.source['id'];
            this.id = new TimelineEntryId(timeline_id, "remote", this.source['id']);
        }
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
        this.source['id'] = this.getId().getID();
        this.source['status'] = typeof this.source['id'] == "string" && this.source['id'].length == 36 ? "local" : "remote";
        return this.source;
    }

    public addMetadata(key: string, value: string): boolean {
        if (value==null) {
            console.error("TimelineEntry.addMetadata("+JSON.stringify(key)+", "+JSON.stringify(value)+")");
        } else {
            console.log("TimelineEntry.addMetadata("+JSON.stringify(key)+", "+JSON.stringify(value)+")");
        }
        if (key!=null && value!=null && key.length < 256 && value.length < 256 && this.source['status'] == "local") {
            for (var i=0; i<this.source['metadata'].length; ++i) {
                if (this.source['metadata'][i]["key"] == key) {
                    console.log("TimelineEntry.addMetadata: Replacing value for key '"+key+"', '"+this.source['metadata'][i]["value"]+"' -> '"+value+"'");
                    this.source['metadata'][i]["value"] = value;
                    return true;
                }
            }
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

    /** 
     * May return either 
     * - a base64 URI (e.g. "data:text/plain;base64,aGk="), or 
     * - a local file path (e.g. "/path/to/file.jpg")
     */
    public getLocalContentURI(): string {
        return this.source['localContentURI'];
    }

    public setHash(hash: string) {
        this.source["hash"] = hash;
    }
    public getHash(): string {
        if (this.source["hash"]) {
            return this.source["hash"];
        } else {
            return "";
        }
    }

    // HG specific methods

    public static METADATA_KEY_USER_ID = "hg_user_id";
    public static METADATA_KEY_ENTRY_TYPE = "hg_entry_type";
    public static METADATA_KEY_LINK_TYPE = "hg_link_type";
    public static METADATA_KEY_LINK_URI = "hg_link_uri";

    public static LINK_TYPE_ARTCODE = "artcode";
    public static LINK_TYPE_QRCODE = "qrcode";
    public static LINK_TYPE_NFC = "nfc";

    public static ENTRY_TYPE_LINK = "link";
    public static ENTRY_TYPE_REVEAL = "reveal";
    public static ENTRY_TYPE_IMAGE = "image";
    public static ENTRY_TYPE_TEXT = "text";
    public static ENTRY_TYPE_URL = "url";
    public static ENTRY_TYPE_THANK_YOU_NOTE = "thankyou";
    public static ENTRY_TYPE_ARTCODE_SHARE_URL = "artcodeshareurl";

    public isReveal(): boolean { return this.getMetadata(TimelineEntry.METADATA_KEY_ENTRY_TYPE) == TimelineEntry.ENTRY_TYPE_REVEAL; }
    public isLink():   boolean { return this.getMetadata(TimelineEntry.METADATA_KEY_ENTRY_TYPE) == TimelineEntry.ENTRY_TYPE_LINK; }
    public isThankYouNote(): boolean { return this.getMetadata(TimelineEntry.METADATA_KEY_ENTRY_TYPE) == TimelineEntry.ENTRY_TYPE_THANK_YOU_NOTE; }

    public isArtcode(): boolean { return this.getMetadata(TimelineEntry.METADATA_KEY_LINK_TYPE) == TimelineEntry.LINK_TYPE_ARTCODE; }
    public isNFC():     boolean { return this.getMetadata(TimelineEntry.METADATA_KEY_LINK_TYPE) == TimelineEntry.LINK_TYPE_NFC; }
    public isQR():      boolean { return this.getMetadata(TimelineEntry.METADATA_KEY_LINK_TYPE) == TimelineEntry.LINK_TYPE_QRCODE; }

    public getUserId(): string { return this.getMetadata(TimelineEntry.METADATA_KEY_USER_ID); }

    public static createLinkEntry(timeline_id: number, hg_userId: string, linkUri: string, linkType: string): TimelineEntry {
        var entry = new TimelineEntry(null, timeline_id);

        entry.addMetadata(TimelineEntry.METADATA_KEY_USER_ID, hg_userId);
        entry.addMetadata(TimelineEntry.METADATA_KEY_ENTRY_TYPE, TimelineEntry.ENTRY_TYPE_LINK);
        entry.addMetadata(TimelineEntry.METADATA_KEY_LINK_TYPE, linkType);
        entry.addMetadata(TimelineEntry.METADATA_KEY_LINK_URI, TimelineEntry.removeHash(linkUri));
        entry.setHash(TimelineEntry.getHash(linkUri));
        
        entry.setMimeType("text/plain");
        entry.setLocalURI("data:text/plain;base64," + Base64.encode(""));

        return entry;
    }
    public static createRevealLinkEntry(timeline_id: number, hg_userId: string, linkUri: string, linkType: string): TimelineEntry {
        var entry = new TimelineEntry(null, timeline_id);

        entry.addMetadata(TimelineEntry.METADATA_KEY_USER_ID, hg_userId);
        entry.addMetadata(TimelineEntry.METADATA_KEY_ENTRY_TYPE, TimelineEntry.ENTRY_TYPE_REVEAL);
        entry.addMetadata(TimelineEntry.METADATA_KEY_LINK_TYPE, linkType);
        entry.addMetadata(TimelineEntry.METADATA_KEY_LINK_URI, TimelineEntry.removeHash(linkUri));
        entry.setHash(TimelineEntry.getHash(linkUri));

        entry.setMimeType("text/plain");
        entry.setLocalURI("data:text/plain;base64," + Base64.encode(""));

        return entry;
    }
    public static createImageEntry(timeline_id: number, hg_userId: string, linkUri: string, imageUri: string, mimeType = ""): TimelineEntry {
        var entry = new TimelineEntry(null, timeline_id);

        entry.addMetadata(TimelineEntry.METADATA_KEY_USER_ID, hg_userId);
        entry.addMetadata(TimelineEntry.METADATA_KEY_LINK_URI, TimelineEntry.removeHash(linkUri));
        entry.setHash(TimelineEntry.getHash(linkUri));
        entry.addMetadata(TimelineEntry.METADATA_KEY_ENTRY_TYPE, TimelineEntry.ENTRY_TYPE_IMAGE);
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

        entry.addMetadata(TimelineEntry.METADATA_KEY_USER_ID, hg_userId);
        entry.addMetadata(TimelineEntry.METADATA_KEY_LINK_URI, TimelineEntry.removeHash(linkUri));
        entry.setHash(TimelineEntry.getHash(linkUri));
        entry.addMetadata(TimelineEntry.METADATA_KEY_ENTRY_TYPE, TimelineEntry.ENTRY_TYPE_TEXT);
        entry.setMimeType("text/plain");

        entry.setLocalURI("data:text/plain;base64," + Base64.encode(text));

        return entry;
    }
    public static createUrlEntry(timeline_id: number, hg_userId: string, linkUri: string, url: string, title: string): TimelineEntry {
        var entry = new TimelineEntry(null, timeline_id);

        if (!(url.indexOf("http://")==0 || url.indexOf("https://")==0)) {
            url = "http://"+url;
        }

        entry.addMetadata(TimelineEntry.METADATA_KEY_USER_ID, hg_userId);
        entry.addMetadata(TimelineEntry.METADATA_KEY_LINK_URI, TimelineEntry.removeHash(linkUri));
        entry.setHash(TimelineEntry.getHash(linkUri));
        entry.addMetadata(TimelineEntry.METADATA_KEY_ENTRY_TYPE, TimelineEntry.ENTRY_TYPE_URL);
        entry.addMetadata("url", url);
        entry.addMetadata("title", title);
        entry.setMimeType("text/plain");

        entry.setLocalURI("data:text/plain;base64," + Base64.encode(url));

        return entry;
    }
    public static createThankYouNoteEntry(timeline_id: number, hg_userId: string, message: string): TimelineEntry {
        var entry = new TimelineEntry(null, timeline_id);

        entry.addMetadata(TimelineEntry.METADATA_KEY_USER_ID, hg_userId);
        entry.addMetadata(TimelineEntry.METADATA_KEY_ENTRY_TYPE, TimelineEntry.ENTRY_TYPE_THANK_YOU_NOTE);
        entry.setMimeType("text/plain");

        entry.setLocalURI("data:text/plain;base64," + Base64.encode(message));

        return entry;
    }

    
    public static createArtcodeShareEntry(timeline_id: number, hg_userId: string, linkUri: string): TimelineEntry {
        var entry = new TimelineEntry(null, timeline_id);

        entry.addMetadata(TimelineEntry.METADATA_KEY_USER_ID, hg_userId);
        //entry.addMetadata(TimelineEntry.METADATA_KEY_LINK_URI, TimelineEntry.removeHash(linkUri));
        //entry.setHash(TimelineEntry.getHash(linkUri));
        entry.addMetadata(TimelineEntry.METADATA_KEY_ENTRY_TYPE, TimelineEntry.ENTRY_TYPE_ARTCODE_SHARE_URL);
        entry.setMimeType("text/plain");

        entry.setLocalURI("data:text/plain;base64," + Base64.encode(""));

        return entry;
    }


    public static removeHash(uri: string): string {
        let pos = uri.lastIndexOf('#');
        if (pos == -1) {
          return uri;
        } else {
          return uri.substring(0, pos);
        }
      }
      private static getHash(uri: string): string {
        let pos = uri.lastIndexOf('#');
        if (pos == -1) {
          return "";
        } else {
          return uri.substring(pos+1);
        }
      }

}