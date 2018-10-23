import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Storage } from '@ionic/storage';
import { v4 as uuid } from 'uuid';

/*
  Generated class for the UserIdProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class UserIdProvider {

  constructor(private storage: Storage) {
    console.log('Hello UserIdProvider Provider');
  }

  private static USER_ID_KEY = 'HG_USER_ID';

  public getUserId(): Promise<string> {
    return new Promise<string>((resolve, reject)=>{
      this.storage.get(UserIdProvider.USER_ID_KEY).then((value)=>{
        if (value==null || value=="") {
          // generate new user id
          let userId = uuid();
          this.storage.set(UserIdProvider.USER_ID_KEY, userId).then((value)=>{
            resolve(userId);
          }, (reason)=>{
            console.error("UserIdProvider: Failed to get user ID from storage.", reason);
            reject(reason);
          });
        } else {
          resolve(value);
        }
      }, (reason)=>{
        console.error("UserIdProvider: Failed to save new user ID.", reason);
        reject(reason);
      });
    });
  }

}
