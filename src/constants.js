(function () {
    'use strict';

    function Constants() {
        RoAModule.call(this, "Constants");
    }

    Constants.prototype = Object.spawn(RoAModule.prototype, {
        SettingsAutoSaveInterval: 1000,
        SettingsSaveVersion: 1,
        SettingsSaveKey: "settings",

        DungeonWallColor: "#ff0000",
        DungeonRoomSearchedColor: "#ffd700",
        DungeonRoomHasEnemiesColor: "#ff0000",
        DungeonPlayerColor: "#ffffff",
        DungeonMapVersion: 0.1,

        HouseUpdateInterval: 60 * 3 * 1000, // 2 minutes

        ChartUpdateInterval: 60 * 5 * 1000 // 1 minutes
    });

    Constants.prototype.constructor = Constants;

    modules.constants = new Constants();

})();