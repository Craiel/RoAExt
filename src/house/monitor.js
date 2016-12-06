(function ($) {
    'use strict';

    var lastMessage;
    var $houseStatus;

    var template;
    var interval;
    var constructionTimeRemaining = 0;
    var constructionTimeUpdate;

    function updateHouseStatus(e, res, req, jsonres) {
        var text = jsonres.m;

        if (text === lastMessage) {
            return;
        }

        interval.clear();

        if (text.indexOf("available again") !== -1) { // Working
            constructionTimeRemaining = modules.utils.parseTimeStringLong(text);
            constructionTimeUpdate = new Date();
            interval.set(updateHouseConstructionTimer, 1000);
        } else if (text.indexOf("are available")) {
            houseConstructionFinished();
        }
    }

    function updateHouseConstructionTimer() {
        var currentDate = new Date();
        var updateDiff = currentDate - constructionTimeUpdate;
        constructionTimeRemaining -= updateDiff;
        constructionTimeUpdate = currentDate;

        if (constructionTimeRemaining <= 0) {
            houseConstructionFinished();
        } else {
            var timeString = new Date(constructionTimeRemaining).toISOString().substr(11, 8);
            $houseStatus.removeClass("avi-highlight").text(timeString);
        }
    }

    function houseConstructionFinished() {
        interval.clear();

        $houseStatus.addClass("avi-highlight").html(
            $('<span data-delegate-click="#header_house" style="cursor:pointer;text-decoration:underline;padding-right:5px">Ready!</span>')
                //.click() // TODO
        );

        if (modules.settings.settings.notification.construction.sound && modules.settings.settings.notification.enableSound) {
            modules.constants.SFX.circ_saw.play();
        }

        if (modules.settings.settings.notification.construction.show && modules.settings.settings.notification.enable) {
            modules.notification.notice("House construction finished!");
        }
    }

    function HouseMonitor() {
        RoAModule.call(this, "House Monitor");
    }

    HouseMonitor.prototype = Object.spawn(RoAModule.prototype, {
        continueLoad: function() {
            const $timer = $(template);
            const $body = $("body");

            $("#houseTimerInfo").addClass("avi-force-block");
            $body.append("<style>#constructionNotifier,#houseTimerTable [data-typeid='Construction']{display:none!important}</style>");

            $("#houseTimerTable").prepend($timer);

            $houseStatus = $("#avi-house-construction");

            interval = modules.createInterval("house_status");

            modules.ajaxHooks.register("house.php", updateHouseStatus);
            modules.ajaxHooks.registerAutoSend("house.php", {}, modules.constants.HouseUpdateInterval);

            RoAModule.prototype.load.apply(this);
        },
        load: function () {
            $.get(modules.urls.html.house_timers).done(function (x) {
                template = x;
                modules.houseMonitor.continueLoad();
            });
        }
    });

    HouseMonitor.prototype.constructor = HouseMonitor;

    modules.houseMonitor = new HouseMonitor();

})(modules.jQuery);