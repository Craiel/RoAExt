(function () {
    'use strict';

    const AutoSendDelay = 5 * 1000; // 5 seconds between each market query

    var request;

    var updateTimer;
    var saveTimer;

    var lastRcvTime = Date.now();
    var autoSendList = [ "premium", "platinum", "food", "wood", "iron", "stone" ];
    var autoSendIndex = 0;
    var autoSendEnabled = true;

    var tradeData;

    initializeData();

    function initializeData() {
        tradeData = {
            stats: {},
            trades: {},
        }
    }
    
    function onMarketDataReceived(requestData) {
        // We still flag the time, avoid spam at all costs!
        lastRcvTime = Date.now();
        autoSendEnabled = true;

        if(!requestData.json.cn || !requestData.json.l || requestData.json.l.length <= 0) {
            // Invalid data, ignore
            return;
        }

        var type = requestData.json.cn;

        tradeData.trades[type] = [];
        var min = null;
        var max = null;
        var avg = 0;
        for (var i = 0; i < requestData.json.l.length; i++) {
            var trade = requestData.json.l[i];
            var price = parseInt(trade.price);
            if(!min || min > price) {
                min = price;
            }

            if(!max || max < price) {
                max = price;
            }

            avg += price;

            tradeData.trades[type].push(trade);
        }

        avg = (avg / requestData.json.l.length).toFixed(0);

        tradeData.stats[type] = { min: min, max: max, avg: avg };

        // Type:
        // requestData.json.cn

        // .l [0-10]
        //   .n ?
        //   .owner (true|false)
        //   .price (per unit)
        //   .v (count)
        //   .tid (id for the trade)
    }

    function update() {
        if(!autoSendEnabled || Date.now() - lastRcvTime < AutoSendDelay) {
            return;
        }

        // Disable until we receive a market ajax
        autoSendEnabled = false;

        request.post({type: "currency", page: 0, ll: null, hl: null, st: autoSendList[autoSendIndex]});
        request.send();

        // Increment and loop around
        autoSendIndex++;
        if(autoSendIndex === autoSendList.length) {
            autoSendIndex = 0;
        }
    }

    function save() {
        var data = {
            stats: {},
        };

        for (var key in tradeData.stats) {
            data.stats[key] = tradeData.stats[key];
        }

        modules.settings.settings.tradeData = data;
    }

    function load() {
        if(!modules.settings.settings.tradeData) {
            return;
        }

        for(var key in modules.settings.settings.tradeData.stats) {
            tradeData.stats[key] = modules.settings.settings.tradeData[key];
        }
    }

    function MarketTracker() {
        RoAModule.call(this, "Market Tracker");
    }

    MarketTracker.prototype = Object.spawn(RoAModule.prototype, {
        load: function () {

            modules.ajaxHooks.register("market.php", onMarketDataReceived);

            request = modules.createAjaxRequest("market.php");

            updateTimer = modules.createInterval("MarketTrackerUpdate");
            updateTimer.set(update, 100);

            saveTimer = modules.createInterval("MarketTrackerSave");
            saveTimer.set(save, 1000);

            load();

            RoAModule.prototype.load.apply(this);
        },
        reset: function () {
            initializeData();
        },
        getAverage: function (key) {
            if(tradeData.stats[key])
            {
                return tradeData.stats[key].avg;
            }

            return 0;
        },
        getTopAuctions: function () {
            var data = {};
            for (var key in tradeData.trades) {
                data[key] = tradeData.trades[key][0];
                if(tradeData.trades[key].length > 1) {
                    data[key].nprice = tradeData.trades[key][1].price;
                }
            }

            return data;
        }
    });

    MarketTracker.prototype.constructor = MarketTracker;

    modules.marketTracker = new MarketTracker();

})();