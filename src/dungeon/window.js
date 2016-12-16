(function ($) {
    'use strict';

    var template;
    var wnd;

    function onClick() {
        wnd.toggle();
    }

    function DungeonWindow() {
        RoAModule.call(this, "Dungeon Window");
    }

    DungeonWindow.prototype = Object.spawn(RoAModule.prototype, {
        continueLoad: function () {
            $("<style>").text("" +
                ".dungeonWindow{width: 800px; height: 500px;position: absolute; top: 0; left: 0;}\n" +
                ".dungeonWindowContent{overflow-y: scroll;}")
                .appendTo("body");

            wnd = $(template);
            wnd.appendTo("body");
            wnd.draggable({handle:"#dungeonWindowTitle"});
            wnd.resizable();
            wnd.hide();

            $('#dungeonWindowClose').click(function () {
                wnd.hide();
            });

            modules.uiScriptMenu.addLink("Dungeon", onClick);

            RoAModule.prototype.load.apply(this);
        },
        load: function () {
            $.get(modules.urls.html.dungeonWindow).done(function (x) {
                template = x;
                modules.dungeonWindow.continueLoad();
            });
        }
    });

    DungeonWindow.prototype.constructor = DungeonWindow;

    modules.dungeonWindow = new DungeonWindow();

})(modules.jQuery);