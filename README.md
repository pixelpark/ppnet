PPnet
=====
# What is this?

"**We need something like Facebook, but just not Facebook.**"
*If you heard that from your client, or thought that yourself, PPnet might be for you.*

Create and host your own social network. With some simple steps you can get it in less then 15 minutes.
This project is partly funded by the Europian Union through the [FI-CONTENT](http://mediafi.org/?portfolio=social-network).

# Version 2.0
PPnet is built as a single page application (SPA) in the JavaScript framework AngularJS, and uses a PouchDB/CouchDB combination for data synchronisation. The nice thing about this architecture is that you only need a CouchDB as a server side component (plus a simple HTTP Server) and that it works in online/offline mode.

# Installation

## tl;dr
### Build the project
```
gem install compass
git clone https://github.com/pixelpark/ppnet
cd ppnet
npm install -g gulp bower
npm install
bower install
gulp
```

### Build the Phonegap/Cordova App
**The project must be build.**

```
gulp build

cordova platform add android
cordova platform add ios

phonegap local plugin add org.apache.cordova.device-orientation
phonegap local plugin add org.apache.cordova.file
phonegap local plugin add org.apache.cordova.file-transfer
phonegap local plugin add org.apache.cordova.device
phonegap local plugin add org.apache.cordova.camera
phonegap local plugin add org.apache.cordova.statusbar
phonegap local plugin add https://git-wip-us.apache.org/repos/asf/cordova-plugin-geolocation.git

phonegap build android
phonegap run android
```
## Docker
If you are familiar with [Docker](https://www.docker.com/), you are just one step away from your PPnet running - [you will find it in this README](https://github.com/pixelpark/ppnet/blob/master/server/DOCKER.MD).

It should be noted that we built the Docker environment in collaboration with the friendly people from [Giant Swarm](https://giantswarm.io/). Their startup is based on the idea of handling Docker containers in a simple way.

## Steps for a simple quickstart

If you don't want to go through the hassle of installing development tools you can test PPnet by following these steps:

1. simply [download the zip file of this repository](https://github.com/pixelpark/ppnet/archive/master.zip),
2. navigate to the www directory (`cd www`)
3. start a web server right there (`python -m SimpleHTTPServer` or `python3 -m http.server `)
4. Navigate to ```http://localhost:8000```

You should see PPnet with that latest entries of our test database.

To connect to your own database, you only need to change the `remote`entry in the [config file](https://github.com/pixelpark/ppnet/blob/master/www/config.json#L6) to a running, CORS enabled CouchDB.
Changing this is the minimum thing you want to do to create your own database for your own social network. You will want to change the other entries too, to change the name of the application, the default location and so forth.

#Server / Proxy
If you want to run PPnet behind a Proxy, especially the connection to the CouchDB, you should use server.js. You find the file and a readme in the folder "server".

#Video
There is a somewhat [outdated video of PPnet in action](https://www.youtube.com/watch?v=DYPGQlC5SVA&feature=youtu.be) which will updated soon.

# Build
You can find more build instructions [here](https://github.com/pixelpark/ppnet/blob/master/BUILD.md).
# Team
- Tobias Rotter ([@tobiasrotter](https://github.com/tobiasrotter)) 
- Philipp Reinking ([@PhilReinking](https://github.com/PhilReinking))
- Dirk Krause ([@dirkk0](https://github.com/dirkk0))
- Daniel Pritzkau ([@teawithfruit](https://github.com/teawithfruit))
- Markus Neuy ([@markusneuy](https://github.com/markusneuy))
