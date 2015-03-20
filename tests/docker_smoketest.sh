#!/bin/sh

# How to use: ./docker_smoketest.sh HOST PORT


HOST=$1
PORT=$2

[ "$HOST" ] || HOST="localhost"
[ "$PORT" ] || PORT="8000"

echo "Entering FIC2Lab smoke test sequence. Vendor\'s validation procedure of SNE engaged. Target host: $HOST:$PORT"
echo "Run smoke test for getting index.html"

echo -n "Waiting service to launch"
while ! (netcat -vz localhost $PORT &> /dev/null); do echo -n "."; sleep 5; done
echo ""
echo "service is running."

ITEM_RESULT=$(curl -s -o /dev/null -w "%{http_code}" http://$HOST:$PORT/)

if [ "$ITEM_RESULT" -ne "200" ]; then
  echo ""
  echo "Curl command for index.html failed. Validation procedure terminated."
  echo "Debug information: HTTP code $ITEM_RESULT instead of expected 200 from $HOST:$PORT"
  exit 1;
else
  echo "Curl command for index.html OK."
fi

ITEM_DBURL=$(curl -s http://$HOST:$PORT/config.json | sed -n '/database/,/\[/{{p;n};/\]/{q};p}' | sed '/remote/!d' | sed s/\"remote\":\ //g | sed s/\"//g | sed '1!d' | sed 's/^ *//;s/ *$//')
ITEM_DBNAME=$(curl -s http://$HOST:$PORT/config.json | sed -n '/database/,/\[/{{p;n};/\]/{q};p}' | sed '/name/!d' | sed s/\"name\":\ //g | sed s/\,//g | sed s/\"//g | sed '1!d' | sed 's/^ *//;s/ *$//')
ITEM_DBRESULT=$(curl -s -o /dev/null -w "%{http_code}" $ITEM_DBURL$ITEM_DBNAME)

if [ "$ITEM_DBRESULT" -ne "200" ]; then
  echo ""
  echo "Curl command for config.json failed. Validation procedure terminated."
  echo "Debug information: HTTP code $ITEM_DBRESULT instead of expected 200 from $ITEM_DBURL$ITEM_DBNAME"
  exit 1;
else
  echo "Curl command for database OK."
fi

echo ""
echo "Smoke test completed. Vendor component validation procedure succeeded. Over."
