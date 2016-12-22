(function () {
    'use strict';

    const SettingType = {
        Toggle: 0,
    };

    const Setting = function (category, name, description, type) {
        this.key = category + "_" + name;
        this.category = category;
        this.name = name;
        this.description = description;
        this.type = type || SettingType.Toggle;

        this.load();

        if(modules.settingsWindow.loaded) {
            modules.settingsWindow.register(this);
        }
    };

    Setting.prototype = {
        key: null,
        category: null,
        name: null,
        description: null,
        type: null,
        callback: null,
        value: null,
        setValue: function (newValue) {
            if(this.value === newValue) {
                return;
            }

            this.value = newValue;
            this.save();

            if(this.callback) {
                this.callback(this);
            }
        },
        load: function() {
            if(!modules.settings.settings.dynamicSettings) {
                modules.settings.settings.dynamicSettings = {};
            }

            switch (this.type) {
                case SettingType.Toggle: {
                    this.value = modules.settings.settings.dynamicSettings[this.key] || false;
                    break;
                }

                default: {
                    modules.logger.error("Unknown Setting Type: " + this.type + " for " + this.name);
                }
            }
        },
        save: function () {
            if(!modules.settings.settings.dynamicSettings) {
                modules.settings.settings.dynamicSettings = {};
            }

            switch (this.type) {
                case SettingType.Toggle: {
                    modules.settings.settings.dynamicSettings[this.key] = this.value;
                    break;
                }

                default: {
                    modules.logger.error("Unknown Setting Type: " + this.type + " for " + this.name);
                }
            }
        }
    };

    modules.settingTypes = SettingType;

    modules.createSetting = function (category, name, description, type) {
        return new Setting(category, name, description, type);
    };

})();