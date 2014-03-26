PPnet
=====
# What is this?
PPNet is a middleware that can be used to create a social network, either temporarily or permanently for a group of users.
It provides the functionality of social interactions in the digital world (like posting status messages and images) apart from the major, proprietary social networks (like Facebook). It is particularly useful for intra- or extranet based social networks since users maintain the sovereignty about their own data.

Watch this video to see what it can do:
[![ScreenShot](http://content.screencast.com/users/dirkk1/folders/Jing/media/df46601f-0fe6-4a43-a337-0a44ce5184bb/00000273.png)](https://www.youtube.com/watch?v=DYPGQlC5SVA&feature=youtu.be)

This project is partly funded by the Europian Union through the [FI-CONTENT2](http://mediafi.org/) project.

# Installation

There are just two components needed to get your own social network up and running:
* a [CouchDB](http://couchdb.apache.org/) database server
* a simple webserver with the root directory pointing to the 'www' directory in this Git.

## Setting up the CouchDB

First, you need to [install it](http://docs.couchdb.org/en/latest/install/index.html) (this is not mandatory, but additionally you might want to install these [enhancements](https://github.com/dennishafemann/couchdb-futon-addons-log-stats-uuids). Once you did that, you can access the administration interface on http://yourip.com:5984 where you need to enable [CORS](http://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
You do that by editing these values:

    http enable_cors   true
    cors credentials   true	
    headers            accept, authorization, content-type, origin, Cookie	
    methods            GET, PUT, POST, HEAD, DELETE	
    origins            *

(The adminstration interface looks like [this](http://couchdb.simple-url.com:5984/_utils/config.html) )

If your CouchDB is not on a local machine, you need to edit the configfile (usually at `/usr/local/etc/couchdb`) and edit this line:

    [httpd]
    bind_address = 0.0.0.0
    
Once you did that, you are good to go.

## Setting up the web server

The easiest way to do this is to
* clone or unzip this repository
* cd to the 'www' directory
* enter `python -m SimpleHTTPServer` (if your on Python 2.*) or `python3 -m http.server`for python3.

Then open a Chrome or a Firefox browser and browse to http://yourip.com:8000 and you should see the login screen:
[login](http://content.screencast.com/users/dirkk1/folders/Jing/media/9bdbf8b9-5856-4c8f-8b34-9255efe31161/00000272.png)

You can enter any name and any number and you are logged in.







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
