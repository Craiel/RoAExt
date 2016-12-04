var AVBUCharts = (function ($) {
    'use strict';

    var module = {};

    const initialUpdateDelay = 5000;
    const statUpdateDelay = 60 * 5 * 1000; // 5 minutes

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

    function setupChartWindow(template) {
        chartWindow = $(template);
        chartWindow.appendTo("body");
        chartWindow.draggable({handle:"#gameChartTitle"}).resizable({stop:function(e,d){$("#gameChartTitle").attr({width:d.size.width,height:d.size.height});redrawCharts();}});

        var toggleButton = $('<a><div id="toggleGameCharts" class="bt1 center">Toggle Charts</div></a>');
        toggleButton.click(function () {
            chartWindow.toggle();
        });

        toggleButton.insertAfter('#showGameStats');

        // Initialize the tabs
        $('#gameChartCategoryTabs').tabs();
        $('#gameChartStatsTabs').tabs();

        window.setTimeout(refreshStats, initialUpdateDelay);
    }

    module.enable = function () {
        $.get(constants.URLS.html.charts).done(setupChartWindow);

        /*currentChartControl = new CanvasJS.Chart("gameChartContent", {
            title:{
                text: "TODO"
            },
            data: [
                {
                    // Change type to "doughnut", "line", "splineArea", etc.
                    type: "line",
                    dataPoints: [
                        { label: "apple",  y: 10  },
                        { label: "orange", y: 15  },
                        { label: "banana", y: 25  },
                        { label: "mango",  y: 30  },
                        { label: "grape",  y: 28  }
                    ]
                }
            ]
        });*/
    };

    return module;

});