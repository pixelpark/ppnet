#!/bin/bash
# A script to change the remote url before starting the ppnet server

if [ ! -z "$PPNET_SERVER_URL"  ] && [ "$PPNET_SERVER_URL" != "http://:8000" ]; then
  sed -i 's|http://couchdb.simple-url.com:5984/|http://'${PPNET_SERVER_URL}'/|g' /home/ppnet/www/config.json
fi

/usr/local/bin/node server.js