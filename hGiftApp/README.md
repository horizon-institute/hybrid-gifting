# Hybrid Gifting app

![alt text](https://github.com/horizon-institute/hybrid-gifting/raw/master/hGiftApp/resources/ios/icon/icon-60.png "Icon")

## Data storage

Timelines and timeline entries are stored locally as JSON in a key/value storage framework.
The JSON schema is the same as on the Chronicle server except with additional local storage only fields. 
Timeline entry content can either be stored inline as a base64 uri (text or images to be uploaded) or as a file (images downloaded).

## Plugins

This app uses a number of plugins for functionality:

 - General:
   - Key/value storage: [@ionic/storage](https://ionicframework.com/docs/storage/)
   - HTTP: [cordova-plugin-advanced-http](https://github.com/silkimen/cordova-plugin-advanced-http) / [@ionic-native/http](https://ionicframework.com/docs/native/http/)
     - Use this plugin as opposed to AJAX as native calls are not subject to cross site restrictions.
   - Files: [cordova-plugin-file](https://github.com/apache/cordova-plugin-file)
   - Opening links in system browser: [cordova-plugin-inappbrowser](https://github.com/apache/cordova-plugin-inappbrowser)

 - Object identification:
   - QR Codes: [cordova-plugin-qrscanner](https://github.com/bitpay/cordova-plugin-qrscanner)
     - This does not work great on Android.
   - NFC: [phonegap-nfc](https://github.com/chariotsolutions/phonegap-nfc)
   - Artcodes (customised version)
   
 - Media creation/selection:
   - Record video: ???
   - Record audio: ???
   - Take photo: ???
   - Select video: ???
   - Select audio: ???
   - Select photo: cordova-plugin-camera (tip: don't use cordova-*-imagepicker; it doesn't appear to be maintained anymore)

## iOS Tips

- If you get provisioning profile errors (or similar) use legacy build mode (File -> Workspace Settings).

## TODO

- Integrate with Chronicle security.
- Add other media types.
