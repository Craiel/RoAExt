(function ($) {
    'use strict';

    var timer;
    var template;

    var displayKills;
    var displayHarvests;
    var displayCrafts;

    var displayXP;
    var displayGold;
    var displayResources;
    var displayCraftingXP;

    var displayClanXP;
    var displayClanGold;
    var displayClanResources;

    function updateDisplay() {
        var data = modules.playerGainTracker.getData(modules.gainTypes.types.EnemiesKilled.id);
        displayKills.text(data.getCurrentPerHourValue().toFixed(0) + " / Hr");

        data = modules.playerGainTracker.getData(modules.gainTypes.types.Harvests.id);
        displayHarvests.text(data.getCurrentPerHourValue().toFixed(0) + " / Hr");

        data = modules.playerGainTracker.getData(modules.gainTypes.types.Crafts.id);
        displayCrafts.text(data.getCurrentPerHourValue().toFixed(0) + " / Hr");

        data = modules.playerGainTracker.getData(modules.gainTypes.types.XP.id);
        var xpHourValue = data.getCurrentPerHourValue();
        var ttlh = 0;
        var ttlm = 0;
        if(xpHourValue > 0) {
            var xpCurrent = modules.utils.getElementIntValue("currentXP");
            var xpRequired = modules.utils.getElementIntValue("levelCost");
            var ttl = ((xpRequired - xpCurrent) / xpHourValue).toFixed(2);
            ttlh = Math.floor(ttl);
            ttlm = Math.floor((ttl % 1).toFixed(2) * 60);
        }

        displayXP.text(xpHourValue.toFixed(0) + " / Hr (TTL: " + ttlh + "h " + ttlm + "m)");

        data = modules.playerGainTracker.getData(modules.gainTypes.types.Gold.id);
        displayGold.text(data.getCurrentPerHourValue().toFixed(0) + " / Hr");

        var dataFood = modules.playerGainTracker.getData(modules.gainTypes.types.Food.id);
        var dataWood = modules.playerGainTracker.getData(modules.gainTypes.types.Wood.id);
        var dataIron = modules.playerGainTracker.getData(modules.gainTypes.types.Iron.id);
        var dataStone = modules.playerGainTracker.getData(modules.gainTypes.types.Stone.id);
        var combinedValue = dataFood.getCurrentPerHourValue() + dataWood.getCurrentPerHourValue() + dataIron.getCurrentPerHourValue() + dataStone.getCurrentPerHourValue();
        displayResources.text(combinedValue.toFixed(0) + " / Hr");

        data = modules.playerGainTracker.getData(modules.gainTypes.types.CraftingXP.id);
        displayCraftingXP.text(data.getCurrentPerHourValue().toFixed(0) + " / Hr");

        data = modules.playerGainTracker.getData(modules.gainTypes.types.ClanXP.id);
        displayClanXP.text(data.getCurrentPerHourValue().toFixed(0) + " / Hr");

        data = modules.playerGainTracker.getData(modules.gainTypes.types.ClanGold.id);
        displayClanGold.text(data.getCurrentPerHourValue().toFixed(0) + " / Hr");

        dataFood = modules.playerGainTracker.getData(modules.gainTypes.types.ClanFood.id);
        dataWood = modules.playerGainTracker.getData(modules.gainTypes.types.ClanWood.id);
        dataIron = modules.playerGainTracker.getData(modules.gainTypes.types.ClanIron.id);
        dataStone = modules.playerGainTracker.getData(modules.gainTypes.types.ClanStone.id);
        var combinedValue = dataFood.getCurrentPerHourValue() + dataWood.getCurrentPerHourValue() + dataIron.getCurrentPerHourValue() + dataStone.getCurrentPerHourValue();
        displayClanResources.text(combinedValue.toFixed(0) + " / Hr");
    }

    function createDisplay(target, id) {
        var entryTemplate = template.replace("%ID%", id);

        var $target = $('#' + target);
        $target.parent().after(entryTemplate);

        return $('#' + id);
    }

    function GainPerHourDisplay() {
        RoAModule.call(this, "Gain per hour Display");
    }

    GainPerHourDisplay.prototype = Object.spawn(RoAModule.prototype, {
        load: function () {
            template = modules.templates.perHourGain;
            template = template.replace("%COLOR%", modules.constants.PerHourColor);
            template = template.replace("%SIZE%", modules.constants.PerHourSize);

            displayKills = createDisplay("gainsKills", "RoAExt_killsHour");
            displayHarvests = createDisplay("gainsAttempts", "RoAExt_harvestsHour");
            displayCrafts = createDisplay("gainsCraftingAttempts", "RoAExt_craftsHour");

            displayXP = createDisplay("gainsXP", "RoAExt_xpHour");
            displayGold = createDisplay("gainsGold", "RoAExt_goldHour");
            displayResources = createDisplay("gainsResources", "RoAExt_resHour");
            displayCraftingXP = createDisplay("gainsCraftingXP", "RoAExt_craftXPHour");

            displayClanXP = createDisplay("gainsClanXP", "RoAExt_xpHourClan");
            displayClanGold = createDisplay("gainsClanGold", "RoAExt_goldHourClan");
            displayClanResources = createDisplay("gainsClanResources", "RoAExt_resHourClan");

            /*$('#battleGains').find('td').first().removeAttr('colspan').after('<td class="timeCounter" title="' + Date.now() + '"><span class="timeCounterHr">00</span>:<span class="timeCounterMin">00</span>:<span class="timeCounterSec">00</span></td>');
            $('#tradeskillGains').find('td').first().removeAttr('colspan').after('<td class="timeCounter" title="' + Date.now() + '"><span class="timeCounterHr">00</span>:<span class="timeCounterMin">00</span>:<span class="timeCounterSec">00</span></td>');
            $('#gainsXP').parent().after('<tr class="hidden-xs hidden-sm visible-md visible-lg" style="color: #' + modules.constants.perHourColor + '; font-size: ' + modules.constants.perHourSize+ 'px"></td><td id="xpPerHr" colspan="2" style="text-align: center;"></td></tr>');
            $('#gainsGold').parent().after('<tr class="hidden-xs hidden-sm visible-md visible-lg" style="color: #' + modules.constants.perHourColor + '; font-size: ' + modules.constants.perHourSize+ 'px"><td id="goldPerHr" colspan="2" style="text-align: center;"></td></tr>');
            $('#gainsClanXP').parent().after('<tr class="hidden-xs hidden-sm visible-md visible-lg" style="color: #' + modules.constants.perHourColor + '; font-size: ' + modules.constants.perHourSize+ 'px"><td id="clanXpPerHr" colspan="2" style="text-align: center;"></td></tr>');
            $('#gainsClanGold').parent().after('<tr class="hidden-xs hidden-sm visible-md visible-lg" style="color: #' + modules.constants.perHourColor + '; font-size: ' + modules.constants.perHourSize+ 'px"><td id="clanGoldPerHr" colspan="2" style="text-align: center;"></td></tr>');
            $('#gainsResources').parent().after('<tr class="visible-xs-inline-block visible-sm-inline-block visible-md visible-lg" style="color: #' + modules.constants.perHourColor + '; font-size: ' + modules.constants.perHourSize+ 'px"><td id="resPerHr" colspan="2" style="text-align: center;"></td></tr>');
            $('#gainsClanResources').parent().after('<tr class="visible-xs-inline-block visible-sm-inline-block visible-md visible-lg" style="color: #' + modules.constants.perHourColor + '; font-size: ' + modules.constants.perHourSize+ 'px"><td id="clanResPerHr" colspan="2" style="text-align: center;"></td></tr>');
*/

            timer = modules.createInterval("GainPerHourDisplay");
            timer.set(updateDisplay, 500);

            RoAModule.prototype.load.apply(this);
        }
    });

    GainPerHourDisplay.prototype.constructor = GainPerHourDisplay;

    modules.gainPerHourDisplay = new GainPerHourDisplay();

})(modules.jQuery);