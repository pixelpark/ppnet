PPnet
=====

### Local install

If you want to set up the software in its own directory, you can clone
the git repository, so:

    git clone https://github.com/pixelpark/ppnet
    cd ppnet

Add Android as a platform to cordova:

    $ cordova platform add android
    
Add Plugins

    $ cordova plugin add org.apache.cordova.device-orientation
    $ cordova plugin add org.apache.cordova.geolocation
    
Build Android APK

    cordova build android
    
OR
    
Build Android APK and deploy to device

    cordova run android
