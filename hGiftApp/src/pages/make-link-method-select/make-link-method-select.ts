import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Platform } from 'ionic-angular';

import { NFC, Ndef, NdefTag, NdefRecord } from '@ionic-native/nfc';
import { Subscription } from 'rxjs/Subscription';
import { QrCodeScannerPage } from '../qr-code-scanner/qr-code-scanner';

// declare "Artcodes" so we can access the javascript object
declare var Artcodes;


@IonicPage()
@Component({
  selector: 'page-make-link-method-select',
  templateUrl: 'make-link-method-select.html',
})
export class MakeLinkMethodSelectPage {

  private callback: (linkType: string, uri: string) => void = null;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private nfc: NFC, private ndef: Ndef,
    private zone: NgZone,
    private alertCtrl: AlertController,
    public plt: Platform
  ) {
    this.callback = this.navParams.get('callback');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MakeLinkMethodSelectPage');
  }

  public ionViewWillEnter() { 
    // Runs when the page is about to enter and become the active page.

    this.nfcCheck();
  }

  public ionViewWillLeave() {
    // Runs when the page is about to leave and no longer be the active page.

    this.closeNfc();
  }

  private makeLinkQRCode() {
    this.navCtrl.push(QrCodeScannerPage, { callback: (uri:string)=>{
      this.callback("qrcode", uri);
      this.navCtrl.pop();
    } });
  }

  private userEnteredCode: string;
  private makeLinkArtcode() {
    let alert = this.alertCtrl.create({
      title: 'Enter the Artcode you have drawn',
      inputs: [
        {
          name: 'code',
          placeholder: 'e.g. 11244'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            //this.handleArtcodeScanResult("BACK");
          }
        },
        {
          text: 'Continue',
          handler: data => {
            var code: string = data['code'];
            if (code.indexOf(':') < 0) {
              var codeArray = code.split('');
              codeArray.sort();
              code = codeArray.join(':');
            }
            this.userEnteredCode = code;
            this.openScan(code);
          }
        }
      ]
    });
    alert.present();
    
  }

  private openScan(codeToVerify: string) {
    let this_ = this;

    var scanExperience = {};
    scanExperience['id'] = "id";


    scanExperience['actions'] = [{"codes": [codeToVerify], "name": "Continue"}];
    scanExperience['name'] = "";
    scanExperience['animationName'] =  "";
    scanExperience['pipeline'] = ["tile", "detect"];
    scanExperience['focusMode'] = "tapToFocus";
    scanExperience['requestedAutoFocusMode'] = "tapToFocus";
    
    scanExperience['foregroundColor'] = "#FFFFFF";
    scanExperience['backgroundColor'] = "#3F4C6B";
    scanExperience['highlightBackgroundColor'] = "#FFFFFF";
    scanExperience['highlightForegroundColor'] = "#3F4C6B";
    scanExperience['openWithoutUserInput'] = true;
    scanExperience['scanScreenTextTitle'] = "Try scanning your Artcode";
    scanExperience['scanScreenTextDesciption'] = "Tip: make sure the whole image is inside the screen below";
    
    let fn = ()=>{
      try {
        // open Artcode scanner:
        Artcodes.scan(
          scanExperience, 
          function (code) { this_.handleArtcodeScanResult(code); }
        );

      } catch (err) {
        // if Artcode plugin is not available (e.g. web browser debugging) show dialog for manual code entry:
        console.log("Artcodes failed.",[err]);
        let alert = this.alertCtrl.create({
          title: 'Artcodes error',
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
                this.handleArtcodeScanResult("BACK");
              }
            },
            {
              text: 'Continue',
              handler: data => {
                var code: string = data['code'];
                if (code.indexOf(':') < 0) {
                  code = code.split('').join(':');
                }
                this.handleArtcodeScanResult(code);
              }
            }
          ]
        });
        alert.present();
      }
    };
    fn();
  }

  private handleArtcodeScanResult(code: string) {

    console.log("code = "+code);

    if (code == this.userEnteredCode) {
      this.callback("artcode", "?code="+code);
      this.navCtrl.pop();
    }

  }

  // NFC methods:

  private nfcIsSupported = false;
  private nfcIsEnabled = false;
  private nfcSubscriber: Subscription = null;

  private nfcCheck() {
    this.nfc.enabled().then(()=>{
      this.zone.run(()=>{
        document.body.classList.add('nfcSupported');
        this.nfcIsSupported = this.nfcIsEnabled = true;
      });
    }).catch((reason)=>{
      this.zone.run(()=>{
        document.body.classList.add('nfcNotSupported');
        if (reason == "NO_NFC") {
          this.nfcIsSupported = this.nfcIsEnabled = false;
        } else if (reason == "NFC_DISABLED") {
          this.nfcIsSupported = true; 
          this.nfcIsEnabled = false;
        } else {
          console.log("NFC is not available: "+JSON.stringify(reason));
        }
      });
    });
  }

  private closeNfc() {
    if (this.nfcSubscriber != null) {
      console.log("Closing nfcSubscriber (ionViewWillLeave)");
      this.nfcSubscriber.unsubscribe();
      this.nfcSubscriber = null;
    }
    if (this.androidNfcAlert != null) {
      this.androidNfcAlert.dismiss();
    }
  }

  private androidNfcAlert = null;
  /**
   * Read a URI from an NFC tag.
   * @param callback Function to pass the URI to (only called if there is a URI, nothing happens if user cancels).
   */
  private makeLinkNFCTag() {
    if (!this.nfcIsSupported) {
      let alert = this.alertCtrl.create({
        title: 'NFC not supported',
        subTitle: 'NFC is not supported on this device.',
        buttons: ['Dismiss']
      });
      alert.present();
    } else if (!this.nfcIsEnabled) {
      let alert = this.alertCtrl.create({
        title: 'NFC is turned off',
        message: 'Please turn NFC on in settings to use NFC.',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Settings',
            handler: () => {
              console.log('Settings clicked');

              this.nfc.showSettings();
            }
          }
        ]
      });
      alert.present();
    } else {

      let nfcSessionFn = ()=>{
        console.log("NFC: Session started");

        if (this.nfcSubscriber == null) {
          console.log("Creating nfcSubscriber");
          this.nfcSubscriber = this.nfc.addNdefListener(() => {
            console.log('successfully attached ndef listener');

            if (this.plt.is('android')) {
              this.androidNfcAlert = this.alertCtrl.create({
                title: 'Tap NFC tag now',
                subTitle: 'Tap the back of your device against the NFC tag on your gift.',
                buttons: ['Dismiss']
              });
              this.androidNfcAlert.present();
            }
          }, (err) => {
            console.log('error attaching ndef listener' + JSON.stringify(err));
          }).subscribe((event) => {
            let thisNdefTag: NdefTag = event.tag;
            let thisNdefRecord: NdefRecord[] = thisNdefTag.ndefMessage;
            for (var i=0; i<thisNdefRecord.length; ++i) {
              let record: NdefRecord = thisNdefRecord[i];

              if (window['util'].isType(record, window['ndef'].TNF_WELL_KNOWN, window['ndef'].RTD_URI)) {
                let str = window['ndef'].uriHelper.decodePayload(record.payload);
                console.log(i+": "+str);
                console.log("Closing nfcSubscriber");
                this.nfcSubscriber.unsubscribe();
                this.nfcSubscriber = null;
                this.callback("nfc", str);
                this.navCtrl.pop();
              } else {
                alert("Not a valid NFC tag.");
              }

            }
            window['nfc'].invalidateSession();
          });
        } else {
          console.log("nfcSubscriber already exists");
        }
      };

      if (this.plt.is('ios')) {
        window['nfc'].beginSession(nfcSessionFn, ()=>{
          alert("NFC: Unable to start session");
        });
      } else {
        nfcSessionFn();
      }
    }
  }
}
