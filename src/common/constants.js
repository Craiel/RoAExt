(function () {
    'use strict';

    function Constants() {
        RoAModule.call(this, "Constants");
    }

    Constants.prototype = Object.spawn(RoAModule.prototype, {
        BaseResourceUrl: "https://cdn.rawgit.com/Craiel/RoAExtRelease/master/",

        SettingsAutoSaveInterval: 1000,
        SettingsSaveVersion: 1,
        SettingsSaveKey: "settings",

        DungeonWallColor: "#ff0000",
        DungeonRoomSearchedColor: "#ffd700",
        DungeonRoomHasEnemiesColor: "#ff0000",
        DungeonPlayerColor: "#ffffff",
        DungeonMapVersion: 0.1,

        HouseUpdateInterval: 60 * 3 * 1000, // 3 minutes

        ChartUpdateInterval: 60 * 5 * 1000, // 5 minutes

        HarvestRepeaterMinDelay: 60 * 25 * 1000 // 25 minutes
    });

    Constants.prototype.constructor = Constants;

    modules.constants = new Constants();

})();