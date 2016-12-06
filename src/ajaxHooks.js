(function ($) {
    'use strict';

    var module = {};

    const RequestAutoSendCheckFrequency = 100;
    const RequestSendThreshold = 500; // the time where we will warn about frequent requests to the same page

    var registry = {};
    var requestHistory = {};
    var autoRequests = {};

    function onAjaxSuccess(e, res, req, jsonData) {
        var requestDate = new Date();

        if(requestHistory[req.url]) {
            var timeSinceLastRequest = requestDate - requestHistory[req.url];
            if(timeSinceLastRequest < RequestSendThreshold) {
                console.warn("Same request was done recently (" + req.url + ")");
            }
        }

        requestHistory[req.url] = requestDate;

        // check if there is an auto request for this url
        if (autoRequests[req.url]) {
            // unlock the auto since we got a response
            autoRequests[req.url].locked = false;
        }

        console.log(req.url);
        //console.log(jsonData);

        for(var entry in registry) {
            if(req.url === entry) {
                for (var i = 0; i < registry[entry].length; i++) {
                    registry[entry][i](e, res, req, jsonData);
                }

                return;
            }
        }
    }

    function autoSendAjaxRequests() {
        for (var url in autoRequests) {
            var request = autoRequests[url];
            if(request.locked) {
                continue;
            }

            var timeSinceReceive = new Date() - (requestHistory[url] || 0);

            if(timeSinceReceive >= request.interval) {
                console.log("Auto-sending ajax for " + url);
                request.locked = true;
                $.post(url, request.payload);
            }
        }
    }

    module.registerAutoSend = function (url, payload, interval) {
        if(autoRequests[url]) {
            console.error("Url " + url + " is already registered for auto send!");
            return;
        }

        autoRequests[url] = { payload: payload, interval: interval, locked: false };
    };

    module.register = function(site, callback) {
        if(!registry[site]) {
            registry[site] = [];
        }

        registry[site].push(callback);
    };

    module.enable = function () {
        //$(document).on("ajaxSend", onAjaxSendPending);
        $(document).on("ajaxSuccess", onAjaxSuccess);

        modules.createInterval("ajaxHooksAutoSend").set(autoSendAjaxRequests, RequestAutoSendCheckFrequency);
    };

    modules.ajaxHooks = module;

})(modules.jQuery);