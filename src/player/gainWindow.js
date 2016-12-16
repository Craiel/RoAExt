(function ($) {
    'use strict';

    var template;
    var wnd;

    function onClick() {
        wnd.toggle();
    }

    function PlayerGainWindow() {
        RoAModule.call(this, "Player Gain Window");
    }

    PlayerGainWindow.prototype = Object.spawn(RoAModule.prototype, {
        continueLoad: function () {
            $("<style>").text("" +
                ".gainWindow{width: 800px; height: 500px;position: absolute; top: 0; left: 0;}\n" +
                ".gainWindowContent{overflow-y: scroll;}")
                .appendTo("body");

            wnd = $(template);
            wnd.appendTo("body");
            wnd.draggable({handle:"#gainWindowTitle"});
            wnd.resizable();
            wnd.hide();

            $('#gainWindowClose').click(function () {
                wnd.hide();
            });

            modules.uiScriptMenu.addLink("Player Gains", onClick);

            RoAModule.prototype.load.apply(this);
        },
        load: function () {
            $.get(modules.urls.html.playerGainWindow).done(function (x) {
                template = x;
                modules.playerGainWindow.continueLoad();
            });
        }
    });

    PlayerGainWindow.prototype.constructor = PlayerGainWindow;

    modules.playerGainWindow = new PlayerGainWindow();

})(modules.jQuery);