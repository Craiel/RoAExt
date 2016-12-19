(function ($) {
    'use strict';

    var activeData = {};
    var updateTimer;
    var saveTimer;

    function handleActivityDrop(string) {
        if(string === null) {
            return;
        }

        var match = string.match(/>([0-9,]+) gold .*?</);
        if(match && match.length == 2) {
            var value = parseInt(match[1].replace(/,/g, ''));
            activeData[modules.gainTypes.types.Gold.id].addData(value || 0, modules.gainSources.sources.ActivityDrop.id);
            return;
        }

        match = string.match(/>([0-9,]+) platinum .*?</);
        if(match && match.length == 2) {
            var value = parseInt(match[1].replace(/,/g, ''));
            activeData[modules.gainTypes.types.Platinum.id].addData(value || 0, modules.gainSources.sources.ActivityDrop.id);
            return;
        }

        match = string.match(/>([0-9,]+) crafting material.*?</);
        if(match && match.length == 2) {
            var value = parseInt(match[1].replace(/,/g, ''));
            activeData[modules.gainTypes.types.Material.id].addData(value || 0, modules.gainSources.sources.ActivityDrop.id);
            return;
        }

        match = string.match(/ Trash Compactor .*? ([0-9,]+) Crafting Material/);
        if(match && match.length == 2) {
            var value = parseInt(match[1].replace(/,/g, ''));
            activeData[modules.gainTypes.types.Material.id].addData(value || 0, modules.gainSources.sources.TrashCompactor.id)
            activeData[modules.gainTypes.types.Item.id].addData(1, modules.gainSources.sources.ActivityDrop.id);
            return;
        }

        console.warn("Unhandled Activity Drop: " + string);
    }

    function handleStatDrop(string) {
        if(string === null) {
            return;
        }

        var match = string.match(/>(.*?)<.*?improved by ([0-9]+)/);
        if(match && match.length == 3) {
            var value = parseInt(match[2].replace(/,/g, ''));


            switch (match[1]) {
                case "coordination": {
                    activeData[modules.gainTypes.types.Coordination.id].addData(value, modules.gainSources.sources.Battle.id);
                    return;
                }

                case "ranged weapons": {
                    activeData[modules.gainTypes.types.RangedWeapon.id].addData(value, modules.gainSources.sources.Battle.id);
                    return;
                }

                default: {
                    console.warn("Unhandled Stat Drop - " + match[1] + "@" + match[2]);
                    return;
                }
            }
        }

        console.warn("Unknown Stat Drop string: " + string);

        // "Your <span class="ruby">strength</span> improved by 1."
    }

    function onActivityBattle(requestData) {
        if(!requestData.json.b) {
            return;
        }

        activeData[modules.gainTypes.types.XP.id].addData(requestData.json.b.xp || 0, modules.gainSources.sources.Battle.id);
        activeData[modules.gainTypes.types.ClanXP.id].addData(requestData.json.b.cxp || 0, modules.gainSources.sources.Battle.id);

        activeData[modules.gainTypes.types.Gold.id].addData(requestData.json.b.g || 0, modules.gainSources.sources.Battle.id);
        activeData[modules.gainTypes.types.ClanGold.id].addData(requestData.json.b.cg || 0, modules.gainSources.sources.Battle.id);

        handleActivityDrop(requestData.json.b.dr);
        handleStatDrop(requestData.json.b.sr);

    }

    function onActivityEvent(requestData) {

    }

    function onActivityTrade(requestData) {
        if(!requestData.json.a) {
            return;
        }

        if (requestData.json.a.s === "fishing") {
            activeData[modules.gainTypes.types.Food.id].addData(requestData.json.a.a || 0, modules.gainSources.sources.Tradeskill.id);
            activeData[modules.gainTypes.types.ClanFood.id].addData(requestData.json.a.ca || 0, modules.gainSources.sources.Tradeskill.id);
            activeData[modules.gainTypes.types.FishingXP.id].addData(requestData.json.a.xp || 0, modules.gainSources.sources.Tradeskill.id);
        } else if(requestData.json.a.s === "woodcutting") {
            activeData[modules.gainTypes.types.Wood.id].addData(requestData.json.a.a || 0, modules.gainSources.sources.Tradeskill.id);
            activeData[modules.gainTypes.types.ClanWood.id].addData(requestData.json.a.ca || 0, modules.gainSources.sources.Tradeskill.id);
            activeData[modules.gainTypes.types.WoodCuttingXP.id].addData(requestData.json.a.xp || 0, modules.gainSources.sources.Tradeskill.id);
        } else if(requestData.json.a.s === "mining") {
            activeData[modules.gainTypes.types.Iron.id].addData(requestData.json.a.a || 0, modules.gainSources.sources.Tradeskill.id);
            activeData[modules.gainTypes.types.ClanIron.id].addData(requestData.json.a.ca || 0, modules.gainSources.sources.Tradeskill.id);
            activeData[modules.gainTypes.types.MiningXP.id].addData(requestData.json.a.xp || 0, modules.gainSources.sources.Tradeskill.id);
        }  else if(requestData.json.a.s === "stonecutting") {
            activeData[modules.gainTypes.types.Stone.id].addData(requestData.json.a.a || 0, modules.gainSources.sources.Tradeskill.id);
            activeData[modules.gainTypes.types.ClanStone.id].addData(requestData.json.a.ca || 0, modules.gainSources.sources.Tradeskill.id);
            activeData[modules.gainTypes.types.StoneCuttingXP.id].addData(requestData.json.a.xp || 0, modules.gainSources.sources.Tradeskill.id);
        }

        handleActivityDrop(requestData.json.a.dr);
        handleStatDrop(requestData.json.a.sr);
    }

    function onActivityCraft(requestData) {
        if(!requestData.json.a) {
            return;
        }

        activeData[modules.gainTypes.types.CraftingXP.id].addData(requestData.json.a.xp || 0, modules.gainSources.sources.Crafting.id);

        handleActivityDrop(requestData.json.a.dr);
        handleStatDrop(requestData.json.a.sr);
    }

    function onDungeonBattle(requestData) {
        if(!requestData.json.b) {
            return;
        }

        activeData[modules.gainTypes.types.XP.id].addData(requestData.json.b.xp || 0, modules.gainSources.sources.Dungeon.id);
        activeData[modules.gainTypes.types.ClanXP.id].addData(requestData.json.b.cxp || 0, modules.gainSources.sources.Dungeon.id);

        activeData[modules.gainTypes.types.Gold.id].addData(requestData.json.b.g || 0, modules.gainSources.sources.Dungeon.id);
        activeData[modules.gainTypes.types.ClanGold.id].addData(requestData.json.b.cg || 0, modules.gainSources.sources.Dungeon.id);

        activeData[modules.gainTypes.types.DungeonPoint.id].addData(requestData.json.b.dp || 0, modules.gainSources.sources.Dungeon.id);

        handleActivityDrop(requestData.json.b.dr);
        handleStatDrop(requestData.json.b.sr);
    }

    function onDungeonSearch(requestData) {
        if(!requestData.json.m) {
            return;
        }

        var match = requestData.json.m.match(/found ([0-9,]+) gold/);
        if(match && match.length === 2) {
            var value = parseInt(match[1].replace(/,/g, ''));
            activeData[modules.gainTypes.types.Gold.id].addData(value || 0, modules.gainSources.sources.DungeonSearch.id);
        }

        match = requestData.json.m.match(/found a (.*?)!/);
        if(match && match.length === 2) {
            console.log("TODO: Dungeon Search Drop of '" + match[1] + "'");
            return;
        }

        //** You searched the room and found 6,464 gold!

        // You searched the room and found a Bland Jupiterian Symbol!
    }

    function onUpdate() {
        for (var key in activeData) {
            activeData[key].update();
        }
    }

    function save() {
        var data = {};

        for (var key in activeData) {
            data[key] = activeData[key].save();
        }

        modules.settings.settings.gainData = data;
    }

    function load() {
        for (var key in modules.settings.settings.gainData) {
            if(activeData[key]) {
                activeData[key].load(modules.settings.settings.gainData[key]);
            }
        }
    }

    function createDataEntry(key) {
        var entry = modules.createGainData();
        activeData[key] = entry;
    }

    function createDataEntries() {
        activeData = {};

        for (var key in modules.gainTypes.types) {
            createDataEntry(modules.gainTypes.types[key].id);
        }
    }

    function PlayerGainTracker() {
        RoAModule.call(this, "Player Gain-Tracker");
    }

    PlayerGainTracker.prototype = Object.spawn(RoAModule.prototype, {
        load: function () {

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
            return Object.keys(activeData);
        },
        getData: function (key) {
            return activeData[key];
        },
        reset: function () {
            for(var key in activeData) {
                activeData[key].reset();
            }
        }
    });

    PlayerGainTracker.prototype.constructor = PlayerGainTracker;

    modules.playerGainTracker = new PlayerGainTracker();

})(modules.jQuery);