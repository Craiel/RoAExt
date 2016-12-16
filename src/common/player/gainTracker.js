(function ($) {
    'use strict';

    function PlayerGainTracker() {
        RoAModule.call(this, "Player Gain-Tracker");
    }

    PlayerGainTracker.prototype = Object.spawn(RoAModule.prototype, {
        load: function () {

            RoAModule.prototype.load.apply(this);
        }
    });

    PlayerGainTracker.prototype.constructor = PlayerGainTracker;

    modules.playerGainTracker = new PlayerGainTracker();

})(modules.jQuery);