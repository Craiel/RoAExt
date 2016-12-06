(function ($) {
    'use strict';

    var module = {};

    var chartWindow;

    var visibleChart = null;
    var activeCharts = {};

    function refreshStats(e, res, req, jsonData) {

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

    /*function beginRefreshStats() {
        console.log("Refreshing Stats...");

        $.post('game_stats.php', {}).done(refreshStats);
    }*/

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

    function setupChart(toggleDiv, targetDiv, title) {
        var chart = modules.createChart(toggleDiv, targetDiv, title);
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
            ".chartWindow{width: 800px; height: 500px;position: absolute; top: 0; left: 0;}\n" +
            ".chartTab{width: 100%; height: 250px; top: 240px; position: absolute}\n" +
            ".chartCategoryTab{width: 100%; height: 100%}")
            .appendTo("body");

        chartWindow = $(template);
        chartWindow.appendTo("body");
        chartWindow.draggable({handle:"#gameChartTitle"});
        chartWindow.hide();

        var toggleButton = $('<a><div id="toggleGameCharts" class="bt1 center">Toggle Charts</div></a>');
        toggleButton.click(function () {
            chartWindow.toggle();
        });

        toggleButton.insertAfter('#showGameStats');
        
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
        setupChart("toggleChartBattleXP", "chartBattleXP", "Battle XP");
        setupChart("toggleChartHarvestXP", "chartHarvestXP", "Harvest XP");
        setupChart("toggleChartCraftingXP", "chartCraftingXP", "Crafting XP");
        setupChart("toggleChartGold", "chartGold", "Gold").asElementChart("gold");
        setupChart("toggleChartPlatinum", "chartPlatinum", "Platinum").asElementChart("platinum");
        setupChart("toggleChartCrystal", "chartCrystal", "Crystals").asElementChart("premium");
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

        loadChartData();

        modules.ajaxHooks.register("game_stats.php", refreshStats);
        modules.ajaxHooks.registerAutoSend("game_stats.php", {}, modules.constants.ChartUpdateInterval);
    }

    module.enable = function () {
        $.get(modules.urls.html.charts).done(setupChartWindow);
    };

    modules.chartWindow = module;

})(modules.jQuery);