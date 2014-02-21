var config = {
    // todo (concept) which server?
    //server: 'https://account.lab.fi-ware.eu',
    server: 'http://174.129.237.27:3000',
    path: {
        auth: '/authorize',
        logout: '/users/sign_out',
        user: '/user'
    },
    redirectUri: 'http://localhost/ppnet/www/',
    // todo (concept) configure default client id
    //clientId: 484,
    clientId: 6,
    //logoutTimeout: 3000,
    logoutTimeout: 6000,
    device: true
};

var user = {
    name: '',
    id: ''
}

function login(device) {
    config.device = device;
    // using jso functions
    // switch case: APP/WEB
    if (!config.device) {
        configurejso();
    }
    $.oajax({
        url: config.server,
        jso_provider: "filab",
        jso_allowia: true,
        dataType: 'json'
    });
    setAuthentificationStatus();
}

function logout(device) {
    config.device = device;
    // open popup to logout url and close popup
    var logout_popup = window.open(config.server + config.path.logout, '_blank', 'location=yes');
    // switch case: APP/WEB
    if (config.device) {
        logout_popup.addEventListener('loadstop', function(e) {
            logout_popup.close();
        });
    } else {
        $(logout_popup.document).ready(
            setTimeout(function(){logout_popup.close()}, config.logoutTimeout)
        );
    }
    // wipe existing cached tokens
    jso_wipe();
    setUser('', '');
    setAuthentificationStatus();
}

function configurejso() {
    // customize window open function
    jso_registerRedirectHandler(openAuthPopup);
    // configure the oAuth providers to use.
    jso_configure({
        "filab": {
            client_id: config.clientId,
            redirect_uri: config.redirectUri,
            authorization: config.server + config.path.auth,
            isDefault: true
        }
    }, {"debug": true});
    // jso_dump displays a list of cached tokens using console.log if debugging is enabled.
    jso_dump();
}

function openAuthPopup(authurl) {
    console.log('opening auth window url: ' + authurl);
    // switch case: APP/WEB
    if (config.device) {
        // uses InAppBrowser plugin to open fi-lab window
        var auth_popup = window.open(authurl, '_blank', 'location=yes');
        // listen for loading urls in InAppBrowser window
        auth_popup.addEventListener('loadstart', function(e) {
            var url = e.url;
            console.log('loading url in InAppBrowser window: ' + url);
            // redirect uri is something like http://localhost/#access_token=Hv8dVWyUktddcSLNSqt20pdHgTzOohl3jxpvbMJgZOARPcQ_930vlsyD8iCUOjaK8jsGLpu9HzVFHuLcHVa42g&expires_in=2419199&state=cd57f469-e7d1-4343-a334-3aee0c95c9b5&token_type=bearer
            if (url.match('access_token')) {
                auth_popup.close();
                var token = extractToken(url);
                alert('Token: ' + token);
            }
        });
    } else {
        window.location.href = authurl;
    }
    extractUser();
}

function extractToken(url) {
    var params = url.split('#')[1].split('&'),
        keyvals = [],
        keyval,
        i;
    for (i = 0; i < params.length; i += 1) {
        keyval = params[i].split('=');
        keyvals[keyval[0]] = keyval[1];
    }
    return keyvals['access_token']
}

function extractUser(url){
    // todo get user data from "sign_in"
    // dummy
    setUser("id", "name");
}

function setUser(id, name) {
    user.id = id;
    user.name = name;
}

function setAuthentificationStatus() {
    if (user.id != '' && user.name != '') {
        window.localStorage.setItem("user.id", user.id);
        window.localStorage.setItem("user.name", user.name);
    } else {
        window.localStorage.removeItem("user.id");
        window.localStorage.removeItem("user.name");
    }
}

var deviceready = function() {
    configurejso();
};
document.addEventListener('deviceready', deviceready, false);