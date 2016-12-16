(function ($) {
    'use strict';

    var template;
    var wnd;

    function buildHeader(title) {
        return $('<div class="row"><div class="col-xs-12"><h4 class="nobg center">' + title + '</h4></div></div>');
    }

    function notifySettingChange(category, name) {
        if(modules.settingsWindow.settings[category][name].callback) {
            modules.settingsWindow.settings[category][name].callback();
        }
    }

    function buildToggleEntry(setting) {

        var optionOff = $('<option value="0">Disabled</option>');
        var optionOn = $('<option value="1">Enabled</option>');

        var select = $('<select></select>');
        select.append(optionOff);
        select.append(optionOn);
        select.change({cat: setting.category, name: setting.name}, function (e) {
            modules.settingsWindow.settings[e.data.cat][e.data.name].value = parseInt(this.value) === 1;
            notifySettingChange(e.data.cat, e.data.name);
        });

        var selectWrapper = $('<div class="col-xs-4 col-md-2"></div>');
        selectWrapper.append(select);

        var text = $('<div class="col-xs-8 col-md-10">' + setting.name + '</div>');

        var content = $('<div class="col-xs-12"></div>');
        content.append(selectWrapper);
        content.append(text);

        var wrapper = $('<div class="row mt10"></div>');
        wrapper.append(content);

        return wrapper;
    }

    function rebuildSettingWindow() {
        modules.logger.log("Rebuilding Settings Window");

        var parent = $('#settingsWindowContent');
        parent.empty();

        var categories = Object.keys(modules.settingsWindow.settings).sort();

        for (var i = 0; i < categories.length; i++) {
            var category = categories[i];
            var settingsList = modules.settingsWindow.settings[category];

            var header = buildHeader(category);
            parent.append(header);

            for(var name in settingsList) {
                var setting = settingsList[name];
                switch (setting.type) {
                    case modules.settingTypes.Toggle: {
                        var entry = buildToggleEntry(setting);
                        parent.append(entry);
                        break;
                    }

                    default: {
                        modules.logger.warn("Setting type not implemented in Settings Window: " + setting.type);
                    }
                }
            }
        }
    }

    function onClick() {
        wnd.toggle();
    }

    function SettingsWindow() {
        RoAModule.call(this, "Settings Window");
    }

    SettingsWindow.prototype = Object.spawn(RoAModule.prototype, {
        settings: {},
        continueLoad: function () {

            wnd = $(template);
            wnd.appendTo("body");
            wnd.draggable({handle:"#settingsWindowTitle"});
            wnd.resizable();
            wnd.hide();

            $('#settingsWindowClose').click(function () {
                wnd.hide();
            });

            modules.uiScriptMenu.addLink("Settings", onClick);

            RoAModule.prototype.load.apply(this);
        },
        load: function () {
            $.get(modules.urls.html.settingsWindow).done(function (x) {
                template = x;
                modules.settingsWindow.continueLoad();
            });
        },
        register: function (setting) {
            if(!this.settings[setting.category]) {
                this.settings[setting.category] = {};
            }

            this.settings[setting.category][setting.name] = setting;

            rebuildSettingWindow();
        }
    });

    SettingsWindow.prototype.constructor = SettingsWindow;

    modules.settingsWindow = new SettingsWindow();

})(modules.jQuery);