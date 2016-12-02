var AVBUTrackers = (function () {
    'use strict';

    var module = {};

    var questNoticeOn = false, numBattles = 0, numRounds = 0, numAttacks = 0, numMulti = 0, numHits = 0, numMisses = 0,
        numUntrackedHits = 0, numCrits = 0, numUntrackedCrits = 0, numCounters = 0, numSpells = 0,
        numHeals = 0, numHealableRounds = 0, numEvade = 0, numAttacksTaken = 0,
        hitTot = 0, hitMax = 0, hitMin = 999999999, hitAvg = 0,
        critTot = 0, critMax = 0, critMin = 999999999, critAvg = 0,
        spellTot = 0, spellMax = 0, spellMin = 999999999, spellAvg = 0,
        counterTot = 0, counterMax = 0, counterMin = 999999999, counterAvg = 0,
        healTot = 0, healMax = 0, healMin = 999999999, healAvg = 0;

    function addTimeCounter() {
        $('#battleGains').find('td').first().removeAttr('colspan').after('<td class="timeCounter" title="' + Date.now() + '"><span class="timeCounterHr">00</span>:<span class="timeCounterMin">00</span>:<span class="timeCounterSec">00</span></td>');
        $('#tradeskillGains').find('td').first().removeAttr('colspan').after('<td class="timeCounter" title="' + Date.now() + '"><span class="timeCounterHr">00</span>:<span class="timeCounterMin">00</span>:<span class="timeCounterSec">00</span></td>');
        $('#gainsXP').parent().after('<tr class="hidden-xs hidden-sm visible-md visible-lg" style="color: #' + constants.perHourColor + '; font-size: ' + constants.perHourSize+ 'px"></td><td id="xpPerHr" colspan="2" style="text-align: center;"></td></tr>');
        $('#gainsGold').parent().after('<tr class="hidden-xs hidden-sm visible-md visible-lg" style="color: #' + constants.perHourColor + '; font-size: ' + constants.perHourSize+ 'px"><td id="goldPerHr" colspan="2" style="text-align: center;"></td></tr>');
        $('#gainsClanXP').parent().after('<tr class="hidden-xs hidden-sm visible-md visible-lg" style="color: #' + constants.perHourColor + '; font-size: ' + constants.perHourSize+ 'px"><td id="clanXpPerHr" colspan="2" style="text-align: center;"></td></tr>');
        $('#gainsClanGold').parent().after('<tr class="hidden-xs hidden-sm visible-md visible-lg" style="color: #' + constants.perHourColor + '; font-size: ' + constants.perHourSize+ 'px"><td id="clanGoldPerHr" colspan="2" style="text-align: center;"></td></tr>');
        $('#gainsResources').parent().after('<tr class="visible-xs-inline-block visible-sm-inline-block visible-md visible-lg" style="color: #' + constants.perHourColor + '; font-size: ' + constants.perHourSize+ 'px"><td id="resPerHr" colspan="2" style="text-align: center;"></td></tr>');
        $('#gainsClanResources').parent().after('<tr class="visible-xs-inline-block visible-sm-inline-block visible-md visible-lg" style="color: #' + constants.perHourColor + '; font-size: ' + constants.perHourSize+ 'px"><td id="clanResPerHr" colspan="2" style="text-align: center;"></td></tr>');
    }

    function addBattleTracker() {
        // Add wrapper for the battle tracker
        $('#modalWrapper').after('<div id="battleTrackerWrapper" style="width: 450px;" class="container ui-element border2 ui-draggable customWindowWrapper"><div class="row"><h4 id="battleTrackerTitle" class="center toprounder ui-draggable-handle">Battle Tracker</h4><span id="closeBattleTracker" class="closeCustomWindow"><a>�</a></span><div class="customWindowContent"><table><thead><tr><th colspan="3">Battles: <span id="battleTrackerBattles"></span></th><th colspan="3">Rounds: <span id="battleTrackerRounds"></span></th></tr></thead><tbody><tr><th>Action</th><th style="border-right: none;">Count/Max</th><th style="border-left: none;">Percent</th><th style="border-right: none;">Min</th><th style="border-right: none; border-left: none;">Max</th><th style="border-left: none;">Average</th></tr><tr><td class="bRight">Hit</td><td id="battleTrackerHitCnt"></td><td id="battleTrackerHitPerc" class="bRight"></td><td id="battleTrackerHitMin"></td><td id="battleTrackerHitMax"></td><td id="battleTrackerHitAvg"></td></tr><tr><td class="bRight">Crit</td><td id="battleTrackerCritCnt"></td><td id="battleTrackerCritPerc" class="bRight"></td><td id="battleTrackerCritMin"></td><td id="battleTrackerCritMax"></td><td id="battleTrackerCritAvg"></td></tr><tr><td class="bRight">Spell</td><td id="battleTrackerSpellCnt"></td><td id="battleTrackerSpellPerc" class="bRight"></td><td id="battleTrackerSpellMin"></td><td id="battleTrackerSpellMax"></td><td id="battleTrackerSpellAvg"></td></tr><tr><td class="bRight">Counter</td><td id="battleTrackerCounterCnt"></td><td id="battleTrackerCounterPerc" class="bRight"></td><td id="battleTrackerCounterMin"></td><td id="battleTrackerCounterMax"></td><td id="battleTrackerCounterAvg"></td></tr><tr><td class="bRight">Heal</td><td id="battleTrackerHealCnt"></td><td id="battleTrackerHealPerc" class="bRight"></td><td id="battleTrackerHealMin"></td><td id="battleTrackerHealMax"></td><td id="battleTrackerHealAvg"></td></tr><tr><td class="bRight">Multistrike</td><td id="battleTrackerMultiCnt"></td><td id="battleTrackerMultiPerc" class="bRight"></td><td colspan="3"></td></tr><tr><tr><td class="bRight">Evade</td><td id="battleTrackerEvadeCnt"></td><td id="battleTrackerEvadePerc" class="bRight"></td><td colspan="3"></td></tr></tbody></table></div></div></div>');

        // Make it a draggable and resizable window
        $('#battleTrackerWrapper').draggable({ handle: '#battleTrackerTitle' }).resizable({ minHeight: 201, minWidth: 350 });

        // Enable the close button on the battle tracker window
        $('#closeBattleTracker').on('click', function(e) {
            e.preventDefault();
            $('#battleTrackerWrapper').fadeOut('medium');
        });

        // Replace the Battle Stats label with one that opens the battle tracker window.
        $('#battleGains>h5').before('<a style="text-decoration: none;" onclick="$(\'#battleTrackerWrapper\').fadeIn(\'medium\');"><h5 class="toprounder center">Battle Stats</h5></a>').remove();
    }

    function addDropTracker(){
        // Add tracker content to the modal list
        $('#modalWrapper').after('<div id="dropsTrackerWrapper" style="width: 450px;" class="container ui-element border2 ui-draggable customWindowWrapper"><div class="row"><h4 id="dropsTrackerTitle" class="center toprounder ui-draggable-handle">Drop Tracker</h4><span id="closeDropsTracker" class="closeCustomWindow"><a>�</a></span><div class="customWindowContent"><table id="dropsTable"><thead><tr id="dropsTableTimer"><th class="bRight" style="max-width: 95px;">Categories</th><th colspan="2" class="bRight">Kills: <span class="numKills">0</span></th><th colspan="2" class="bRight">Harvests: <span class="numHarvests">0</span></th><th class="timeCounter" title="' + Date.now() + '" style="max-width: 80px;"><span class="timeCounterHr">00</span>:<span class="timeCounterMin">00</span>:<span class="timeCounterSec">00</span></th></tr></thead><tbody><tr><td class="bRight">Stats</td><td class="numStatsK">0</td><td class="bRight"><span class="percent" data-n="numStatsK" data-d="numKills">0.00</span> %</td><td class="numStatsH">0</td><td class="bRight"><span class="percent" data-n="numStatsH" data-d="numHarvests">0.00</span> %</td><td id="statsPerHr"></td></tr><tr><td class="bRight">Loot</td><td class="numLootK">0</td><td class="bRight"><span class="percent" data-n="numLootK" data-d="numKills">0.00</span> %</td><td class="numLootH">0</td><td class="bRight"><span class="percent" data-n="numLootH" data-d="numHarvests">0.00</span> %</td><td id="lootPerHr"></td></tr><tr><td class="bRight">Ingredients</td><td class="numIngredientsK">0</td><td class="bRight"><span class="percent" data-n="numIngredientsK" data-d="numKills">0.00</span> %</td><td class="numIngredientsH">0</td><td class="bRight"><span class="percent" data-n="numIngredientsH" data-d="numHarvests">0.00</span> %</td><td id="ingredientsPerHr"></td></tr></tbody><thead><tr><th class="bRight">Stats</th><th colspan="2" class="bRight">K Stats: <span class="numStatsK">0</span></th><th colspan="2" class="bRight">H Stats: <span class="numStatsH">0</span></th><td><a id="resetDropTable">Reset</a></td></tr></thead><tbody><tr><td class="bRight">Strength</td><td class="strK">0</td><td class="bRight"><span class="percent" data-n="strK" data-d="numStatsK">0.00</span> %</td><td class="strH">0</td><td class="bRight"><span class="percent" data-n="strH" data-d="numStatsH">0.00</span> %</td></tr><tr><td class="bRight">Health</td><td class="heaK">0</td><td class="bRight"><span class="percent" data-n="heaK" data-d="numStatsK">0.00</span> %</td><td class="heaH">0</td><td class="bRight"><span class="percent" data-n="heaH" data-d="numStatsH">0.00</span> %</td></tr><tr><td class="bRight">Coordination</td><td class="coordK">0</td><td class="bRight"><span class="percent" data-n="coordK" data-d="numStatsK">0.00</span> %</td><td class="coordH">0</td><td class="bRight"><span class="percent" data-n="coordH" data-d="numStatsH">0.00</span> %</td></tr><tr><td class="bRight">Agility</td><td class="agiK">0</td><td class="bRight"><span class="percent" data-n="agiK" data-d="numStatsK">0.00</span> %</td><td class="agiH">0</td><td class="bRight"><span class="percent" data-n="agiH" data-d="numStatsH">0.00</span> %</td></tr><tr><td class="bRight">Counter</td><td class="counterK">0</td><td class="bRight"><span class="percent" data-n="counterK" data-d="numStatsK">0.00</span> %</td><td></td><td class="bRight"></td></tr><tr><td class="bRight">Healing</td><td class="healingK">0</td><td class="bRight"><span class="percent" data-n="healingK" data-d="numStatsK">0.00</span> %</td><td></td><td class="bRight"></td></tr><tr><td class="bRight">Weapon</td><td class="weaponK">0</td><td class="bRight"><span class="percent" data-n="weaponK" data-d="numStatsK">0.00</span> %</td><td></td><td class="bRight"></td></tr><tr><td class="bRight">Evasion</td><td class="evasionK">0</td><td class="bRight"><span class="percent" data-n="evasionK" data-d="numStatsK">0.00</span> %</td><td></td><td class="bRight"></td></tr></tbody><thead><tr><th class="bRight">Loot</th><th colspan="2" class="bRight">K Loot: <span class="numLootK">0</span></th><th colspan="2" class="bRight">H Loot: <span class="numLootH">0</span></th></tr></thead><tbody><tr><td class="bRight">Gear & Gems</td><td class="gearK">0</td><td class="bRight"><span class="percent" data-n="gearK" data-d="numLootK">0.00</span> %</td><td class="gearH">0</td><td class="bRight"><span class="percent" data-n="gearH" data-d="numLootH">0.00</span> %</td></tr><tr><td class="bRight">Gold</td><td class="goldK">0</td><td class="bRight"><span class="percent" data-n="goldK" data-d="numLootK">0.00</span> %</td><td class="goldH">0</td><td class="bRight"><span class="percent" data-n="goldH" data-d="numLootH">0.00</span> %</td></tr><tr><td class="bRight">Platinum</td><td class="platK">0</td><td class="bRight"><span class="percent" data-n="platK" data-d="numLootK">0.00</span> %</td><td class="platH">0</td><td class="bRight"><span class="percent" data-n="platH" data-d="numLootH">0.00</span> %</td></tr><tr><td class="bRight">Crafting Mats</td><td class="craftK">0</td><td class="bRight"><span class="percent" data-n="craftK" data-d="numLootK">0.00</span> %</td><td class="craftH">0</td><td class="bRight"><span class="percent" data-n="craftH" data-d="numLootH">0.00</span> %</td></tr><tr><td class="bRight">Gem Fragment</td><td class="fragK">0</td><td class="bRight"><span class="percent" data-n="fragK" data-d="numLootK">0.00</span> %</td><td class="fragH">0</td><td class="bRight"><span class="percent" data-n="fragH" data-d="numLootH">0.00</span> %</td></tr><tr><td class="bRight">Crystals (lol)</td><td class="crystalK">0</td><td class="bRight"><span class="percent" data-n="crystalK" data-d="numLootK">0.00</span> %</td><td class="crystalH">0</td><td class="bRight"><span class="percent" data-n="crystalH" data-d="numLootH">0.00</span> %</td></tr></tbody></table></div></div></div>');
        $('#resetDropTable').on('click', function() {
            $('#dropsTableTimer .timeCounter').attr('title',Date.now()); $('#dropsTableTimer .timeCounter>span').text('00');
            $('.numKills, .numHarvests, .numStatsK, .numStatsH, .numLootK, .numLootH, .numIngredientsK, .numIngredientsH, .strK, .strH, .heaK, .heaH, .coordK, .coordH, .agiK, .agiH, .counterK, .healingK, .weaponK, .evasionK, .gearK, .gearH, .goldK, .goldH, .platK, .platH, .craftK, .craftH, .fragK, .fragH, .crystalK, .crystalH').text('0');
            $('.percent').text('0.00');
        });

        // Make it a draggable and resizable window
        $('#dropsTrackerWrapper').draggable({ handle: '#dropsTrackerTitle' }).resizable({ minHeight: 397, minWidth: 350 });

        // Enable the close button on the battle tracker window
        $('#closeDropsTracker').on('click', function(e) {
            e.preventDefault();
            $('#dropsTrackerWrapper').fadeOut('medium');
        });

        // Replace the Recent Activity label with one that opens the drop tracker window.
        $('#activityWrapper>h5').before('<a style="text-decoration: none;" onclick="$(\'#dropsTrackerWrapper\').fadeIn(\'medium\');"><h5 class="center toprounder">Recent Activity</h5></a>').remove();
    }

    function addIngredientTracker() {
        // Add wrapper for the ingredient tracker
        $('#modalWrapper').after('<div id="ingredientTrackerWrapper" style="width: 300px" class="container ui-element border2 ui-draggable customWindowWrapper"><div class="row"><h4 id="ingredientTrackerTitle" class="center toprounder ui-draggable-handle">Ingredient Tracker</h4><span id="closeIngredientTracker" class="closeCustomWindow"><a>�</a></span><div class="customWindowContent"><div id="ingredientTrackerContentWrapper" style="height: 250px;"><table><thead><tr><th>Ingredient</th><th>Enemy / Tool</th></tr></thead><tbody id="ingredientDropList">' + loadIngredientDropList() + '</tbody></table></div></div></div></div>');

        // Make it a draggable and resizable window
        $('#ingredientTrackerWrapper').draggable({ handle: '#ingredientTrackerTitle' }).resizable({ minHeight: 200, minWidth: 300, resize: function(e, ui) {$('#ingredientTrackerContentWrapper').height($('#ingredientTrackerWrapper').height() - $('#ingredientTrackerTitle').outerHeight(true) - 10);} });

        // Enable the close button on the ingredient tracker window
        $('#closeIngredientTracker').on('click', function(e) {
            e.preventDefault();
            $('#ingredientTrackerWrapper').fadeOut('medium');
        });

        $('#ingredientTrackerContentWrapper').mCustomScrollbar();

        // Replace the Ingredient Stats label with one that opens the ingredient tracker window.
        $('#clearLootGains').after('<a style="float: right; margin-right: 15px; text-decoration: none;" onclick="$(\'#ingredientTrackerWrapper\').fadeIn(\'medium\');">Ingredient Tracker</a>');
    }

    function timeCounter() {
        if(constants.ENABLE_XP_GOLD_RESOURCE_PER_HOUR) {
            var diffSec = Math.round((Date.now() - Number($('#battleGains .timeCounter').first().attr('title'))) / 1000);

            var xpHourValue = Math.floor(Number($('#gainsXP').attr('data-value'))/(diffSec / 3600));
            var xpCurrent = parseInt($('#currentXP').text().replace(/\,/g, ''));
            var xpRequired = parseInt($('#levelCost').text().replace(/\,/g, ''));
            var ttl = ((xpRequired - xpCurrent) / xpHourValue).toFixed(2);
            var ttlh = Math.floor(ttl);
            var ttlm = Math.floor((ttl % 1).toFixed(2) * 60);

            $('#battleGains .timeCounterHr, #tradeskillGains .timeCounterHr').text(('0' + Math.floor(diffSec / 3600)).slice(-2));
            $('#battleGains .timeCounterMin, #tradeskillGains .timeCounterMin').text(('0' + Math.floor(diffSec / 60) % 60).slice(-2));
            $('#battleGains .timeCounterSec, #tradeskillGains .timeCounterSec').text(('0' + diffSec % 60).slice(-2));
            $('#xpPerHr').text(xpHourValue.toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",") + " / Hr (TTL: " + ttlh + "h " + ttlm + "m)");
            $('#clanXpPerHr').text(Math.floor(Number($('#gainsClanXP').attr('data-value'))/(diffSec / 3600)).toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",") + " / Hr");
            $('#goldPerHr').text(Math.floor(Number($('#gainsGold').attr('data-value'))/(diffSec / 3600)).toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",") + " / Hr");
            $('#clanGoldPerHr').text(Math.floor(Number($('#gainsClanGold').attr('data-value'))/(diffSec / 3600)).toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",") + " / Hr");
            $('#resPerHr').text(Math.floor(Number($('#gainsResources').attr('data-value'))/(diffSec / 3600)).toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",") + " / Hr");
            $('#clanResPerHr').text(Math.floor(Number($('#gainsClanResources').attr('data-value'))/(diffSec/3600)).toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",") + " / Hr");
        }
        if(constants.ENABLE_DROP_TRACKER) {
            var diffSec = Math.round((Date.now() - Number($('#dropsTableTimer .timeCounter').first().attr('title'))) / 1000);
            $('#dropsTableTimer .timeCounterHr').text(('0' + Math.floor(diffSec / 3600)).slice(-2));
            $('#dropsTableTimer .timeCounterMin').text(('0' + Math.floor(diffSec / 60) % 60).slice(-2));
            $('#dropsTableTimer .timeCounterSec').text(('0' + diffSec % 60).slice(-2));
            $('#statsPerHr').text(Math.floor((Number($('.numStatsK').first().text()) + Number($('.numStatsH').first().text())) / (diffSec / 3600)).toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",") + " / Hr");
            $('#lootPerHr').text(Math.floor((Number($('.numLootK').first().text()) + Number($('.numLootH').first().text())) / (diffSec / 3600)).toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",") + " / Hr");
            $('#ingredientsPerHr').text(Math.floor((Number($('.numIngredientsK').first().text()) + Number($('.numIngredientsH').first().text())) / (diffSec / 3600)).toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",") + " / Hr");
        }
    }

    function parseBoostsPhp(data) {
        $('#permanentBoostWrapper>div:eq(5)').find('input.boost_count').val();
        var curReduced = 100 - 100 / (1 + data.boosts[4].tv / 100);
        var nxtReduced = 100 - 100 / (1 + (data.boosts[4].tv + 1) / 100);
        $('#questBoostInfo').remove();
        $('#permanentBoostWrapper>div:eq(5)>div:eq(1)').find('div.boost_unmaxed').before('<span id="questBoostInfo" style="position: absolute;left: 0;">Cur: (' + curReduced.toFixed(2) + '%)<br />Nxt: (' + nxtReduced.toFixed(2) + '%)</span>');
    }

    function parseAutobattlePhp(battle) {
        if(battle == null || battle.b == null)
        {
            return;
        }

        if(constants.ENABLE_QUEST_COMPLETE_NOTICE && battle.b.qf.indexOf("You have completed your quest!  Visit the") > -1)
            fadeOutNonQuest();
        else if(questNoticeOn)
            fadeInNonQuest();

        // An ingredient has dropped for Ingredient Tracker
        if(battle.b.ir && constants.ENABLE_INGREDIENT_TRACKER) {
            if(typeof Storage !== "undefined") {
                if(!localStorage.LocDrops)
                    localStorage.LocDrops = "{}";
                var item = (battle.b.ir).replace(/\+|<.*?>/img, "");
                var enemy = battle.b.m.n;
                var drops = JSON.parse(localStorage.LocDrops);
                if(drops[item] === undefined)
                    drops[item] = {};
                drops[item][enemy] = "";
                localStorage.LocDrops = JSON.stringify(drops);
            }
            else
                console.log("No Web Storage support to track drops.");
            $('#ingredientDropList').html(loadIngredientDropList());
        }

        // Battle was won and Drop Tracker enabled
        if(battle.b.r && constants.ENABLE_DROP_TRACKER) {
            incrementCell('numKills');

            // This means an ingredient has dropped
            if(battle.b.ir)
                incrementCell('numIngredientsK');

            // This means a stat has dropped
            if(battle.b.sr) {
                incrementCell('numStatsK');
                var id = "";
                switch(/.*?>(.*?)</im.exec(battle.b.sr)[1]) {
                    case 'strength': id = 'strK'; break;
                    case 'health': id = 'heaK'; break;
                    case 'coordination': id = 'coordK'; break;
                    case 'agility': id = 'agiK'; break;
                    case 'counter attacking':
                    case 'counter attack': id = 'counterK'; break;
                    case 'healing': id = 'healingK'; break;
                    case 'evasion': id = 'evasionK'; break;
                    case 'unarmed combat':
                    case 'melee weapons':
                    case 'ranged weapons':
                    case 'magical weapons': id = 'weaponK';
                }
                incrementCell(id);
            }

            // This means loot has dropped
            if(battle.b.dr) {
                incrementCell('numLootK');
                var id = "";
                switch(/(Tooltip).*?>|>.*?(platinum coin|gold coin|crafting|gem frag|crystal).*?</.exec(battle.b.dr).splice(1,2).join("")) {
                    case 'Tooltip': id = "gearK"; break;
                    case 'platinum coin': id = "platK"; break;
                    case 'gold coin': id = "goldK"; break;
                    case 'crafting': id = "craftK"; break;
                    case 'gem frag': id = "fragK"; break;
                    case 'crystal': id = "crystalK";
                }
                incrementCell(id);
            }
            calcPercentCells();
        }

        // Everything after this is for the Battle Tracker
        // Also, we cannot track combat if round-by-round option is not on.
        if(battle.b.bt === null || !constants.ENABLE_BATTLE_TRACKER)
            return;

        numBattles ++;
        numRounds += battle.b.ro;
        numAttacksTaken += battle.b.p.d + battle.b.m.h;

        numCounters += battle.b.p.ca;
        counterTot += battle.b.p.cd;
        counterAvg = (counterTot / numCounters).toFixed(0);
        numSpells += battle.b.p.sc;
        spellTot += battle.b.p.sd;
        spellAvg = (spellTot / numSpells).toFixed(0);
        numHeals += battle.b.p.hep;
        healTot += battle.b.p.he;
        healAvg = (healTot / numHeals).toFixed(0);
        numEvade += battle.b.p.d;

        var takenDamage = false;
        // Loop through the actions.
        for (var act of battle.b.bt) {
            if(act.npc === null)
                if(act.type == "heal") {
                    healMax = Math.max(healMax, act.dmg);
                    healMin = Math.min(healMin, act.dmg);
                }
                else if(act.type == "counter") {
                    counterMax = Math.max(counterMax, act.dmg);
                    counterMin = Math.min(counterMin, act.dmg);
                }
                else if(act.type == "spell") {
                    spellMax = Math.max(spellMax, act.dmg);
                    spellMin = Math.min(spellMin, act.dmg);
                }
                else if(act.type == "hit") {
                    // Track other variables
                    numAttacks += act.hits + act.misses;
                    numHits += act.hits;
                    numMisses += act.misses;
                    numCrits += act.crit;
                    if(act.hits + act.misses > 1) {
                        numMulti += act.hits + act.misses - 1;
                        // If all attacks in multi are crit, add to crit total. Min/Max not tracked across multistrike.
                        if(act.hits == act.crit)
                            critTot += act.dmg;
                        // If no attacks in multi are crit, add to hit total. Min/Max not tracked across multistrike.
                        else if(!act.crit)
                            hitTot += act.dmg;
                        // If some attacks in multi are crit but not all, we cannot track totals properly so tally up untracked hits to get a proper average.
                        else {
                            numUntrackedHits += act.hits;
                            numUntrackedCrits += act.crit;
                        }
                    }
                    else if(act.crit) {
                        critTot += act.dmg;
                        critMax = Math.max(critMax, act.dmg);
                        critMin = Math.min(critMin, act.dmg);
                        critAvg = (critTot / (numCrits - numUntrackedCrits)).toFixed(0);
                    }
                    else {
                        hitTot += act.dmg;
                        hitMax = Math.max(hitMax, act.dmg);
                        if(act.dmg)
                            hitMin = Math.min(hitMin, act.dmg);
                        hitAvg = (hitTot / (numHits - numCrits - numUntrackedHits + numUntrackedCrits)).toFixed(0);
                    }
                }
                else
                    console.log("Unknown player attack type: " + act.type + ": " + xhr.responseText);
            else
            if(act.type == "hit") {
                if(act.hits && act.dmg)
                    takenDamage = true;
                if(takenDamage)
                    numHealableRounds ++;
            }
            else
                console.log("Unknown enemy attack type: " + act.type + ": " + xhr.responseText);
        }
        if(!battle.b.r)
            numHealableRounds --;

        // Update the table in the battle tracker window
        $('#battleTrackerBattles').text(numBattles);
        $('#battleTrackerRounds').text(numRounds);
        $('#battleTrackerHitCnt').text(numHits + ' / ' + numAttacks);
        $('#battleTrackerHitPerc').text((numHits * 100 / numAttacks).toFixed(2) + " %");
        if(numHits) {
            $('#battleTrackerHitMin').text(hitMin);
            $('#battleTrackerHitMax').text(hitMax);
            $('#battleTrackerHitAvg').text(hitAvg);
        }
        $('#battleTrackerCritCnt').text(numCrits + ' / ' + numHits);
        $('#battleTrackerCritPerc').text((numCrits * 100 / numHits).toFixed(2) + " %");
        if(numCrits) {
            $('#battleTrackerCritMin').text(critMin);
            $('#battleTrackerCritMax').text(critMax);
            $('#battleTrackerCritAvg').text(critAvg);
        }
        $('#battleTrackerSpellCnt').text(numSpells + ' / ' + numHits);
        $('#battleTrackerSpellPerc').text((numSpells * 100 / numHits).toFixed(2) + " %");
        if(numSpells) {
            $('#battleTrackerSpellMin').text(spellMin);
            $('#battleTrackerSpellMax').text(spellMax);
            $('#battleTrackerSpellAvg').text(spellAvg);
        }
        $('#battleTrackerCounterCnt').text(numCounters + ' / ' + numAttacksTaken);
        $('#battleTrackerCounterPerc').text((numCounters * 100 / numAttacksTaken).toFixed(2) + " %");
        if(numCounters) {
            $('#battleTrackerCounterMin').text(counterMin);
            $('#battleTrackerCounterMax').text(counterMax);
            $('#battleTrackerCounterAvg').text(counterAvg);
        }
        $('#battleTrackerHealCnt').text(numHeals + ' / ' + numHealableRounds);
        $('#battleTrackerHealPerc').text((numHeals * 100 / numHealableRounds).toFixed(2) + " %");
        if(numHeals) {
            $('#battleTrackerHealMin').text(healMin);
            $('#battleTrackerHealMax').text(healMax);
            $('#battleTrackerHealAvg').text(healAvg);
        }
        $('#battleTrackerMultiCnt').text(numMulti + ' / ' + numRounds);
        $('#battleTrackerMultiPerc').text((numMulti * 100 / numRounds).toFixed(2) + " %");
        $('#battleTrackerEvadeCnt').text(numEvade + ' / ' + numAttacksTaken);
        $('#battleTrackerEvadePerc').text((numEvade * 100 / numAttacksTaken).toFixed(2) + " %");
    }

    function parseAutoTradePhp(harvest) {
        if(constants.ENABLE_QUEST_COMPLETE_NOTICE && harvest.a.qf.indexOf("You have completed your quest!  Visit the") > -1)
            fadeOutNonQuest();
        else if(questNoticeOn)
            fadeInNonQuest();

        // Track Location Drops
        if(constants.ENABLE_INGREDIENT_TRACKER) {
            if(harvest.a.ir) {
                var item = (harvest.a.ir).replace(/\+|<.*?>/img, "");
                var tool = harvest.a.t;
                if(typeof Storage !== "undefined") {
                    if(!localStorage.LocDrops)
                        localStorage.LocDrops = "{}";
                    var drops = JSON.parse(localStorage.LocDrops);
                    if(drops[item] === undefined)
                        drops[item] = {};
                    drops[item][tool] = "";
                    localStorage.LocDrops = JSON.stringify(drops);
                }
                else
                    console.log("No Web Storage support to track drops.");
                $('#ingredientDropList').html(loadIngredientDropList());
            }
        }

        // Drop Tracker enabled
        if(constants.ENABLE_DROP_TRACKER) {
            incrementCell('numHarvests');

            // This means an ingredient has dropped
            if(harvest.a.ir)
                incrementCell('numIngredientsH');

            // This means a stat has dropped
            if(harvest.a.sr) {
                incrementCell('numStatsH');
                var id = "";
                switch(/\+.*?>(.*?)</im.exec(harvest.a.sr)[1]) {
                    case 'strength': id = 'strH'; break;
                    case 'health': id = 'heaH'; break;
                    case 'coordination': id = 'coordH'; break;
                    case 'agility': id = 'agiH'; break;
                    default: console.log('Unknown Harvest Stat Drop: ' + harvest.a.sr);
                }
                incrementCell(id);
            }

            // This means loot has dropped
            if(harvest.a.dr) {
                incrementCell('numLootH');
                var id = "";
                switch(/(Tooltip).*?>|>.*?(platinum coin|gold coin|crafting|gem frag|crystal).*?</.exec(harvest.a.dr).splice(1,2).join("")) {
                    case 'Tooltip': id = "gearH"; break;
                    case 'platinum coin': id = "platH"; break;
                    case 'gold coin': id = "goldH"; break;
                    case 'crafting': id = "craftH"; break;
                    case 'gem frag': id = "fragH"; break;
                    case 'crystal': id = "crystalH";
                    default: console.log('Unknown Harvest Loot Drop: ' + harvest.a.dr);
                }
                incrementCell(id);
            }
            calcPercentCells();
        }
    }

    function parseResetSessionStatsPhp() {
        $('#battleGains .timeCounter, #tradeskillGains .timeCounter').attr('title',Date.now());
        $('#battleGains .timeCounter>span, #tradeskillGains .timeCounter>span').text('00');
    }

    function incrementCell(id) {
        $('.' + id).text(parseInt($('.' + id).first().text())+1);
    }

    function calcPercentCells() {
        $('.percent').each(function(){
            var idN = parseInt($('.' + $(this).attr('data-n')).first().text());
            var idD = parseInt($('.' + $(this).attr('data-d')).first().text());
            if(idD != 0)
                $(this).text((idN * 100 / idD).toFixed(2));
        });
    }

    function loadIngredientDropList() {
        var dropList = "";
        if(!localStorage.LocDrops || localStorage.LocDrops == "{}")
            return "";
        var drops = JSON.parse(localStorage.LocDrops);
        for (var drop in drops) {
            dropList += '<tr><td rowspan="' + Object.keys(drops[drop]).length + '">' + drop + '</td>';
            for(var enemy in drops[drop])
                dropList += "<td>" + enemy + "</td></tr><tr>";
            dropList = dropList.slice(0, -4);
        }
        return dropList;
    }

    function fadeOutNonQuest() {
        $('#header, #bottomWrapper, #footer, #navigationWrapper, #contentWrapper, #chatWrapper, #wrapper>div.row>div:not(:first-child)').fadeTo('opacity', 0.2);
        questNoticeOn = true;
    }

    function fadeInNonQuest() {
        $('#header, #bottomWrapper, #footer, #navigationWrapper, #contentWrapper, #chatWrapper, #wrapper>div.row>div:not(:first-child)').fadeTo('opacity', 1, function() { $(this).css('opacity', ''); });
        questNoticeOn = false;
    }

    function initialize() {
        if(constants.ENABLE_XP_GOLD_RESOURCE_PER_HOUR)
            addTimeCounter();
        if(constants.ENABLE_BATTLE_TRACKER)
            addBattleTracker();
        if(constants.ENABLE_INGREDIENT_TRACKER)
            addIngredientTracker();
        if(constants.ENABLE_DROP_TRACKER)
            addDropTracker();
        if(constants.ENABLE_XP_GOLD_RESOURCE_PER_HOUR || constants.ENABLE_DROP_TRACKER) {
            timeCounter();
            setInterval(timeCounter, 1000);
        }
    }

    initialize();

    // THIS SECTION IS RUN EVERY TIME THE BROWSER RECEIVES A DYNAMIC UPDATE USING AJAX
    $( document ).ajaxComplete(function( event, xhr, settings ) {
        if (settings.url == "autobattle.php" && (constants.ENABLE_BATTLE_TRACKER || constants.ENABLE_INGREDIENT_TRACKER))
            parseAutobattlePhp(JSON.parse(xhr.responseText));
        else if (settings.url == "autotrade.php" && constants.ENABLE_INGREDIENT_TRACKER)
            parseAutoTradePhp(JSON.parse(xhr.responseText));
        else if (settings.url == "reset_session_stats.php" && constants.ENABLE_XP_GOLD_RESOURCE_PER_HOUR)
            parseResetSessionStatsPhp();
        else if (settings.url == "boosts.php")
            parseBoostsPhp(JSON.parse(xhr.responseText));
    });

    return module;
});