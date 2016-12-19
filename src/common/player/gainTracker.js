(function ($) {
    'use strict';

    const GainDataVersion = 1;

    var activeData;
    var updateTimer;
    var saveTimer;

    function onActivityBattle(requestData) {
        if(requestData.json.b) {
            activeData.data[modules.gainTypes.types.XP.id].addData(requestData.json.b.xp || 0);
            activeData.data[modules.gainTypes.types.ClanXP.id].addData(requestData.json.b.cxp || 0);

            activeData.data[modules.gainTypes.types.Gold.id].addData(requestData.json.b.g || 0);
            activeData.data[modules.gainTypes.types.ClanGold.id].addData(requestData.json.b.cg || 0);
        }

        // .sr
        // "Your <span class="ruby">strength</span> improved by 1."
    }

    function onActivityEvent(requestData) {

    }

    function onActivityTrade(requestData) {

    }

    function onActivityCraft(requestData) {

    }

    function onDungeonBattle(requestData) {

    }

    function onDungeonSearch(requestData) {

    }

    function onUpdate() {
        for (var key in activeData.data) {
            activeData.data[key].update();
        }
    }

    function save() {
        var data = {
            version: GainDataVersion,
            data: {}
        };

        for (var key in activeData.data) {
            data.data[key] = activeData.data[key].save();
        }

        modules.settings.settings.gainData = data;
    }

    function load() {
        try {
            var data = JSON.parse(modules.settings.settings.gainData);
        } catch (e) {
            modules.logger.error("Failed to load gainData, will use default: " + e);
        }

        if(!data || data.version !== GainDataVersion) {
            modules.logger.warn("Could not load Gain Data, version mismatch");
            return;
        }

        for (var key in activeData) {
            if(data.data[key]) {
                activeData.data[key].load(data.data[key]);
            }
        }
    }

    function createDataEntry(key) {
        var entry = modules.createGainData();
        activeData.data[key] = entry;
    }

    function createDataEntries() {
        activeData = null;
        initializeData();

        for (var key in modules.gainTypes.types) {
            createDataEntry(modules.gainTypes.types[key].id);
        }
    }

    function initializeData() {
        if(!activeData || activeData.version !== GainDataVersion) {
            activeData = {
                version: GainDataVersion,
                data: {}
            }
        }
    }

    function PlayerGainTracker() {
        RoAModule.call(this, "Player Gain-Tracker");
    }

    PlayerGainTracker.prototype = Object.spawn(RoAModule.prototype, {
        load: function () {

            initializeData();

            modules.ajaxHooks.register("autobattle.php", onActivityBattle);
            modules.ajaxHooks.register("autoevent.php", onActivityEvent);
            modules.ajaxHooks.register("autotrade.php", onActivityTrade);
            modules.ajaxHooks.register("autocraft.php", onActivityCraft);

            modules.ajaxHooks.register("dungeon_battle.php", onDungeonBattle);
            modules.ajaxHooks.register("dungeon_search.php", onDungeonSearch);

            updateTimer = modules.createInterval("GainTrackerUpdate");
            updateTimer.set(onUpdate, 100);

            saveTimer = modules.createInterval("GainTackerSave");
            saveTimer.set(save, 1000);

            createDataEntries();

            load();

            RoAModule.prototype.load.apply(this);
        },
        getKeys: function () {
            return Object.keys(activeData.data);
        },
        getData: function (key) {
            return activeData.data[key];
        }
    });

    PlayerGainTracker.prototype.constructor = PlayerGainTracker;

    modules.playerGainTracker = new PlayerGainTracker();

})(modules.jQuery);