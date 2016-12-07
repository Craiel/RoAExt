(function ($) {
    'use strict';

    /*function updateHouseStatus(e, res, req, jsonres) {

    }*/

    function AutoDungeon() {
        RoAModule.call(this, "Auto Dungeon");
    }

    AutoDungeon.prototype = Object.spawn(RoAModule.prototype, {
        load: function () {
            //modules.ajaxHooks.register("house.php", updateHouseStatus);

            RoAModule.prototype.load.apply(this);
        }
    });

    AutoDungeon.prototype.constructor = AutoDungeon;

    modules.automateDungeon = new AutoDungeon();

})(modules.jQuery);