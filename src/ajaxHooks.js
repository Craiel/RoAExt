(function ($) {
    'use strict';

    const RequestAutoSendCheckFrequency = 100;
    const RequestSendThreshold = 500; // the time where we will warn about frequent requests to the same page

    var rcvForwards = [];
    var forwards = [];
    var targetedForwards = {};
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

        for(var entry in targetedForwards) {
            if(req.url === entry) {
                for (var i = 0; i < targetedForwards[entry].length; i++) {
                    targetedForwards[entry][i](e, res, req, jsonData);
                }

                break;
            }
        }

        for (var i = 0; i < forwards.length; i++) {
            forwards[i](e, res, req, jsonData);
        }
    }
    
    function onAjaxSendPending(event, jqxhr, options) {
        for (var i = 0; i < rcvForwards.length; i++) {
            rcvForwards[i](event, jqxhr, options);
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

    function AjaxHooks() {
        RoAModule.call(this, "Ajax Hooks");
    }

    AjaxHooks.prototype = Object.spawn(RoAModule.prototype, {
        registerAutoSend: function (url, payload, interval) {
            if(autoRequests[url]) {
                console.error("Url " + url + " is already registered for auto send!");
                return;
            }

            autoRequests[url] = { payload: payload, interval: interval, locked: false };
        },
        register: function(site, callback) {
            if(!targetedForwards[site]) {
                targetedForwards[site] = [];
            }

            targetedForwards[site].push(callback);
        },
        registerAll: function (callback) {
            forwards.push(callback);
        },
        registerRcvAll: function (callback) {
            rcvForwards.push(callback);
        },
        load: function () {
            $(document).on("ajaxSend", onAjaxSendPending);
            $(document).on("ajaxSuccess", onAjaxSuccess);

            modules.createInterval("ajaxHooksAutoSend").set(autoSendAjaxRequests, RequestAutoSendCheckFrequency);

            RoAModule.prototype.load.apply(this);
        }
    });

    AjaxHooks.prototype.constructor = AjaxHooks;

    modules.ajaxHooks = new AjaxHooks();

    modules.ajaxRegisterAutoActions = function (callback) {
        modules.ajaxHooks.register("autobattle.php", callback);
        modules.ajaxHooks.register("autoevent.php", callback);
        modules.ajaxHooks.register("autotrade.php", callback);
        modules.ajaxHooks.register("autocraft.php", callback);
    }

})(modules.jQuery);