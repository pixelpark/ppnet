PPnet
=====

### Local install

If you want to set up the software in its own directory, you can clone
the git repository, so:

    $ git clone https://github.com/pixelpark/ppnet
    $ cd ppnet

Add Android as a platform to cordova (I don't think you need to do that?):

    $ cordova platform add android
    
Add Plugins

    $ phonegap plugin add org.apache.cordova.device-orientation
    $ phonegap plugin add org.apache.cordova.geolocation
    
Build Android APK

    $ phonegap build android
    
OR
    
Build Android APK and deploy to device

    $ phonegap run android

### Requirements

* NodeJS
* Java
* Ant
* Android SDK
* Phonegap

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
	spawn android update sdk -u -a -t 10; 
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
