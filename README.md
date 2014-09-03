PPnet
=====
# What is this?

"**We need something like Facebook, but just not Facebook.**"
*If you heard that from your client, or thought that yourself, PPnet might be for you.*


PPNet is a middleware that can be used to create a social network, either temporarily or permanently for a group of users.
It provides the functionality of social interactions in the digital world (like posting status messages and images) apart from the major, proprietary social networks (like Facebook). It is particularly useful for intra- or extranet based social networks since users maintain the sovereignty about their own data.

![image](http://content.screencast.com/users/dirkk1/folders/Jing/media/e41a8abf-325b-4bcf-91e3-55aa0d043d2b/00000276.png)

Watch this video to see what it can do:

[![ScreenShot](http://img.youtube.com/vi/DYPGQlC5SVA/0.jpg)](https://www.youtube.com/watch?v=DYPGQlC5SVA&feature=youtu.be)


This project is partly funded by the Europian Union through the [FI-CONTENT2](http://mediafi.org/) project which is part of [FI-PPP](https://www.fi-ppp.eu/) (It is called 'Social Network Enabler' [there](http://mediafi.org/open-platforms/) . We chose another name here on Github, because most people are not aware of the FI-PPP lingo).

Disclaimer: it was successfully tested in the [Cologne Carnival with poor network connectivity](http://mediafi.org/ficontent-open-source-social-network-enabler-tested-carnival-cologne/) in a small-scale experiment with less than hundred people. So, yes it works. But no, it's not ready yet. If you need something bigger, go for http://pump.io/ for the moment (but this is alpha).

# Team

PPnet is mainly developed by Tobias Rotter (@tobiasrotter) and Philipp Reinking (@PhilReinking); project lead is Dirk Krause (@dirkk0).

# PPnet 2.0

## Requirements PPnet 2.0 Installation

- [Node.js](http://nodejs.org/) (including NPM)
- Bower ('npm install -g bower')

## Ruby and Compass/Sass
- Install Ruby (for Windows: http://rubyinstaller.org/downloads/)
- Install Compass Gem: `gem install compass`


## Steps for running PPnet 2.0 as WebApp

- Checkout PPnet 2.0 Repository and "cd" into ppnet folder
```
git clone https://github.com/pixelpark/ppnet
cd ppnet
```

- Install all required NPM Packages
```
npm install
```

- Install all Bower dependencies
```
bower install
```

- Run Gulp

```
npm run gulp
```

## Build the Phonegap App

We use gulp for building an optimized version of the app-folder. The output is saved to the www-folder.

```
npm run build
```

Then phonegap is able to run its own build task:

```
phonegap build android
```

# PPnet 1.0

# Installation as a web application

There are just two components needed to get your own social network up and running:
* a [CouchDB](http://couchdb.apache.org/) database server (Version 1.3+)
* a simple webserver with the root directory pointing to the 'www' directory in this Git.

The application uses a [PouchDB](http://pouchdb.com/)/CouchDB replication to handle offline/online scenarios.


## Setting up the CouchDB

First, you need to [install it](http://docs.couchdb.org/en/latest/install/index.html) (this is not mandatory, but additionally you might want to install these [enhancements](https://github.com/dennishafemann/couchdb-futon-addons-log-stats-uuids). Once you did that, you can access the administration interface on http://yourip.com:5984 where you need to enable [CORS](http://en.wikipedia.org/wiki/Cross-origin_resource_sharing).

You do that by editing these values:

    http enable_cors   true
    cors credentials   true	
    headers            accept, authorization, content-type, origin, Cookie	
    methods            GET, PUT, POST, HEAD, DELETE	
    origins            *

The adminstration interface looks like this 
![admin](http://content.screencast.com/users/dirkk1/folders/Jing/media/2e3e556e-949d-44b6-8b6f-334ec59a7ecb/00000279.png)

If your CouchDB is not on a local machine, you need to edit the configfile (usually at `/usr/local/etc/couchdb`) and edit this line:

    [httpd]
    bind_address = 0.0.0.0

In case you want to change the database name and IP address, you need to change line 7 and 9 of ppnetDatabase.js:
* https://github.com/pixelpark/ppnet/blob/master/app/scripts/services/ppnetDatabase.js#L7-9
* https://github.com/pixelpark/ppnet/blob/master/www/scripts/services/ppnetDatabase.js#L7-9

Once you did that, you are good to go.

## Setting up the web server

The easiest way to do this is to
* clone or unzip this repository
* cd to the 'www' directory
* enter `python -m SimpleHTTPServer` (if your on Python 2.*) or `python3 -m http.server` for python3.

Then open a Chrome or a Firefox browser and browse to http://yourip.com:8000 and you should see the login screen:

![login](http://content.screencast.com/users/dirkk1/folders/Jing/media/9bdbf8b9-5856-4c8f-8b34-9255efe31161/00000272.png)

You can enter any name and any number and you are logged in.

The viewport to the map view is hardcoded to some place in Cologne.
You can change the Map-Viewport by changing the loadMapView-Function in the ViewController (ppmet/www/js/controller/view_controller.js - Lines 391-400). 
        
        394: map = L.map('map').setView([50.9188, 6.9242], 15);


# Create the Android application

Additionally, you can enjoy the benefits of having a native app, kudos to the [Phonegap](http://phonegap.com/) [/](http://phonegap.com/2012/03/19/phonegap-cordova-and-what%E2%80%99s-in-a-name/) [Cordova](https://cordova.apache.org/) project.

*Important*: since the app needs Chromium as the default engine, only KitKat (Android 4.4.2) is supported. If someone knows how to install Chromium with phonegap, give as a holler. You can, however, also use the Chrome browser on any Android.

To install Phonegap locally on a machine read the next chapter.
Alternatively you can also try a service like http://build.phonegap.com or http://www.telerik.com/appbuilder, but your mileage may vary.


## Local install

If you want to set up the software in its own directory, you can clone
the git repository, so:

    $ git clone https://github.com/pixelpark/ppnet
    $ cd ppnet

Add Android as a platform to cordova (I don't think you need to do that?):

    $ cordova platform add android
    
Add Plugins

    $ phonegap plugin add org.apache.cordova.device-orientation
    $ phonegap plugin add org.apache.cordova.file
    $ phonegap plugin add org.apache.cordova.file-transfer
    $ phonegap plugin add org.apache.cordova.device
    $ phonegap plugin add org.apache.cordova.camera
    $ phonegap plugin add org.apache.cordova.statusbar
    $ phonegap plugin add https://git-wip-us.apache.org/repos/asf/cordova-plugin-geolocation.git
    
Build Android APK

    $ phonegap build android
    
OR
    
Build Android APK and deploy to device

    $ phonegap run android

## Requirements

* NodeJS
* Java
* Ant
* Android SDK
* Phonegap

### Windows
* Install NodeJs
  http://nodejs.org/


* Install JDK (JRE is not sufficient)
  http://www.oracle.com/technetwork/java/javase/downloads/index.html
  (jdk-7u51-windows-x64.exe for win7/64bit)


* Create the environment variable `JAVA_HOME` and set it to your JDK directory. This should look similar to: "C:\Program Files\Java\jdk1.7.0_51"

* Add `%JAVA_HOME%\bin` to the environment variable `PATH`.


If everything worked out you can type `java -version` in a terminal and it should return the version number without errors.


* Install ANT
  http://ant.apache.org/manual/install.html
  (Kudos to [Tobias Seckinger](http://tobias-seckinger.de/2011/09/ant-unter-windows-7-installieren/))

* Move the content of the zip file to `c:\ant`.

* Add `c:\ant\bin` to the environment variable `PATH`:


* Create the environment variable `ANT_HOME` and set it to `C:\ant`.
* Create the environment variable `ANT_OPTS` and set it to `-Xmx256M`.

If everything worked out you can type `ant -version` in a terminal and it should return the version number without errors.



* Install Android SDK
  http://developer.android.com/sdk/

* Move the installation to C:\android.

* Create the environment variable `ANDROID_HOME` and set it to `c:\android\sdk`.

If everything worked out you can type `android -h` in a terminal and it should return the help text without errors.


### Ubuntu
On Ubuntu 12.04 this should be:

    #install latest node
	sudo add-apt-repository --yes ppa:chris-lea/node.js
	sudo apt-get update
	sudo apt-get install --yes nodejs
	 
	# java
	sudo apt-get -y install openjdk-7-jdk
	export JAVA_HOME=/usr/lib/jvm/java-7-openjdk-amd64
	export PATH=${PATH}:${JAVA_HOME}/bin
	 
	# ant
	sudo apt-get --yes install ant
	 
	# Android SDK
	wget http://dl.google.com/android/android-sdk_r20-linux.tgz
	tar -xvzf android-sdk_r20-linux.tgz
	 
	export PATH=${PATH}:~/android-sdk-linux/tools
	export PATH=${PATH}:~/android-sdk-linux/platform-tools
	 
	sudo apt-get -y install expect
	 
	# install packages, for reference see:
	#   android list sdk --all
	 
	# install Platform-tools (2)
	expect -c '
	set timeout -1   ;
	spawn android update sdk -u -a -t 2; 
	expect { 
	    "Do you accept the license" { exp_send "y\r" ; exp_continue }
	    eof
	}
	'
	 
	# install Tools (1)
	expect -c '
	set timeout -1   ;
	spawn android update sdk -u -a -t 1; 
	expect { 
	    "Do you accept the license" { exp_send "y\r" ; exp_continue }
	    eof
	}
	'
	 
	# install Build-tools (3)
	expect -c '
	set timeout -1   ;
	spawn android update sdk -u -a -t 3; 
	expect { 
	    "Do you accept the license" { exp_send "y\r" ; exp_continue }
	    eof
	}
	'
	 
	# install 4.4.2 (10) a.k.a. KitKat
	expect -c '
	set timeout -1   ;
	spawn android update sdk -u -a -t 12; 
	expect { 
	    "Do you accept the license" { exp_send "y\r" ; exp_continue }
	    eof
	}
	'
	 
	# install 32-bit dependencies
	# http://sixarm.com/about/ubuntu-apt-get-install-ia32-for-32-bit-on-64-bit.html
	sudo apt-get install -y lib32gcc1 libc6-i386 lib32z1 lib32stdc++6
	sudo apt-get install -y lib32ncurses5 lib32gomp1 lib32z1-dev lib32bz2-dev
	sudo apt-get install -y g++-multilib
	 
	# phonegap
	sudo npm install -g phonegap
	 
	sudo apt-get -y install git


### Version History

##### v0.1: 2/28/2014

Initial Release.
- Working system.
- Three views.
- Offline Support.

##### v0.2: 5/2/2014

Second Release.
- Bower and npm support
- refactored, cleaner code base
