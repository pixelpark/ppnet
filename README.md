PPnet
=====

### Local install

If you want to set up the software in its own directory, you can clone
the git repository, so:

    $ git clone https://github.com/pixelpark/ppnet
    $ cd ppnet

Add Android as a platform to cordova:

    $ cordova platform add android
    
Add Plugins

    $ cordova plugin add org.apache.cordova.device-orientation
    $ cordova plugin add org.apache.cordova.geolocation
    
Build Android APK

    $ cordova build android
    
OR
    
Build Android APK and deploy to device

    $ cordova run android

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

    cd ~/android-sdk-linux/tools

    export PATH=${PATH}:~/android-sdk-linux/tools
    export PATH=${PATH}:~/android-sdk-linux/platform-tools

    # install 32-bit dependencies
    # http://sixarm.com/about/ubuntu-apt-get-install-ia32-for-32-bit-on-64-bit.html
    sudo apt-get install -y lib32gcc1 libc6-i386 lib32z1 lib32stdc++6
    sudo apt-get install -y lib32ncurses5 lib32gomp1 lib32z1-dev lib32bz2-dev
    sudo apt-get install -y g++-multilib

    # phonegap
    sudo npm install -g phonegap


