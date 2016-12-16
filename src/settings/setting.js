(function () {
    'use strict';

    const SettingType = {
        Toggle: 0,
    };

    const Setting = function (category, name, description, type) {
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
        category: null,
        name: null,
        description: null,
        type: null,
        callback: null,
        value: null,
        load: function() {
            switch (this.type) {
                case SettingType.Toggle: {
                    this.value = modules.settings.dynamicSettings[this.name] || false;
                    break;
                }

                default: {
                    modules.logger.error("Unknown Setting Type: " + this.type + " for " + this.name);
                }
            }
        },
        save: function () {
            switch (this.type) {
                case SettingType.Toggle: {
                    modules.settings.dynamicSettings[this.name] = this.value;
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