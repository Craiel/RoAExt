(function ($) {
    'use strict';

    const IdString = "asnp";

    const AllowedSnipeTargets = {
        "Crystals": 1,
        "Platinum": 1,
        "Food": 1,
        "Wood": 1,
        "Iron": 1,
        "Stone": 1,
        //"Crafting Materials": 1,
        //"Gem Fragments": 1,
    };

    var template;
    var contentPanel;

    var request;

    function onMarketDataReceived(requestData) {
        buildSniperArea();
    }

    function onMarketBuy(requestData) {
        modules.logger.log(requestData.json.result);
    }

    function snipeAuction(e) {
        if(window.confirm("Buy?")) {
            modules.logger.log("Sniping Trade " + e.data.tid);
            request.post({id: e.data.tid, amount: e.data.v});
            request.send();
        }
    }

    function buildSniperArea() {
        contentPanel.empty();

        var auctions = modules.marketTracker.getTopAuctions();
        for(var key in auctions) {
            if (!AllowedSnipeTargets[key]) {
                // We don't wanna show all top auctions
                continue;
            }

            var auction = auctions[key];

            var cost = auction.price * auction.v;
            var average = modules.marketTracker.getAverage(key);
            var wrapper = $('<div style="margin-left: 10px"></div>');
            wrapper.append($('<span>' + key + ': </span>'));
            wrapper.append($('<span>' + modules.utils.formatNumber(auction.price, 0) + '</span>'));

            if(auction.nprice) {
                wrapper.append($('<span> -> ' + modules.utils.formatNumber(auction.nprice, 0) + ' </span>'));
            }

            var pct = ((auction.price / average) * 100).toFixed(0);
            var text = modules.utils.formatNumber(cost, 0) + " (" + pct + "%)";
            if(pct <= 95) {
                wrapper.append($('<span style="color:greenyellow">' + text + '</span>'));
            } else {
                wrapper.append($('<span style="color:orange">' + text + '</span>'));
            }

            if(!auction.owner) {
                var link = $('<a style="margin-left: 5px">Buy</a>');
                link.click({tid: auction.tid, v: auction.v}, snipeAuction);
                wrapper.append(link);
            }

            wrapper.append($('<span style="margin-left: 5px">(' + modules.utils.formatNumber(auction.v, 0) + ')</span>'));

            contentPanel.append(wrapper);
        }
    }

    function AuctionSniper() {
        RoAModule.call(this, "Auction Sniper");
    }

    AuctionSniper.prototype = Object.spawn(RoAModule.prototype, {
        load: function () {

            template = modules.templates.centerContentWindow;
            template = template.replace(/%TITLE%/g, "Auction Sniper");
            template = template.replace(/%ID%/g, IdString);

            var $areaWrapper = $('#areaWrapper');
            $areaWrapper.parent().append($(template));

            contentPanel = $('#' + IdString + "_content");

            buildSniperArea();

            request = modules.createAjaxRequest("market_buy.php");

            modules.ajaxHooks.register("market.php", onMarketDataReceived);
            modules.ajaxHooks.register("market_buy.php", onMarketBuy);

            RoAModule.prototype.load.apply(this);
        }
    });

    AuctionSniper.prototype.constructor = AuctionSniper;

    modules.auctionSniper = new AuctionSniper();

})(modules.jQuery);