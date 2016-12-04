var AVBUCharts = (function ($) {
    'use strict';

    var module = {};

    const initialUpdateDelay = 5000;
    const statUpdateDelay = 60 * 5 * 1000; // 5 minutes

    var chartControl;
    var chartWindow;
    var currentChartControl;

    function refreshStats() {
        console.log("Refreshing Stats...");

        $.post('game_stats.php', {}).done(function(x) {
            /*AllTimeClans
             :
             209
             AllTimeCurrentFrags
             :
             33144716
             AllTimeCurrentGold
             :
             323696328524
             AllTimeCurrentMats
             :
             47820483
             AllTimeCurrentPlat
             :
             50589553
             AllTimeCurrentRes
             :
             2707205627
             AllTimeGoldLooted
             :
             1265557523392
             AllTimeHarvests
             :
             675158189
             AllTimeItemsFound
             :
             11623284
             AllTimeKills
             :
             1210917936
             AllTimeOnline
             :
             1167
             AllTimeQuestsCompleted
             :
             632661
             AllTimeResources
             :
             19686784134
             AllTimeSignups
             :
             11683
             TodayActive
             :
             1015
             TodayClans
             :
             0
             TodayGoldLooted
             :
             9971050872
             TodayHarvests
             :
             1438139
             TodayKills
             :
             2696551
             TodayResources
             :
             85867247
             TodaySignups
             :
             5
             next
             :
             "57 seconds"*/

            console.log(x);
        });

        currentChartControl.render();

        window.setTimeout(refreshStats, statUpdateDelay);
    }

    function redrawCharts() {
        currentChartControl.render();
    }
    
    function resetCharts() {
        
    }
    
    function setChartTimeHour() {
        
    }
    
    function setChartTimeDay() {
        
    }
    
    function setChartTimeWeek() {
        
    }
    
    function setChartTimeMonth() {
        
    }

    function setupChartWindow(template) {
        chartWindow = $(template);
        chartWindow.appendTo("body");
        chartWindow.draggable({handle:"#gameChartTitle"}).resizable({stop:function(e,d){$("#gameChartTitle").attr({width:d.size.width,height:d.size.height});redrawCharts();}});

        var toggleButton = $('<a><div id="toggleGameCharts" class="bt1 center">Toggle Charts</div></a>');
        toggleButton.click(function () {
            chartWindow.toggle();
        });

        toggleButton.insertAfter('#showGameStats');
        
        // Hook buttons
        $('#gameChartReset').click(resetCharts);
        $('#gameChartTimeHour').click(setChartTimeHour);
        $('#gameChartTimeDay').click(setChartTimeDay);
        $('#gameChartTimeWeek').click(setChartTimeWeek);
        $('#gameChartTimeMonth').click(setChartTimeMonth);

        // Initialize the tabs
        $('#gameChartCategoryTabs').tabs();
        $('#gameChartPlayerTabs').tabs();
        $('#gameChartStatsTabs').tabs();
        $('#gameChartMarketTabs').tabs();

        // Create the chart controls
        chartControl.create("chartBattleXP", "Battle XP");
        chartControl.create("chartHarvestXP", "Harvest XP");
        chartControl.create("chartCraftingXP", "Crafting XP");
        chartControl.create("chartGold", "Gold XP");
        chartControl.create("chartPlatinum", "Platinum");
        chartControl.create("chartCrystals", "Crystals");
        chartControl.create("chartFood", "Food");
        chartControl.create("chartWood", "Wood");
        chartControl.create("chartIron", "Iron");
        chartControl.create("chartStone", "Stone");

        chartControl.create("chartMonsterSlain", "Monsters Slain");
        chartControl.create("chartGoldLooted", "Gold Looted");
        chartControl.create("chartGoldInGame", "Gold in Game");
        chartControl.create("chartResourcesInGame", "Resources in Game");
        chartControl.create("chartPlatinumInGame", "Platinum in Game");
        chartControl.create("chartCraftingMatsInGame", "Crafting Materials in Game");
        chartControl.create("chartGemFragmentsInGame", "Gem Fragments in Game");
        chartControl.create("chartHarvests", "Harvests");
        chartControl.create("chartResourcesHarvested", "Resources Harvested");
        chartControl.create("chartItemsFound", "Items found");

        chartControl.create("chartMarketCrystals", "Crystals");
        chartControl.create("chartMarketPlatinum", "Platinum");
        chartControl.create("chartMarketFood", "Food");
        chartControl.create("chartMarketWood", "Wood");
        chartControl.create("chartMarketIron", "Iron");
        chartControl.create("chartMarketStone", "Stone");
        chartControl.create("chartMarketCraftingMats", "Crafting Materials");
        chartControl.create("chartMarketGemFragments", "Gem Fragments");

        window.setTimeout(refreshStats, initialUpdateDelay);
    }

    module.enable = function () {
        chartControl = chart;
        $.get(constants.URLS.html.charts).done(setupChartWindow);
    };

    return module;

});