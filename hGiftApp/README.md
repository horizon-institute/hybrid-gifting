# Hybrid Gifting app

![alt text](https://github.com/horizon-institute/hybrid-gifting/raw/master/hGiftApp/resources/ios/icon/icon-60.png "Icon")

## Data storage

Timelines and timeline entries are stored locally as JSON in a key/value storage framework.
The JSON schema is the same as on the Chronicle server except with additional local storage only fields. 
Timeline entry content can either be stored inline as a base64 uri (text or images to be uploaded) or as a file (images downloaded).

For the website version content is always stored as a base64 uri but the field is not saved to local storage; it is downloaded every time.

Timelines and timeline entries are stored with temporary IDs before they are uploaded to Chronicle (negative numbers and UUIDs respectively). When uploaded these are swaped for the IDs Chronicle uses.

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

## Licence

The source code for this application is provided under MIT licence. This only includes items under the `hGiftApp` directory of this repository (the parent of this `README.md` file). Any plugins hosted in this repository will have their own licence and terms. [Images are provided under separate licences, click here for details or see the `images` directory in the root of this repository.](../images/)

Copyright 2019 University of Nottingham

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

