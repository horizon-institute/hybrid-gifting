import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner';

@IonicPage()
@Component({
  selector: 'page-qr-code-scanner',
  templateUrl: 'qr-code-scanner.html',
})
export class QrCodeScannerPage {

  private callback: (uri:string)=>void = null;
  private scanSub = null;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private qrScanner: QRScanner,
    private zone: NgZone
  ) {
    this.callback = this.navParams.get('callback');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad QrCodeScannerPage');
  }
  public ionViewWillEnter() { 
    // Runs when the page is about to enter and become the active page.
  }
  public ionViewDidEnter() {
    // Runs when the page has fully entered and is now the active page. This 
    // event will fire, whether it was the first load or a cached page.
    this.readQR();
  }
  public ionViewWillLeave() {
    // Runs when the page is about to leave and no longer be the active page.
    this.zone.run(()=>{
      if (this.scanSub != null) {
        this.scanSub.unsubscribe(); // stop scanning
      }
      this.qrScanner.hide(); // hide camera preview
      document.getElementsByTagName("html")[0].classList.remove('transparentUI');
      this.qrScanner.destroy();
    });
  }
  public ionViewDidLeave() {
    // Runs when the page has finished leaving and is no longer the active page.
  }
  public ionViewWillUnload() {
    // Runs when the page is about to be destroyed and have its elements removed.
  }


  private readQR() {
    console.log("readQR()");
    // Optionally request the permission early
    this.qrScanner.prepare()
    .then((status: QRScannerStatus) => {
      if (status.authorized) {
        // camera permission was granted

        console.log("camera permission was granted"); 


        // start scanning
        this.scanSub = this.qrScanner.scan().subscribe((text: string) => {
          //alert('Scanned something: ' + text);
          this.scanSub.unsubscribe(); // stop scanning
          this.navCtrl.pop();
          this.callback(text);
        });
        this.zone.run(()=>{
          this.qrScanner.show();
          document.getElementsByTagName("html")[0].classList.add('transparentUI');
          setTimeout(()=>{ window.scroll(1,1) }, 1); // hack to get iOS to update the transparent background;
        });

      } else if (status.denied) {
        // camera permission was permanently denied
        // you must use QRScanner.openSettings() method to guide the user to the settings page
        // then they can grant the permission from there
        console.log("camera permission was permanently denied"); 
      } else {
        // permission was denied, but not permanently. You can ask for permission again at a later time.
        console.log("permission was denied, but not permanently"); 
      }
    })
    .catch((e: any) => console.log('Error is', e));
  }

}
