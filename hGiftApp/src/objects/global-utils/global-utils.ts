import { AlertController, LoadingController, Loading } from 'ionic-angular';

export class GlobalUtils {

    constructor() {
    }

    public static isWebBuild(): boolean {
        return true;
    }


    public static simpleAlert(alertCtrl :AlertController, title: string, message: string, buttonText: string="OK") {
        const alert = alertCtrl.create({
            title: title,
            subTitle: message,
            buttons: [buttonText]
          });
          alert.present();
    }



    private static loadingObj: Loading = null;
    private static loadingCount = 0;
    public static simpleLoadingShow(loadingCtrl: LoadingController, message: string="Please wait...") {
        GlobalUtils.loadingCount += 1;
        setTimeout(()=>{
            if (GlobalUtils.loadingObj == null && GlobalUtils.loadingCount > 0) {
                GlobalUtils.loadingObj = loadingCtrl.create({content:message});
                GlobalUtils.loadingObj.present();
            }
        }, 150);
    }

    public static simpleLoadingDismiss() {
        GlobalUtils.loadingCount -= 1;
        let loading = GlobalUtils.loadingObj;
        if (GlobalUtils.loadingCount <=0 && loading != null) {
            GlobalUtils.loadingObj.dismiss();
            GlobalUtils.loadingObj = null;
        }
    }

}