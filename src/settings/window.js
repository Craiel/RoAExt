(function ($) {
    'use strict';

    var template;
    var wnd;

    function rebuildSettingWindow() {
        /*<table class="avi" style="margin:auto">
         <thead>
         <tr>
         <th>Name</th>
         <th>Control</th>
         </tr>
         </thead>
         <tbody id="settingsWindowContentBody">
         </tbody>
         </table>*/
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
                this.settings[setting.category] = [];
            }

            this.settings[setting.category].push(setting);

            rebuildSettingWindow();
        }
    });

    SettingsWindow.prototype.constructor = SettingsWindow;

    modules.settingsWindow = new SettingsWindow();

})(modules.jQuery);