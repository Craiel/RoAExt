(function () {
    'use strict';

    const UpdateInterval = 100;

    var updateTimer;
    var saveTimer;

    var activeData = {};
    var dropData = { dropTableBySource: {}, dropTableByItem: {} };
    var dropRegister = {};
    var dropRegisterById = {};
    var dropSourceRegister = {};
    var dropSourceRegisterById = {};

    var nextIngredientId = 1;
    var nextDropId = 1;

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

            case "crystal":
            case "crystals":
            case "Crystals": {
                activeData[modules.gainTypes.types.Crystal.id].addData(value || 0, source);
                return;
            }

            default: {

                if (name.includes(" Symbol")) {
                   // Symbols are ingredients but are tracked in here so we forward it
                    registerIngredientDrop(name, "Dungeon");
                    return;
                }

                console.warn("Unhandled Material Drop: " + name + "@" + value + " from " + source);
                return;
            }
        }
    }

    function handleActivityDrop(string) {
        if(string === null) {
            return;
        }

        var match = string.match(/>[\(]*([0-9,]+)[\)]* ([\w]+) .*?</i);
        if(match && match.length == 3) {
            var value = parseInt(match[1].replace(/,/g, ''));
            processMaterialDrop(match[2], value, modules.gainSources.sources.ActivityDrop.id);
            return;
        }

        match = string.match(/>[\(]*([0-9,]+)[\)]* ([\w]+)</i);
        if(match && match.length == 3) {
            var value = parseInt(match[1].replace(/,/g, ''));
            processMaterialDrop(match[2], value, modules.gainSources.sources.ActivityDrop.id);
            return;
        }

        match = string.match(/ Trash Compactor .*? ([0-9,]+) Crafting Material/i);
        if(match && match.length == 2) {
            var value = parseInt(match[1].replace(/,/g, ''));
            activeData[modules.gainTypes.types.Material.id].addData(value || 0, modules.gainSources.sources.TrashCompactor.id)
            activeData[modules.gainTypes.types.Item.id].addData(1, modules.gainSources.sources.ActivityDrop.id);
            return;
        }

        match = string.match(/\+([0-9]+) Crafting Materials \(<span/i);
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

            case "counter attack":
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

        var match = string.match(/>(.*?)<.*?improved by ([0-9]+)/i);
        if(match && match.length == 3) {
            var value = parseInt(match[2].replace(/,/g, ''));
            processStatDrop(match[1], value, source);
            return;
        }

        match = string.match(/\+([0-9\.]+)[%]* .*?>([\w\s]+)</i);
        if(match && match.length == 3) {
            var value = parseFloat(match[1].replace(/,/g, ''));
            processStatDrop(match[2], value, source);
            return;
        }

        console.warn("Unknown Stat Drop string: " + string);
    }

    function registerIngredientDrop(item, source) {
        if(!item || item === "undefined" || !source || source === "undefined") {
            return;
        }

        if(!dropRegister[item]){
            dropRegister[item] = nextIngredientId++;
            dropRegisterById[dropRegister[item]] = item;
        }

        if(!dropSourceRegister[source]){
            dropSourceRegister[source] = nextDropId++;
            dropSourceRegisterById[dropSourceRegister[source]] = source;
        }

        var dropId = dropRegister[item];
        var sourceId = dropSourceRegister[source];

        if(!dropData.dropTableBySource[sourceId]) {
            dropData.dropTableBySource[sourceId] = {};
        }

        if(!dropData.dropTableBySource[sourceId][dropId]) {
            dropData.dropTableBySource[sourceId][dropId] = 1;
        }

        if(!dropData.dropTableByItem[dropId]) {
            dropData.dropTableByItem[dropId] = {};
        }

        if(!dropData.dropTableByItem[dropId][sourceId]) {
            dropData.dropTableByItem[dropId][sourceId] = 1;
        }
    }

    function handleIngredientDrop(string, source, dropSource) {
        if(string === null) {
            return;
        }

        if(!dropSource) {
            console.warn("Ingredient drop from unknown source: " + string);
            dropSource = "Unknown";
        }

        var match = string.match(/took a[n]* (.*?) from /i);
        if(match && match.length == 2) {
            registerIngredientDrop(match[1], dropSource);
            activeData[modules.gainTypes.types.Ingredient.id].addData(1, source);
            return;
        }

        match = string.match(/\+a[n]* ([\w\s]+)/i);
        if(match && match.length == 2) {
            registerIngredientDrop(match[1], dropSource);
            activeData[modules.gainTypes.types.Ingredient.id].addData(1, source);
            return;
        }

        console.warn("Unhandled Ingredient Drop: " + string);
    }

    function onActivityBattle(requestData) {
        if(!requestData.json.b) {
            return;
        }

        // Some general stats
        activeData[modules.gainTypes.types.Battles.id].addData(1, modules.gainSources.sources.Battle.id);
        if(requestData.json.b.xp && requestData.json.b.xp > 0) {
            activeData[modules.gainTypes.types.EnemiesKilled.id].addData(1, modules.gainSources.sources.Battle.id);
        }

        // The result values
        activeData[modules.gainTypes.types.XP.id].addData(requestData.json.b.xp || 0, modules.gainSources.sources.Battle.id);
        activeData[modules.gainTypes.types.ClanXP.id].addData(requestData.json.b.cxp || 0, modules.gainSources.sources.Battle.id);

        activeData[modules.gainTypes.types.Gold.id].addData(requestData.json.b.g || 0, modules.gainSources.sources.Battle.id);
        activeData[modules.gainTypes.types.ClanGold.id].addData(requestData.json.b.cg || 0, modules.gainSources.sources.Battle.id);

        // Drops and effects
        handleActivityDrop(requestData.json.b.dr, modules.gainSources.sources.Battle.id);
        handleStatDrop(requestData.json.b.sr, modules.gainSources.sources.Battle.id);
        handleIngredientDrop(requestData.json.b.ir, modules.gainSources.sources.Battle.id, requestData.json.b.m.n);
    }

    function onActivityEvent(requestData) {

    }

    function onActivityTrade(requestData) {
        if(!requestData.json.a) {
            return;
        }

        activeData[modules.gainTypes.types.Harvests.id].addData(1, modules.gainSources.sources.Tradeskill.id);

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
        handleIngredientDrop(requestData.json.a.ir, modules.gainSources.sources.Tradeskill.id);
    }

    function onActivityCraft(requestData) {
        if(!requestData.json.a) {
            return;
        }

        activeData[modules.gainTypes.types.Crafts.id].addData(1, modules.gainSources.sources.Tradeskill.id);

        activeData[modules.gainTypes.types.CraftingXP.id].addData(requestData.json.a.xp || 0, modules.gainSources.sources.Crafting.id);

        handleActivityDrop(requestData.json.a.dr, modules.gainSources.sources.Crafting.id);
        handleStatDrop(requestData.json.a.sr, modules.gainSources.sources.Crafting.id);
        handleIngredientDrop(requestData.json.a.ir, modules.gainSources.sources.Crafting.id);
    }

    function onDungeonBattle(requestData) {
        if(!requestData.json.b) {
            return;
        }

        // Some general stats
        activeData[modules.gainTypes.types.Battles.id].addData(1, modules.gainSources.sources.Dungeon.id);
        if(requestData.json.b.xp && requestData.json.b.xp > 0) {
            activeData[modules.gainTypes.types.EnemiesKilled.id].addData(1, modules.gainSources.sources.Dungeon.id);
        }

        activeData[modules.gainTypes.types.XP.id].addData(requestData.json.b.xp || 0, modules.gainSources.sources.Dungeon.id);
        activeData[modules.gainTypes.types.ClanXP.id].addData(requestData.json.b.cxp || 0, modules.gainSources.sources.Dungeon.id);

        activeData[modules.gainTypes.types.Gold.id].addData(requestData.json.b.g || 0, modules.gainSources.sources.Dungeon.id);
        activeData[modules.gainTypes.types.ClanGold.id].addData(requestData.json.b.cg || 0, modules.gainSources.sources.Dungeon.id);

        activeData[modules.gainTypes.types.DungeonPoint.id].addData(requestData.json.b.dp || 0, modules.gainSources.sources.Dungeon.id);

        handleActivityDrop(requestData.json.b.dr, modules.gainSources.sources.Dungeon.id);
        handleStatDrop(requestData.json.b.sr, modules.gainSources.sources.Dungeon.id);
        handleIngredientDrop(requestData.json.b.ir, modules.gainSources.sources.Dungeon.id, requestData.json.b.m.n);
    }

    function onDungeonSearch(requestData) {
        if(!requestData.json.m) {
            return;
        }

        activeData[modules.gainTypes.types.DungeonRoomsSearched.id].addData(1, modules.gainSources.sources.DungeonSearch.id);

        // Ignore some general flavor strings that give nothing
        if(requestData.json.m.includes(". . . lost . . .")
        || requestData.json.m.includes("best to just leave")
        || requestData.json.m.includes("found nothing of importance")) {
            return;
        }

        var match = requestData.json.m.match(/found a (.*?)!/i);
        if(match && match.length === 2) {
            processMaterialDrop(match[1], 1, modules.gainSources.sources.DungeonSearch.id);
            return;
        }

        match = requestData.json.m.match(/found ([0-9,]+) (.*?)!/i);
        if(match && match.length === 3) {
            var value = parseInt(match[1].replace(/,/g, ''));
            processMaterialDrop(match[2], value, modules.gainSources.sources.DungeonSearch.id);
            return;
        }

        console.log('Unhandled Dungeon Search String: ' + requestData.json.m);
    }

    function onUpdate() {
        for (var key in activeData) {
            activeData[key].update();
        }
    }

    function save() {
        var data = {
            g: {},
            drt: {},
            ir: {},
            mr: {}
        };

        for (var key in activeData) {
            data.g[key] = activeData[key].save();
        }

        for (var key in dropRegisterById) {
            data.ir[key] = dropRegisterById[key];
        }

        for (var key in dropSourceRegisterById) {
            data.mr[key] = dropSourceRegisterById[key];
        }

        for (var sourceId in dropData.dropTableBySource) {
            data.drt[sourceId] = [];
            for (var itemId in dropData.dropTableBySource[sourceId]) {
                data.drt[sourceId].push(itemId);
            }
        }

        modules.settings.settings.gainData = data;
    }

    function load() {
        // gain data
        for (var key in modules.settings.settings.gainData.g) {
            if(activeData[key]) {
                activeData[key].load(modules.settings.settings.gainData.g[key]);
            }
        }

        // ingredient data
        for (var sourceId in modules.settings.settings.gainData.drt) {
            var mobName = modules.settings.settings.gainData.mr[sourceId];
            for (var i = 0; i < modules.settings.settings.gainData.drt[sourceId].length; i++) {
                var itemId = modules.settings.settings.gainData.drt[sourceId][i];
                var itemName = modules.settings.settings.gainData.ir[itemId];

                registerIngredientDrop(itemName, mobName);
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
            updateTimer.set(onUpdate, UpdateInterval);

            saveTimer = modules.createInterval("GainTackerSave");
            saveTimer.set(save, modules.constants.GainTrackerAutoSaveInterval);

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
        },
        getDropInfoByItem: function () {
            var result = {};
            for(var itemId in dropData.dropTableByItem) {
                var name = dropRegisterById[itemId];
                if(!result[name]) {
                    result[name] = [];
                }

                for(var sourceId in dropData.dropTableByItem[itemId]) {
                    var item = dropSourceRegisterById[sourceId];
                    result[name].push(item);
                }
            }

            return result;
        }
    });

    PlayerGainTracker.prototype.constructor = PlayerGainTracker;

    modules.playerGainTracker = new PlayerGainTracker();

})();