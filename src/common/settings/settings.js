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
            dungeonMap: {},
            dungeonData: {},
            chartData: {},
            timerData: {},
            gainData: "",
            lastEventTime: null,
            notes: ""
        },
        save: function () {
            GM_setValue(modules.constants.SettingsSaveKey, JSON.stringify(this.settings));
        },
        load: function () {
            var data = JSON.parse(GM_getValue(modules.constants.SettingsSaveKey) || "{}");
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