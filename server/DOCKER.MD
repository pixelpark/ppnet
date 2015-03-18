## Swarming a PPnet Social Network Site

### Table of Contents
* [Introduction](#introduction)
* [Prerequisites](#prerequisites)
* [Video](#video-walkthrough) 
* [Makefile Code](#checkout-the-code)
* [Quick Install Using Makefile](#quick-install)
* [Step by Step Install](#one-step-at-a-time-install)
* [Testing](#testing)

### Introduction
[PPnet](https://github.com/pixelpark/ppnet) provides a simple way to get your own social network site up and running in a matter of minutes. It leverages [Docker](http://docker.io) to create containers and [Giant Swarm](http://giantswarm.io) to run the containers in the cloud.

### Prerequisites

1. An OSX based machine.
2. A [Giant Swarm](https://giantswarm.io/) account.
3. A function install of [boot2docker](https://github.com/kordless/boot2docker-ing).

### Video Walkthrough

Here's a great video where I'm out-of-breath from being so excited about being over in Cologne, Germany. Ignore the fact I'm sweating a bit from running up the stairs.

[![](https://raw.githubusercontent.com/kordless/boot2docker-ing/master/assets/video.png)](https://vimeo.com/120645766)

### Checkout the Code

You can checkout the code by doing the following:

    git clone hhttps://github.com/pixelpark/ppnet.git

Change into the server sub-directory:

	cd ppnet/server
	
### Quick Install

If you just want to get to it, just swarm it up!

```
$ make swarm-up
``` 

Your social site will be available from:
	
    http://ppnet.gigantic.io/

### One Step at a Time Install
You can reference the **Makefile** and the **swarm.json** file for details on the deployment.  

#### Running Locally
Let's start by testing the application locally:

    make run-local

Once all the **container layers** have been downloaded, you should be able to access the application locally:

    http://192.168.59.103:8000/

Just type in something like '@kordless' to login.  The application will remember your browser when you come back.  Magic.

You can do a **ctrl-c** to kill the application.  In order to stop the CouchDB server, you'll need to issue stop commands. The Makefile will do this for you:

    make docker-stop-couchdb

That command will take a few seconds to run.  If you want do do it manually:

    docker stop couchdb
    docker delete couchdb

#### Deploy to Giant Swarm
Now let's deploy the app to Giant Swarm's magical reality field. As usual, it's trivial:

```
$ make swarm-up
```

Again, once the images have been deployed, you can access the app from:

    http://ppnet-kord.gigantic.io/

Obviously replace the 'kord' in that URL with your Giant Swarm username. If you want a different subdomain for your URL, just edit the Makefile and change it toward the top.

Just type in something like '@kordless' to login.  The application will remember your browser when you come back.  

Magic.
