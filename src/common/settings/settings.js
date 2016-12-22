(function($) {
    'use strict';

    var autoSaveInterval;

    function Settings() {
        this.settings = this.defaults;

        autoSaveInterval = modules.createInterval("settingsAutoSave");

        RoAModule.call(this, "Settings");
    }

    Settings.prototype = Object.spawn(RoAModule.prototype, {
        defaults: {
            version: modules.constants.SettingsSaveVersion,
            notification: {
                enable: true,
                enableSound: false,
                whisper: {
                    sound: true,
                    show: true
                },
                house: {
                    sound: true,
                    show: true
                },
                event: {
                    sound: true,
                    show: true
                },
                captcha: {
                    sound: false,
                    show: true
                },
                effectExpire: {
                    sound: false,
                    show: true
                }
            },
            features: {
                house_timer: true
            },
            dynamicSettings: {},
            dungeonData: {},
            chartData: null,
            timerData: {},
            tradeData: {},
            gainData: "",
            lastEventTime: null,
            notes: ""
        },
        save: function () {
            var data = JSON.stringify(this.settings);
            GM_setValue(modules.constants.SettingsSaveKey, data);
        },
        load: function () {
            var dataString = GM_getValue(modules.constants.SettingsSaveKey) || "{}";
            var data = JSON.parse(dataString);
            if(data.version === modules.constants.SettingsSaveVersion) {
                this.settings = $.extend(true, this.defaults, data);
            }

            autoSaveInterval.set(function () {
                modules.settings.save();
            }, modules.constants.SettingsAutoSaveInterval);

            RoAModule.prototype.load.apply(this);
        }
    });

    Settings.prototype.constructor = Settings;

    modules.settings = new Settings();

})(modules.jQuery);