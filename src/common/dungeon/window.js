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
            template = modules.templates.dungeonWindow;
            this.continueLoad();
        }
    });

    DungeonWindow.prototype.constructor = DungeonWindow;

    modules.dungeonWindow = new DungeonWindow();

})(modules.jQuery);