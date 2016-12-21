(function ($) {
    'use strict';

    const RequestAutoSendCheckFrequency = 100;
    const RequestSendThreshold = 500; // the time where we will warn about frequent requests to the same page

    var nextId = 1;
    var rcvForwards = [];
    var forwards = [];
    var targetedForwards = {};
    var targetedRcvForwards = {};
    var requestHistory = {};
    var autoRequests = {};

    function onAjaxSuccess(e, res, req, jsonData) {
        modules.ajaxHooks.idle = false;

        var requestData = {
            id: nextId++,
            date: new Date(),
            url: req.url,
            json: jsonData || {}
        };

        if(requestHistory[requestData.url]) {
            var timeSinceLastRequest = requestData.date - requestHistory[requestData.url];
            if(timeSinceLastRequest < RequestSendThreshold) {
                console.warn("Same request was done recently (" + requestData.url + ")");
            }
        }

        requestHistory[requestData.url] = requestData.date;

        // check if there is an auto request for this url
        if (autoRequests[requestData.url]) {
            // unlock the auto since we got a response
            autoRequests[requestData.url].locked = false;
        }

        for(var entry in targetedForwards) {
            if(requestData.url === entry) {
                for (var i = 0; i < targetedForwards[entry].length; i++) {
                    targetedForwards[entry][i](requestData);
                }

                break;
            }
        }

        for (var i = 0; i < forwards.length; i++) {
            forwards[i](requestData);
        }

        modules.ajaxHooks.idle = true;
    }
    
    function onAjaxSendPending(event, jqxhr, options) {
        modules.ajaxHooks.idle = false;

        var requestData = {
            id: nextId++,
            date: new Date(),
            url: options.url,
            options: options || {},
            jqxhr: jqxhr
        };

        for(var entry in targetedRcvForwards) {
            if(requestData.url === entry) {
                for (var i = 0; i < targetedRcvForwards[entry].length; i++) {
                    targetedRcvForwards[entry][i](requestData);
                }

                break;
            }
        }

        for (var i = 0; i < rcvForwards.length; i++) {
            rcvForwards[i](requestData);
        }

        modules.ajaxHooks.idle = true;
    }

    function autoSendAjaxRequests() {
        for (var url in autoRequests) {
            var request = autoRequests[url];
            if(request.locked) {
                continue;
            }

            var timeSinceReceive = new Date() - (requestHistory[url] || 0);

            if(timeSinceReceive >= request.interval) {
                request.locked = true;
                if(!request.ajax) {
                    request.ajax = modules.createAjaxRequest(url).post(request.payload);
                }

                request.ajax.send();
            }
        }
    }

    function AjaxHooks() {
        RoAModule.call(this, "Ajax Hooks");
    }

    AjaxHooks.prototype = Object.spawn(RoAModule.prototype, {
        idle: true,
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
        registerRcv: function (site, callback) {
            if(!targetedRcvForwards[site]) {
                targetedRcvForwards[site] = [];
            }

            targetedRcvForwards[site].push(callback);
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