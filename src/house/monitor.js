(function () {
    'use strict';

    const ConstructionKey = "Construction";
    const HarvestronKey = "Harvestron";

    var lastMessage;

    var houseTimers = {};

    function clearHouseTimers() {
        for(var key in houseTimers) {
            if(houseTimers[key].ended) {
                houseTimers[key].delete();
                delete houseTimers[key];
            }
        }
    }

    function updateHouseStatus(requestData) {
        clearHouseTimers();

        var text = requestData.json.m;

        if (text === lastMessage) {
            return;
        }

        if (text.indexOf("available again") !== -1) { // Working
            var constructionTime = modules.utils.parseTimeStringLong(text) / 1000;
            setHouseTimer(ConstructionKey, constructionTime);
        }
    }

    function updateHarvestronStatus(requestData) {
        var time = parseInt(requestData.json.m.search(/([0-9]+)\sminute/i));
        if(!time) {
            return;
        }

        setHouseTimer(HarvestronKey, time * 60);
    }

    function setHouseTimer(key, value) {
        if(!houseTimers[key]) {
            houseTimers[key] = modules.createUITimer(key);
            houseTimers[key].sound = modules.settings.settings.notification.house.sound;
            houseTimers[key].notify = modules.settings.settings.notification.house.show;
        }

        houseTimers[key].set(value);
        houseTimers[key].resume();
    }

    function updateHouseTimers(requestData) {
        clearHouseTimers();

        if(!requestData.json.p || !requestData.json.p.house_timers || requestData.json.p.house_timers.length <= 0) {
            return;
        }

        for (var i = 0; i < requestData.json.p.house_timers.length; i++) {
            var key = requestData.json.p.house_timers[i].n;
            var value = requestData.json.p.house_timers[i].next;
            setHouseTimer(key, value);
        }
    }

    function HouseMonitor() {
        RoAModule.call(this, "House Monitor");
    }

    HouseMonitor.prototype = Object.spawn(RoAModule.prototype, {
        load: function () {
            modules.ajaxHooks.register("house.php", updateHouseStatus);
            modules.ajaxHooks.register("house_harvest_job.php", updateHarvestronStatus);

            modules.ajaxHooks.registerAutoSend("house.php", {}, modules.constants.HouseUpdateInterval);

            modules.ajaxRegisterAutoActions(updateHouseTimers);

            RoAModule.prototype.load.apply(this);
        }
    });

    HouseMonitor.prototype.constructor = HouseMonitor;

    modules.houseMonitor = new HouseMonitor();

})();