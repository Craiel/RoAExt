(function () {
    'use strict';

    function Constants() {
        RoAModule.call(this, "Constants");
    }

    Constants.prototype = Object.spawn(RoAModule.prototype, {
        BaseResourceUrl: "https://cdn.rawgit.com/Craiel/RoAExtRelease/master/",

        SettingsAutoSaveInterval: 5000,
        SettingsSaveVersion: 1,
        SettingsSaveKey: "settings",

        DungeonBackgroundColor: "#333333",
        DungeonWallColor: "#ff0000",
        DungeonRoomSearchedColor: "#ffd700",
        DungeonRoomHasEnemiesColor: "#ff0000",
        DungeonPlayerColor: "#ffffff",
        DungeonExitColor: "#00ff00",
        DungeonCanvasBorderColor: "#777777",
        DungeonMapVersion: 0.1,

        PerHourColor: "#99cc99",
        PerHourSize: "12px",

        GainTrackerAutoSaveInterval: 60 * 2 * 1000, // 5 minutes

        HouseUpdateInterval: 60 * 3 * 1000, // 3 minutes

        ChartUpdateInterval: 60 * 5 * 1000, // 5 minutes

        HarvestRepeaterMinDelay: 60 * 28 * 1000, // 28 minutes

        MilestoneUpdateInterval: 60 * 5 * 1000, // 5 minutes
    });

    Constants.prototype.constructor = Constants;

    modules.constants = new Constants();

})();