ppnet-proxy
===========

A simple proxy for [PPnet](https://github.com/pixelpark/ppnet) to limit access to the remote couchdb. It is also able to serve static files of PPnet.

## Installation
Checkout ppnet-proxy repository and "cd" into ppnet-proxy folder
``` bash
    git clone https://github.com/pixelpark/ppnet-proxy.git
```

Install all required packages
``` bash
    cd ppnet-proxy
    npm install
```

## Usage
Adjust your PPnet-config.json (see [config.json](https://github.com/pixelpark/ppnet/blob/master/app/config.json)) so that the remote-addresses link to your proxy.
You should also adjust the config.json of ppnet-proxy. The config-files should match by the database names.
Run the proxy by the following command.
``` bash
    node proxy.js
```

Database-requests should now be handled by your proxy.

To serve static files of PPnet create a directory 'www' in your 'ppnet-proxy' folder and copy your ppnet-files in the 'www' folder.

## Install ppnet with proxy

  
``` bash

    sudo apt-get update
    sudo apt-get -y install couchdb
    # curl http://localhost:5984

    sudo apt-get install -y python-software-properties
    sudo add-apt-repository -y ppa:chris-lea/node.js
    sudo apt-get update
    sudo apt-get install -y nodejs

    sudo apt-get install --yes git
    git clone https://github.com/pixelpark/ppnet
    git clone https://github.com/pixelpark/ppnet-proxy.git

    sudo rm -r ppnet-proxy/www/
    mv ppnet/www ppnet-proxy/

    # get public ip
    # curl http://169.254.169.254/latest/meta-data/public-ipv4 > public.ip
    curl ifconfig.me/ip > public.ip
    
    # write it to config.json
    mv ppnet-proxy/www/config.json del.txt
    sed -e "s/couchdb.simple-url.com/`cat public.ip`/g" del.txt > temp && mv temp del.txt
    mv del.txt ppnet-proxy/www/config.json

    cd ppnet-proxy; npm install; sudo node proxy.js
```
or, even easier:
``` bash
    curl https://gist.githubusercontent.com/dirkk0/f7169b42055a013758c3/raw/0f13525a3c72bb823f18f7715fda7b62f50ebf88/doit.sh | sh
```
