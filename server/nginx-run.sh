#!/bin/sh
DEMO_COUCHDB_URL='http://couchdb.simple-url.com:5984/'
if [ "$COUCHDB_URL" ]; then
echo "Configuring webapp to use CouchDB at IP $COUCHDB_URL"
ESCAPED_COUCHDB_URL=$(echo $COUCHDB_URL | sed -e 's/[\/&]/\\&/g')
ESCAPED_DEMO_COUCHDB_URL=$(echo $DEMO_COUCHDB_URL | sed -e 's/[\/&]/\\&/g')
sed -i "s/$ESCAPED_DEMO_COUCHDB_URL/$ESCAPED_COUCHDB_URL/" /usr/ppnet-master/www/config.json
else
echo "Using demo CouchDB server at $DEMO_COUCHDB_URL"
fi
mkdir /tmp/nginx
nginx $@
