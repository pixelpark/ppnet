# Getting started with PPnet and Docker

PPnet provides a simple way to get your own PPnet with your own database up and running in a matter of minutes. It leverages [Docker](http://docker.io) to create containers and [Giant Swarm](http://giantswarm.io) to get them running in the cloud.

## Installation

* Install Docker and Giant Swarm
* Checkout PPNet: `git clone https://github.com/pixelpark/ppnet.git`
* cd server

## TL;DR

```
# Builds everything and deploys it to Giant Swarm
$ make swarm-up
``` 

## Building

All you need to build your Docker containers resides in the server directory:

* `Dockerfile-server` to build and configure a ppnet-server container
* `Dockerfile-couchdb` to build a CouchDB container which uses `couchdb-cors-local.ini` to enable CORS in Couch.

In addition there is a `Makefile` which contains targets to build the container:
```
# build the couchdb container
$ make docker-build-couchdb

# build the ppnet-server container
$ make docker-build-server
```
Both targets are rather simple have a look.

## Running it locally

It's easy to test run the containers locally:
```
$ make docker-run-couchdb
$ make docker-run-server
```

## Deploying

To deploy the PPnet you need to upload the Docker containers and create the app in Giant Swarm:

```
# Push the containers
$ make docker-push
# Create and start the PPnet app:
$ make swarm-up
```