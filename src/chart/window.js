(function ($) {
    'use strict';

    var chartWindow;

    var template;
    var visibleChart = null;
    var activeCharts = {};

    function onAutoBattle(e, res, req, jsonData) {
        if(jsonData && jsonData.b) {
            if(jsonData.b.xp && jsonData.b.xp > 0) {
                activeCharts['chartPlayerBattleXP'].updateData(jsonData.b.xp);
            }

            if(jsonData.b.g && jsonData.b.g > 0) {
                activeCharts['chartPlayerGoldLooted'].updateData(jsonData.b.g);
            }
        }
    }

    function onAutoTrade(e, res, req, jsonData) {
        if(jsonData && jsonData.a && jsonData.a.xp && jsonData.a.xp > 0) {
            activeCharts['chartPlayerHarvestXP'].updateData(jsonData.a.xp);
        }
    }

    function onAutoCraft(e, res, req, jsonData) {
        if(jsonData && jsonData.a && jsonData.a.xp && jsonData.a.xp > 0) {
            activeCharts['chartPlayerCraftingXP'].updateData(jsonData.a.xp);
        }
    }

    function onStatsReceived(e, res, req, jsonData) {

        for (var id in activeCharts) {
            if (activeCharts[id].isGameStatChart) {
                activeCharts[id].updateDataFromGameStats(jsonData);
            } else if (activeCharts[id].isElementChart) {
                activeCharts[id].updateDataFromElement();
            }
        }

        redrawChart();
        saveChartData();
    }

    function loadChartData() {
        if(!localStorage.chartData) {
            return;
        }

        var data = JSON.parse(localStorage.chartData);
        for (var id in data) {
            if(activeCharts[id]) {
                activeCharts[id].load(data[id]);
            }
        }
    }

    function saveChartData() {
        var data = {};
        for (var id in activeCharts) {
            data[id] = activeCharts[id].save();
        }

        localStorage.chartData = JSON.stringify(data);
        $('#gameChartStorageSize').text(localStorage.chartData.length * 2);
    }

    function resetCharts() {
        if(window.confirm("Reset chart data?")) {
            for (var id in activeCharts) {
                activeCharts[id].reset();
            }
        }
    }

    function redrawChart() {
        if (visibleChart) {
            visibleChart.render();
        }
    }

    function debugChart() {
        if (visibleChart) {
            console.log(visibleChart);
        }
    }

    function setChartTimeScale(scale) {
        for (var id in activeCharts) {
            activeCharts[id].setTimeScale(scale);
        }
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

    function setupChart(toggleDiv, targetDiv, title, type) {
        var chart = modules.createChart(toggleDiv, targetDiv, title, type);
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

    function ChartWindow() {
        RoAModule.call(this, "Chart Window");
    }

    ChartWindow.prototype = Object.spawn(RoAModule.prototype, {
        continueLoad: function() {
            $("<style>").text("" +
                ".chartWindow{width: 800px; height: 500px;position: absolute; top: 0; left: 0;}\n" +
                ".chartTab{width: 100%; height: 250px; top: 240px; position: absolute}\n" +
                ".chartCategoryTab{width: 100%; height: 100%}")
                .appendTo("body");

            chartWindow = $(template);
            chartWindow.appendTo("body");
            chartWindow.draggable({handle:"#gameChartTitle"});
            chartWindow.hide();

            // Hook buttons
            $('#gameChartReset').click(resetCharts);
            $('#gameChartRedraw').click(redrawChart);
            $('#gameChartDebugData').click(debugChart);
            $('#gameChartTimeMinute').click(function () { setChartTimeScale(modules.chartTimeScale.Minute); });
            $('#gameChartTimeHour').click(function () { setChartTimeScale(modules.chartTimeScale.Hour); });
            $('#gameChartTimeDay').click(function () { setChartTimeScale(modules.chartTimeScale.Day); });
            $('#gameChartTimeMonth').click(function () { setChartTimeScale(modules.chartTimeScale.Month); });

            $('#toggleGameChartPlayer').click(toggleGameChartPlayerTabs);
            $('#toggleGameChartStats').click(toggleGameChartStatsTabs);
            $('#toggleGameChartMarket').click(toggleGameChartMarketTabs);

            // Toggle the default tab view
            toggleGameChartPlayerTabs();

            // Create the chart controls
            setupChart("toggleChartPlayerBattleXP", "chartPlayerBattleXP", "Battle XP", "column").asAdditive();
            setupChart("toggleChartPlayerHarvestXP", "chartPlayerHarvestXP", "Harvest XP", "column").asAdditive();
            setupChart("toggleChartPlayerCraftingXP", "chartPlayerCraftingXP", "Crafting XP", "column").asAdditive();
            setupChart("toggleChartPlayerGold", "chartPlayerGold", "Gold").asElementChart("gold");
            setupChart("toggleChartPlayerGoldLooted", "chartPlayerGoldLooted", "Gold Looted", "column").asAdditive();
            setupChart("toggleChartPlayerPlatinum", "chartPlayerPlatinum", "Platinum").asElementChart("platinum");
            setupChart("toggleChartPlayerCrystal", "chartPlayerCrystal", "Crystals").asElementChart("premium");
            setupChart("toggleChartPlayerMaterial", "chartPlayerMaterial", "Material").asElementChart("crafting_materials");
            setupChart("toggleChartPlayerFragment", "chartPlayerFragment", "Fragments").asElementChart("gem_fragments");
            setupChart("toggleChartPlayerFood", "chartPlayerFood", "Food").asElementChart("food");
            setupChart("toggleChartPlayerWood", "chartPlayerWood", "Wood").asElementChart("wood");
            setupChart("toggleChartPlayerIron", "chartPlayerIron", "Iron").asElementChart("iron");
            setupChart("toggleChartPlayerStone", "chartPlayerStone", "Stone").asElementChart("stone");

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

            loadChartData();

            modules.ajaxHooks.register("autobattle.php", onAutoBattle);
            modules.ajaxHooks.register("autotrade.php", onAutoTrade);
            modules.ajaxHooks.register("autocraft.php", onAutoCraft);
            modules.ajaxHooks.register("game_stats.php", onStatsReceived);
            modules.ajaxHooks.registerAutoSend("game_stats.php", {}, modules.constants.ChartUpdateInterval);

            RoAModule.prototype.load.apply(this);
        },
        load: function () {
            $.get(modules.urls.html.chartWindow).done(function (x) {
                template = x;
                modules.chartWindow.continueLoad();
            });
        },
        toggle: function () {
            chartWindow.toggle();
        }
    });

    ChartWindow.prototype.constructor = ChartWindow;

    modules.chartWindow = new ChartWindow();

})(modules.jQuery);