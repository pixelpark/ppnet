

## Building the project
These steps project lead you to the required steps to build the `www` folder that contains the web application.

### Requirements
- Ruby ([for Windows](http://rubyinstaller.org/downloads/))
- [Compass](http://compass-style.org/): ```gem install compass```
- [Node.js](http://nodejs.org/) (including NPM)
- Gulp ```npm install -g gulp``` (maybe with sudo)
- Bower ```npm install -g bower``` (maybe with sudo)

### Installation
1. Checkout PPnet 2.0 Repository ```git clone https://github.com/pixelpark/ppnet``` 
2. Switch into ppnet folder ```cd ppnet```
3. Install required NPM Packages ```npm install```
4. Install Bower dependencies ```bower install```
	- If you have to decide between different angular versions, use angular version 1.3.14.
5. Run Gulp ```gulp```

## Build the Phonegap/Cordova App

### Requirements

- NodeJS
- [Java JDK](http://www.oracle.com/technetwork/java/javase/downloads/index.html)
	- JRE is not sufficient
	- Win7/64bit: jdk-7u51-windows-x64.exe
- Ant
- Android SDK / Xcode
- Phonegap

**The project must be build.**

### Steps

We use gulp for building an optimized version of the app-folder. The output is saved to the www-folder.

*Important*: since the app needs Chromium as the default engine, only KitKat (Android  >= 4.4.2) is supported. You can, however, also use the Chrome browser on any Android.

1. ```cd /PATH/TO/ppnet/```

2. Add Android as a platform to cordova (I don't think you need to do that?):

	```
	cordova platform add android
	cordova platform add ios
	```

3. Add Plugins

	```
	phonegap local plugin add org.apache.cordova.device-orientation
	phonegap local plugin add org.apache.cordova.file
	phonegap local plugin add org.apache.cordova.file-transfer
	phonegap local plugin add org.apache.cordova.device
	phonegap local plugin add org.apache.cordova.camera
	phonegap local plugin add org.apache.cordova.statusbar
	phonegap local plugin add https://git-wip-us.apache.org/repos/asf/cordova-plugin-geolocation.git
	```

4. Build Android APK

	```
	phonegap build android
	```
	    
	Or build Android APK and deploy to device

	```
	phonegap run android
	```

### Install Java/Ant on Windows
- [Create the environment variable](http://docs.oracle.com/cd/E19182-01/820-7851/inst_cli_jdk_javahome_t/index.html) `JAVA_HOME` and set it to your JDK directory. This should look similar to: "C:\Program Files\Java\jdk1.7.0_51"
- Add `%JAVA_HOME%\bin` to the environment variable `PATH`.

If everything worked out you can type `java -version` in a terminal and it should return the version number without errors.


- Install ANT
  http://ant.apache.org/manual/install.html
  (Kudos to [Tobias Seckinger](http://tobias-seckinger.de/2011/09/ant-unter-windows-7-installieren/))
- Move the content of the zip file to `c:\ant`.
- Add `c:\ant\bin` to the environment variable `PATH`:
- Create the environment variable `ANT_HOME` and set it to `C:\ant`.
- Create the environment variable `ANT_OPTS` and set it to `-Xmx256M`.

If everything worked out you can type `ant -version` in a terminal and it should return the version number without errors.


- Install Android SDK
  http://developer.android.com/sdk/
- Move the installation to C:\android.
- Create the environment variable `ANDROID_HOME` and set it to `c:\android\sdk`.

If everything worked out you can type `android -h` in a terminal and it should return the help text without errors.

### Install Java/Ant on Ubuntu
On Ubuntu you can do it with this [script](https://gist.github.com/dirkk0/8414616) (old version [here](https://gist.github.com/teawithfruit/a2aae72e399d31e0898f) ).

## Setting up CouchDB
First, you need to [install it](http://docs.couchdb.org/en/latest/install/index.html) (this is not mandatory, but additionally you might want to install these [enhancements](https://github.com/dennishafemann/couchdb-futon-addons-log-stats-uuids). Once you did that, you can access the administration interface on http://yourip.com:5984 where you need to enable [CORS](http://en.wikipedia.org/wiki/Cross-origin_resource_sharing).

You do that by editing these values:

    httpd enable_cors  true
    cors credentials   true	
    cors headers       accept, authorization, content-type, origin, Cookie	
    cors methods       GET, PUT, POST, HEAD, DELETE	
    cors origins       *


If your CouchDB is not on a local machine, you need to edit the configfile (usually at `/usr/local/etc/couchdb`) and edit this line:

    [httpd]
    bind_address = 0.0.0.0

To connect the web app to your own database, you only need to change the `remote`entry in  [config file](https://github.com/pixelpark/ppnet/blob/master/www/config.json#L6) located in the www-folder.

Once you did that, you are good to go.
