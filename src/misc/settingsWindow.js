(function ($) {

    var template;
    var wnd;

    function onClick() {
        wnd.toggle();
    }

    function SettingsWindow() {
        RoAModule.call(this, "Settings Window");
    }

    SettingsWindow.prototype = Object.spawn(RoAModule.prototype, {
        continueLoad: function () {
            $("<style>").text("" +
                ".settingsWindow{width: 800px; height: 500px;position: absolute; top: 0; left: 0;}\n" +
                ".settingsWindowContent{overflow-y: scroll;}")
                .appendTo("body");

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
        }
    });

    SettingsWindow.prototype.constructor = SettingsWindow;

    modules.settingsWindow = new SettingsWindow();

})(modules.jQuery);