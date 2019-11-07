import { Injectable } from '@angular/core';
import { GlobalUtils } from '../../objects/global-utils/global-utils';
import { AlertController } from 'ionic-angular';

// declare "Artcodes" so we can access the javascript object
declare var Artcodes;

@Injectable()
export class ArtcodesProvider {

  constructor(
    private alertCtrl: AlertController
  ) {
    console.log('Hello ArtcodesProvider Provider');
  }

  /**
   * Test if the native Artcodes plugin is available.
   * You can still call scan(), but it will allow the user to select from a list instead of scanning.
   * @returns true if the native Artcodes plugin is available.
   */
  public available() {
    if (GlobalUtils.isWebBuild()) {
      return false;
    }

    return Artcodes != null;
  }

  
  public scanPromise(experience: {}): Promise<string> {
    return new Promise<string>((resolve: (code:string)=>void, reject)=>{
      this.scan(experience, (code)=>{
        resolve(code);
      }, ()=>{
        reject("User canceled Artcode scan.");
      });
    });
  }

  public scan(
    experience: {}, 
    successCallback: (code: string)=>void, 
    cancelCallback: ()=>void
  ) {

    if (GlobalUtils.isWebBuild()) {
      this.scanBackup(experience, successCallback, cancelCallback);
    } else {
      try {
        // open Artcode scanner:
        Artcodes.scan(
          experience, 
          (code) => { 
            if (code.indexOf(':') < 0) {
              // iOS cancel string: "BACK"
              // Android cancel string: "Scan Failed"
              cancelCallback();
            } else {
              successCallback(code);
            }
          }
        );

      } catch (err) {
        console.error("There was a problem starting the Artcodes plugin.", err);
        this.scanBackup(experience, successCallback, cancelCallback);
      }
    }
  }

  private scanBackup(
    experience: {}, 
    successCallback: (code: string)=>void, 
    cancelCallback: ()=>void
  ) {
        // if Artcode plugin is not available (e.g. web browser debugging) show dialog for manual code entry:
        console.log("Artcodes native plugin was not available");

        if (experience == null || experience['actions'] == null) {
          let alert = this.alertCtrl.create({
            title: 'Enter Artcode',
            inputs: [
              {
                name: 'code',
                placeholder: 'Code'
              }
            ],
            buttons: [
              {
                text: 'Cancel',
                role: 'cancel',
                handler: data => {
                  cancelCallback();
                }
              },
              {
                text: 'Continue',
                handler: data => {
                  var code: string = data['code'];
                  if (code.indexOf(':') < 0) {
                    code = code.split('').join(':');
                  }
                  successCallback(code);
                }
              }
            ]
          });
          alert.present();
        } else {
          let alert = this.alertCtrl.create({
            title: 'Select Artcode',
            inputs: experience['actions'].map((a)=>{
              return {
                type: "radio", 
                label:a['codes'][0], 
                value:a['codes'][0], 
                checked: false
              };
            }),
            buttons: [
              {
                text: 'Cancel',
                role: 'cancel',
                handler: data => {
                  cancelCallback();
                }
              },
              {
                text: 'Continue',
                handler: data => {
                  var code: string = data;
                  if (code.indexOf(':') < 0) {
                    code = code.split('').join(':');
                  }
                  successCallback(code);
                }
              }
            ]
          });
          alert.present();
        }
  }

}
