#!/bin/bash
# A script to change the remote url before starting the ppnet server

sed -i 's|http://couchdb.simple-url.com:5984/|http://'${PPNET_SERVER_URL}'/|g' /home/ppnet/www/config.json

/usr/local/bin/node server.js