var config = {
    //server: 'http://174.129.237.27:3000'
    server: 'https://account.lab.fi-ware.eu',
    path: {
        auth: '/authorize',
        logout: '/users/sign_out',
        user: '/user'
    },
    redirectUri: 'http://localhost/ppnet/www/',
    //clientId: '6'
    clientId: 484
};

function login() {
    // using jso functions

    /***********************
     * switch case: WEB/APP
     ***********************/
     // WEB
    configurejso();
    // APP
    // nothing to do, listen for deviceready

    $.oajax({
        url: config.server,
        jso_provider: "filab",
        jso_allowia: true,
        dataType: 'json'
    });
}

function logout() {
    // open popup to logout url and close popup
    var logout_popup = window.open(config.server + config.path.logout, '_blank', 'location=yes');

    /***********************
     * switch case: WEB/APP
     ***********************/
    // WEB
    $(logout_popup.document).ready(
        setTimeout(function(){logout_popup.close()}, 3000)
    );
    /* APP
    logout_popup.addEventListener('loadstop', function(e) {
        logout_popup.close();

    });*/

    // wipe existing cached tokens
    jso_wipe();
}

function getUser() {
    var user_popup = window.open(config.server + config.path.user, '_blank', 'location=yes');

    // ToDo
    /***********************
     * switch case: WEB/APP
     ***********************/
    // WEB
    // APP
    /*user_popup.addEventListener('loadstop', function(e) {
        user_popup.close();
    });*/
    return "";
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

    /***********************
     * switch case: WEB/APP
     ***********************/

    // WEB
    window.location.href = authurl;
    /*/ APP
    // uses InAppBrowser plugin to open fi-lab window
    var auth_popup = window.open(authurl, '_blank', 'location=yes');
    // listen for loading urls in InAppBrowser window
    auth_popup.addEventListener('loadstart', function(e) {
    var url = e.url;
    console.log('loading url in InAppBrowser window: ' + url);
    // redirect uri is something like http://localhost/#access_token=Hv8dVWyUktddcSLNSqt20pdHgTzOohl3jxpvbMJgZOARPcQ_930vlsyD8iCUOjaK8jsGLpu9HzVFHuLcHVa42g&expires_in=2419199&state=cd57f469-e7d1-4343-a334-3aee0c95c9b5&token_type=bearer
    if (url.match('access_token')) {
    auth_popup.close();
    var token = extractTokenFromUrl(url);
    alert('Token: ' + token);
    });*/
}

function extractTokenFromUrl(url) {
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

var deviceready = function() {
    configurejso();
};
document.addEventListener('deviceready', deviceready, false);