(function ($) {
    'use strict';

    var activeData = {};
    var updateTimer;
    var saveTimer;

    function processMaterialDrop(name, value, source) {
        switch (name) {
            case "gold": {
                activeData[modules.gainTypes.types.Gold.id].addData(value || 0, source);
                return;
            }

            case "platinum": {
                activeData[modules.gainTypes.types.Platinum.id].addData(value || 0, source);
                return;
            }

            case "crafting": {
                activeData[modules.gainTypes.types.Material.id].addData(value || 0, source);
                return;
            }

            case "gem": {
                activeData[modules.gainTypes.types.Fragment.id].addData(value || 0, source);
                return;
            }

            default: {
                console.warn("Unhandled Material Drop: " + name + "@" + value + " from " + source);
                return;
            }
        }
    }

    function handleActivityDrop(string) {
        if(string === null) {
            return;
        }

        var match = string.match(/>[\(]*([0-9,]+)[\)]* ([\w]+) .*?</);
        if(match && match.length == 3) {
            var value = parseInt(match[1].replace(/,/g, ''));
            processMaterialDrop(match[2], value, modules.gainSources.sources.ActivityDrop.id);
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

    function processStatDrop(name, value, source) {
        switch (name) {
            case "health": {
                activeData[modules.gainTypes.types.Health.id].addData(value, source);
                return;
            }

            case "strength": {
                activeData[modules.gainTypes.types.Strength.id].addData(value, source);
                return;
            }

            case "agility": {
                activeData[modules.gainTypes.types.Agility.id].addData(value, source);
                return;
            }

            case "healing": {
                activeData[modules.gainTypes.types.Healing.id].addData(value, source);
                return;
            }

            case "evasion": {
                activeData[modules.gainTypes.types.Evasion.id].addData(value, source);
                return;
            }

            case "coordination": {
                activeData[modules.gainTypes.types.Coordination.id].addData(value, source);
                return;
            }

            case "ranged weapons": {
                activeData[modules.gainTypes.types.RangedWeapon.id].addData(value, source);
                return;
            }

            case "counter attacking": {
                activeData[modules.gainTypes.types.CounterAttack.id].addData(value, source);
                return;
            }

            default: {
                console.warn("Unhandled Stat Drop - " + name + "@" + value + " from " + source);
                return;
            }
        }
    }

    function handleStatDrop(string, source) {
        if(string === null) {
            return;
        }

        var match = string.match(/>(.*?)<.*?improved by ([0-9]+)/);
        if(match && match.length == 3) {
            var value = parseInt(match[2].replace(/,/g, ''));
            processStatDrop(match[1], value, source);
            return;
        }

        console.warn("Unknown Stat Drop string: " + string);
    }

    function onActivityBattle(requestData) {
        if(!requestData.json.b) {
            return;
        }

        activeData[modules.gainTypes.types.XP.id].addData(requestData.json.b.xp || 0, modules.gainSources.sources.Battle.id);
        activeData[modules.gainTypes.types.ClanXP.id].addData(requestData.json.b.cxp || 0, modules.gainSources.sources.Battle.id);

        activeData[modules.gainTypes.types.Gold.id].addData(requestData.json.b.g || 0, modules.gainSources.sources.Battle.id);
        activeData[modules.gainTypes.types.ClanGold.id].addData(requestData.json.b.cg || 0, modules.gainSources.sources.Battle.id);

        handleActivityDrop(requestData.json.b.dr, modules.gainSources.sources.Battle.id);
        handleStatDrop(requestData.json.b.sr, modules.gainSources.sources.Battle.id);

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

        handleActivityDrop(requestData.json.a.dr, modules.gainSources.sources.Tradeskill.id);
        handleStatDrop(requestData.json.a.sr, modules.gainSources.sources.Tradeskill.id);
    }

    function onActivityCraft(requestData) {
        if(!requestData.json.a) {
            return;
        }

        activeData[modules.gainTypes.types.CraftingXP.id].addData(requestData.json.a.xp || 0, modules.gainSources.sources.Crafting.id);

        handleActivityDrop(requestData.json.a.dr, modules.gainSources.sources.Crafting.id);
        handleStatDrop(requestData.json.a.sr, modules.gainSources.sources.Crafting.id);
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

        handleActivityDrop(requestData.json.b.dr, modules.gainSources.sources.Dungeon.id);
        handleStatDrop(requestData.json.b.sr, modules.gainSources.sources.Dungeon.id);
    }

    function onDungeonSearch(requestData) {
        if(!requestData.json.m) {
            return;
        }

        var match = requestData.json.m.match(/found a (.*?)!/);
        if(match && match.length === 2) {
            processMaterialDrop(match[1], 1, modules.gainSources.sources.DungeonSearch.id);
            return;
        }

        match = requestData.json.m.match(/found ([0-9,]+) (.*?)!/);
        if(match && match.length === 2) {
            var value = parseInt(match[1].replace(/,/g, ''));
            processMaterialDrop(match[2], value, modules.gainSources.sources.DungeonSearch.id);
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