(function () {
    'use strict';

    var lastMessage;

    var timer;

    function updateHouseStatus(e, res, req, jsonres) {
        var text = jsonres.m;

        if (text === lastMessage) {
            return;
        }

        if(!timer) {
            timer = modules.createUITimer("Construction");
            timer.sound = modules.settings.settings.notification.construction.sound;
            timer.notify = modules.settings.settings.notification.construction.show;
        }

        if (text.indexOf("available again") !== -1) { // Working
            var constructionTime = modules.utils.parseTimeStringLong(text) / 1000;

            timer.set(constructionTime);
            timer.resume();

        } else if (text.indexOf("are available")) {
            timer.end();
        }
    }

    function HouseMonitor() {
        RoAModule.call(this, "House Monitor");
    }

    HouseMonitor.prototype = Object.spawn(RoAModule.prototype, {
        load: function () {
            modules.ajaxHooks.register("house.php", updateHouseStatus);
            modules.ajaxHooks.registerAutoSend("house.php", {}, modules.constants.HouseUpdateInterval);

            RoAModule.prototype.load.apply(this);
        }
    });

    HouseMonitor.prototype.constructor = HouseMonitor;

    modules.houseMonitor = new HouseMonitor();

})();