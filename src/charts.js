var AVBUCharts = (function ($) {
    'use strict';

    var module = {};

    const initialUpdateDelay = 5000;
    const statUpdateDelay = 60 * 5 * 1000; // 5 minutes

    var chartControl;
    var chartWindow;
    var currentChartControl;

    var visibleChart = null;
    var activeCharts = {};

    function refreshStats(gameStatData) {
        console.log(gameStatData);

        for (var id in activeCharts) {
            if (activeCharts[id].isGameStatChart) {
                activeCharts[id].updateDataFromGameStats(gameStatData);
            } else if (activeCharts[id].isElementChart) {
                activeCharts[id].updateDataFromElement();
            }
        }

        if (visibleChart) {
            visibleChart.render();
        }

        autoSaveChartData();

        window.setTimeout(beginRefreshStats, statUpdateDelay);
    }

    function beginRefreshStats() {
        console.log("Refreshing Stats...");

        $.post('game_stats.php', {}).done(refreshStats);
    }

    function autoSaveChartData() {

    }

    function redrawCharts() {
        if (visibleChart) {
            visibleChart.render();
        }
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

    function toggleGameChartPlayerTabs() {
        hideTabCategories();
        $('#gameChartPlayerTabs').show();
    }

    function toggleGameChartStatsTabs() {
        hideTabCategories();
        $('#gameChartStatsTabs').show();
    }

    function toggleGameChartMarketTabs() {
        hideTabCategories();
        $('#gameChartMarketTabs').show();
    }

    function hideTabCategories() {
        $('#gameChartPlayerTabs').hide();
        $('#gameChartStatsTabs').hide();
        $('#gameChartMarketTabs').hide();
    }

    function setupChart(toggleDiv, targetDiv, title) {
        var chart = chartControl.create(toggleDiv, targetDiv, title);
        activeCharts[chart.id] = chart;

        chart.onBecameVisible = function (id) {
            if(visibleChart == activeCharts[id]) {
                return;
            }

            if (visibleChart) {
                visibleChart.hide();
            }

            visibleChart = activeCharts[id];
        };

        return chart;
    }

    function setupChartWindow(template) {

        $("<style>").text("" +
            ".chartWindow{width: 100%; height: 500px}\n" +
            ".chartCategoryWindow{width: 100%; height: 300px}")
            .appendTo("body");

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

        $('#toggleGameChartPlayer').click(toggleGameChartPlayerTabs);
        $('#toggleGameChartStats').click(toggleGameChartStatsTabs);
        $('#toggleGameChartMarket').click(toggleGameChartMarketTabs);

        // Toggle the default tab view
        toggleGameChartPlayerTabs();

        // Create the chart controls
        setupChart("toggleChartBattleXP", "chartBattleXP", "Battle XP");
        setupChart("toggleChartHarvestXP", "chartHarvestXP", "Harvest XP");
        setupChart("toggleChartCraftingXP", "chartCraftingXP", "Crafting XP");
        setupChart("toggleChartGold", "chartGold", "Gold").asElementChart("gold");
        setupChart("toggleChartPlatinum", "chartPlatinum", "Platinum").asElementChart("platinum");
        setupChart("toggleChartCrystals", "chartCrystals", "Crystals").asElementChart("premium");
        setupChart("toggleChartMaterial", "chartMaterial", "Material").asElementChart("crafting_materials");
        setupChart("toggleChartFragment", "chartFragment", "Fragments").asElementChart("gem_fragments");
        setupChart("toggleChartFood", "chartFood", "Food").asElementChart("food");
        setupChart("toggleChartWood", "chartWood", "Wood").asElementChart("wood");
        setupChart("toggleChartIron", "chartIron", "Iron").asElementChart("iron");
        setupChart("toggleChartStone", "chartStone", "Stone").asElementChart("stone");

        setupChart("toggleChartMonsterSlain", "chartMonsterSlain", "Monsters Slain").asGameStatChart("AllTimeKills");
        setupChart("toggleChartGoldLooted", "chartGoldLooted", "Gold Looted").asGameStatChart("AllTimeGoldLooted");
        setupChart("toggleChartGoldInGame", "chartGoldInGame", "Gold in Game").asGameStatChart("AllTimeCurrentGold");
        setupChart("toggleChartResourcesInGame", "chartResourcesInGame", "Resources in Game").asGameStatChart("AllTimeCurrentRes");
        setupChart("toggleChartPlatinumInGame", "chartPlatinumInGame", "Platinum in Game").asGameStatChart("AllTimeCurrentPlat");
        setupChart("toggleChartMaterialInGame", "chartMaterialInGame", "Crafting Materials in Game").asGameStatChart("AllTimeCurrentMats");
        setupChart("toggleChartFragmentInGame", "chartFragmentInGame", "Gem Fragments in Game").asGameStatChart("AllTimeCurrentFrags");
        setupChart("toggleChartHarvests", "chartHarvests", "Harvests").asGameStatChart("AllTimeHarvests");
        setupChart("toggleChartResourcesHarvested", "chartResourcesHarvested", "Resources Harvested").asGameStatChart("AllTimeResources");
        setupChart("toggleChartItemsFound", "chartItemsFound", "Items found").asGameStatChart("AllTimeItemsFound");

        setupChart("toggleChartMarketCrystals", "chartMarketCrystals", "Crystals");
        setupChart("toggleChartMarketPlatinum", "chartMarketPlatinum", "Platinum");
        setupChart("toggleChartMarketFood", "chartMarketFood", "Food");
        setupChart("toggleChartMarketWood", "chartMarketWood", "Wood");
        setupChart("toggleChartMarketIron", "chartMarketIron", "Iron");
        setupChart("toggleChartMarketStone", "chartMarketStone", "Stone");
        setupChart("toggleChartMarketMaterial", "chartMarketMaterial", "Material");
        setupChart("toggleChartMarketFragment", "chartMarketFragment", "Fragments");

        window.setTimeout(beginRefreshStats, initialUpdateDelay);
    }

    module.enable = function () {
        chartControl = chart;
        $.get(constants.URLS.html.charts).done(setupChartWindow);
    };

    return module;

});