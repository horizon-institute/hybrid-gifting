import { Injectable } from '@angular/core';

import { Storage } from '@ionic/storage';

/**
 * This provide handle the memerable names a user assigns to gifts.
 * The data (names) is stored locally and never sent to the server.
 */

@Injectable()
export class GiftNamesProvider {

  constructor(private storage: Storage) {
    console.log('Hello GiftNamesProvider Provider');
  }

  private static GIFT_NAME_MAP_KEY = 'HG_OFFLINE_GIFT_NAMES';

  private static DEFAULT_GIFT_NAMES_MAP = {};

  private debug: boolean = false;

  public getGiftName(giftId): Promise<string> {
    if (this.debug) console.log("Getting gift name for "+giftId);
    return this.getGiftNameMap().then((giftMap)=>{
      return new Promise<string>((resolve, reject)=>{
        let giftName: string = giftMap[giftId];
        resolve(giftName);
      });
    });
  }
  public setGiftName(giftId, giftName: string): Promise<void> {
    if (this.debug) console.log("Setting gift name for "+giftId+" = "+giftName);
    return new Promise<void>((resolve, reject)=>{
      this.getGiftNameMap().then((giftMap)=>{
        giftMap[giftId] = giftName;
        this.saveGiftNameMap(giftMap).then((value)=>{
          resolve();
        }).catch((reason)=>{
          reject(reason);
        });
      }).catch((reason)=>{
        reject(reason);
      });
    });
  }
  public switchGiftName(oldGiftId, newGiftId): Promise<void> {
    return new Promise<void>((resolve, reject)=>{
      this.getGiftNameMap().then((giftMap)=>{
        let giftName: string = giftMap[oldGiftId];
        delete giftMap[oldGiftId];
        giftMap[newGiftId] = giftName;
        this.saveGiftNameMap(giftMap).then((value)=>{
          resolve();
        }).catch((reason)=>{
          reject(reason);
        });
      }).catch((reason)=>{
        reject(reason);
      });
    });
  }
  public getGiftNameMap(): Promise<{}> {
    return new Promise<{}>((resolve, reject)=>{
      this.storage.get(GiftNamesProvider.GIFT_NAME_MAP_KEY).then((value)=>{
        if (value==null || value=="") {
          this.storage.set(GiftNamesProvider.GIFT_NAME_MAP_KEY, JSON.stringify(GiftNamesProvider.DEFAULT_GIFT_NAMES_MAP)).then((value)=>{
            if (this.debug) console.log("Setting gift name map: "+JSON.stringify(GiftNamesProvider.DEFAULT_GIFT_NAMES_MAP));
            resolve(GiftNamesProvider.DEFAULT_GIFT_NAMES_MAP);
          }, (reason)=>{
            console.error("GiftNamesProvider: Failed to save gift name map.", reason);
            reject(reason);
          });
        } else {
          if (this.debug) console.log("Returning gift name map: "+value);
          resolve(JSON.parse(value));
        }
      }, (reason)=>{
        console.error("GiftNamesProvider: Failed to get gift name map.", reason);
        reject(reason);
      });
    });
  }

  public saveGiftNameMap(giftMap: {}): Promise<{}> {
    return new Promise<{}>((resolve, reject)=>{
      if (this.debug) console.log("Saving gift name map: "+JSON.stringify(giftMap));
      this.storage.set(GiftNamesProvider.GIFT_NAME_MAP_KEY, JSON.stringify(giftMap)).then((value)=>{
        resolve(giftMap);
      }, (reason)=>{
        console.error("GiftNamesProvider: Failed to save gift name map.", reason);
        reject(reason);
      });
    });
  }

}
