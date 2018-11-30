# Artcodes Scanner Cordova Plugin

A simple plugin to scan Artcodes.


## Using
Install the plugin

    $ cordova plugin add https://github.com/horizon-institute/artcodes-cordova.git --save
    
or

    $ ionic plugin add https://github.com/horizon-institute/artcodes-cordova.git

Note: In iOS 10+ the user is asked for permission to use the camera the first time it is assessed. You can add a custom description for why you're using the camera that appears in the dialog box:

    $ cordova plugin add https://github.com/horizon-institute/artcodes-cordova.git --variable IOS_CAMERA_DESC_STRING="We use the camera to scan Artcodes." --save


To use:

```js
function yourFunction() {
	Artcodes.scan(
		{ name: "Scan screen title", actions: [{ codes: ["1:1:3:3:4"] }, { codes: ["1:1:2:4:4"] }] }, 
		function (code) { alert(code); }
	);
}

// like most plugins, Artcodes.scan(...) can only be called sometime after the deviceready event e.g.
document.addEventListener('deviceready', function () {
	yourFunction();
}, false);
```


## iOS Specific Setup Steps

To get it running in iOS, the ArtcodesScanner and SwiftyJSON frameworks must both to added to the embedded frameworks.
 - Open `platforms/ios/<projectname>.xcodeproj` in Xcode
 - In the tree on the left, select the root node, with the project name
 - In the general tab, scroll down to 'Embedded Binaries'
 - Using the +, add ArtcodesScanner.framework and SwiftyJSON.framework to Embedded Binaries.
 - In Xcode under 'Linked Frameworks and Libraries' remove duplicates.
 - You may also need to set the Build Setting 'Always Embed Swift Standard Libraries' to 'Yes' .
