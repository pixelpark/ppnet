/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright 2012, Andrew Lunny, Adobe Systems
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2011, IBM Corporation
 * (c) 2010 Jesse MacFadyen, Nitobi
 */

var ChildBrowser = (function (gap) {
    function isFunction(f) {
        return typeof f === "function";
    }

    // placeholder and constants
    function ChildBrowser() {}

    var CLOSE_EVENT = 0,
        LOCATION_CHANGED_EVENT = 1,
        OPEN_EXTERNAL_EVENT = 2;

    /**
     * Function called when the child browser has an event.
     */
    function onEvent(data) {
        switch (data.type) {
            case CLOSE_EVENT:
                if (isFunction(ChildBrowser.onClose)) {
                    ChildBrowser.onClose();
                }
                break;
            case LOCATION_CHANGED_EVENT:
                if (isFunction(ChildBrowser.onLocationChange)) {
                    ChildBrowser.onLocationChange(data.location);
                }
                break;
            case OPEN_EXTERNAL_EVENT:
                if (isFunction(ChildBrowser.onOpenExternal)) {
                    ChildBrowser.onOpenExternal();
                }
                break;
        }
    }

    /**
     * Function called when the child browser has an error.
     */
    function onError(data) {
        if (isFunction(ChildBrowser.onError)) {
            ChildBrowser.onError(data);
        }
    }

    /**
     * Maintain API consistency with iOS
     */
    ChildBrowser.install = function () {
        console.log('ChildBrowser.install is deprecated');
    }

    /**
     * Display a new browser with the specified URL.
     * This method loads up a new web view in a dialog.
     *
     * @param url           The url to load
     * @param options       An object that specifies additional options
     */
    ChildBrowser.showWebPage = function (url, options) {
        if (!options) {
            options = { showLocationBar: true };
        }

        gap.exec(onEvent, onError, "ChildBrowser", "showWebPage", [url, options]);
    };

    /**
     * Close the browser opened by showWebPage.
     */
    ChildBrowser.close = function () {
        gap.exec(null, null, "ChildBrowser", "close", []);
    };

    /**
     * Display a new browser with the specified URL.
     * This method starts a new web browser activity.
     *
     * @param url           The url to load
     * @param usePhoneGap   Load url in PhoneGap webview [optional]
     */
    ChildBrowser.openExternal = function(url, usePhoneGap) {
        if (device.platform.toLowerCase() == 'android') {
            if (usePhoneGap) {
                navigator.app.loadUrl(url);
            } else {
                gap.exec(null, null, "ChildBrowser", "openExternal", [url, usePhoneGap]);
            }
        } else {
            ChildBrowser.showWebPage(url);
        };
    };

    /**
     * Load ChildBrowser
     */
    gap.addConstructor(function () {
        if (gap.addPlugin) {
            gap.addPlugin("childBrowser", ChildBrowser);
        } else {
            if (!window.plugins) {
                window.plugins = {};
            }

            window.plugins.childBrowser = ChildBrowser;
        }
    });

    return ChildBrowser;
})(window.cordova || window.Cordova || window.PhoneGap);
