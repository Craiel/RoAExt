(function($) {
    'use strict';

    const Settings = function () {
        this.settings = this.defaults;
        this.load();

        modules.createInterval("settingsAutoSave").set(function () {
            modules.settings.save();
        }, modules.constants.SettingsAutoSaveInterval);
    };

    Settings.prototype = {
        defaults: {
            version: modules.constants.SettingsSaveVersion,
            notification: {
                enable: false,
                enableSound: false,
                whisper: {
                    sound: true,
                    show: true
                },
                construction: {
                    sound: true,
                    show: true
                },
                event: {
                    sound: true,
                    show: true
                }
            },
            features: {
                house_timer: true
            },
            dungeonMap: {},
            chartData: {},
        },

        save: function () {
            GM_setValue(modules.constants.SettingsSaveKey, JSON.stringify(this.settings));
        },

        load: function () {
            var data = JSON.parse(GM_getValue(modules.constants.SettingsSaveKey) || "{}");
            if(data.version === modules.constants.SettingsSaveVersion) {
                this.settings = $.extend(true, this.defaults, data);
            }
        }
    };

    modules.settings = new Settings();

})(modules.jQuery);