var fs = require('fs');
var path = require('path');
var config = require('./config.json');

function parsePort(input) {
    if (input) {
        input = input.replace(/('|")/g, '');
        var intInput = parseInt(input);
        if (isNaN(intInput) || intInput < 1) {
            return;
        }
    }

    return input;
}

function parseHost(input) {
    if (input) {
        input = input.replace(/('|")/g, '');
        if (input.indexOf('http://') !== 0) {
            input = 'http://' + input;
        }
        if (input.slice(-1) === '/') {
            input = input.slice(0, -1);
        }
    }
    return input;
}

(function () {
    var client_port, client_host;

    for (var i = 2; i < process.argv.length; i++) {
        var argumentArray = process.argv[i].split('=');
        if (argumentArray.length > 1) {
            switch (argumentArray[0]) {
                case config.client_db_remote.port :
                    client_port = parsePort(argumentArray[1]);
                    break;
                case config.client_db_remote.host :
                    client_host = parseHost(argumentArray[1]);
                    break;
            }
        }
    }
    
    
    if (!client_host || !client_port && (process.env[config.client_db_remote.port] && process.env[config.client_db_remote.host])) {
        client_host = parseHost(process.env[config.client_db_remote.host]);
        client_port = parsePort(process.env[config.client_db_remote.port]);
    }

    if (client_host && client_port) {
        
        var clientCouchUrl = client_host + ':' + client_port + '/';
        try {
            var configPath = path.join.apply(this, config.client_db_remote.config_path);
            var client_config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            for (var i = 0; i < client_config.database.length; i++) {
                client_config.database[i].remote = clientCouchUrl;
            }
            fs.writeFileSync(configPath, JSON.stringify(client_config, null, 4), 'utf-8');
        } catch (e) {
            console.log("The client-config will stay unchanged due to the following error!");
            console.log(e);
        }
    }
    
})();
