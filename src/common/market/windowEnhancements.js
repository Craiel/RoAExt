(function ($) {
    'use strict';

    var updateTimer;

    var wnd;

    var enabled = false;
    
    function onMarketDataReceived(requestData) {
        enabled = true;
    }
    
    function update() {
        if(!enabled || !wnd.is(":visible")) {
            return;
        }

        enabled = false;

        var priceColumns = $('#marketListingWrapper').find("[data-th='Price Per Unit']");
        var type = priceColumns.first().parent().children().first().attr("data-th");
        if(!type) {
            return;
        }

        var average = modules.marketTracker.getAverage(type);
        if(average <= 0) {
            return;
        }

        priceColumns.each(function() {
            var text = $( this ).text();
            if(text.includes("%)")) {
                // Already processed this column
                return;
            }

            var value = parseInt(text.replace(/\,/g, ''));
            var pct = ((value / average) * 100).toFixed(0);
            text = text + " (" + pct + "%)";
            if(pct <= 100) {
                $(this).empty();
                $(this).append($('<p style="color:greenyellow">' + text + '</p>'));
            } else {
                $(this).empty();
                $(this).append($('<p style="color:red">' + text + '</p>'));
            }
        });
    }

    function MarketWindowEnhancements() {
        RoAModule.call(this, "Player Gain-Tracker");
    }

    MarketWindowEnhancements.prototype = Object.spawn(RoAModule.prototype, {
        load: function () {

            wnd = $('#marketWrapper');

            modules.ajaxHooks.register("market.php", onMarketDataReceived);

            updateTimer = modules.createInterval("MarketWindowEnhancementUpdate");
            updateTimer.set(update, 500);

            RoAModule.prototype.load.apply(this);
        }
    });

    MarketWindowEnhancements.prototype.constructor = MarketWindowEnhancements;

    modules.marketWindowEnhancements = new MarketWindowEnhancements();
    
})(modules.jQuery);