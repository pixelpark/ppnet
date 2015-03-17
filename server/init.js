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

module.exports = function (databases, config) {
    var server_port, server_host;

    for (var i = 2; i < process.argv.length; i++) {
        var argumentArray = process.argv[i].split('=');
        if (argumentArray.length > 1) {
            switch (argumentArray[0]) {
                case config.server_db_remote.port :
                    server_port = parsePort(argumentArray[1]);
                    break;
                case config.server_db_remote.host :
                    server_host = parseHost(argumentArray[1]);
                    break;
            }
        }
    }
    if (!server_host || !server_port && (process.env[config.server_db_remote.port] && process.env[config.server_db_remote.host])) {
        server_host = parseHost(process.env[config.server_db_remote.host]);
        server_port = parsePort(process.env[config.server_db_remote.port]);
    }

    if (server_host && server_port) {
        var serverCouchUrl = server_host + ':' + server_port + '/';
        for (var i = 0; i < databases.length; i++) {
            databases[i].remote = serverCouchUrl;
        }
    }
    console.log(databases);
};
