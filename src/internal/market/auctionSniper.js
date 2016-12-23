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
        "Crafting Materials": 1,
        "Gem Fragments": 1,
    };

    var template;
    var contentPanel;

    function onMarketDataReceived() {
        buildSniperArea();
    }

    function snipeAuction(e) {
        if(window.confirm("Buy?")) {
            modules.logger.log("Sniping Trade " + e.data.tid);
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
            var wrapper = $('<div></div>');
            wrapper.append($('<span>' + key + ': ' + auction.v + ' @ ' + auction.price +  ' </span>'));

            var link = $('<a>' + cost + '</a>');
            link.click({tid: auction.tid }, snipeAuction);
            wrapper.append(link);
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

            modules.ajaxHooks.register("market.php", onMarketDataReceived);

            RoAModule.prototype.load.apply(this);
        }
    });

    AuctionSniper.prototype.constructor = AuctionSniper;

    modules.auctionSniper = new AuctionSniper();

})(modules.jQuery);