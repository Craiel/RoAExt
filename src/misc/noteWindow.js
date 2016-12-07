(function ($) {
    'use strict';

    var template;
    var wnd;

    function onClick() {
        wnd.toggle();
    }

    function autoSave() {
        var text = $('.jqte_editor').html();

        modules.settings.settings.notes = text;
    }

    function UINoteWindow() {
        RoAModule.call(this, "UI Note Window");
    }

    UINoteWindow.prototype = Object.spawn(RoAModule.prototype, {
        continueLoad: function () {
            $("<style>").text("" +
                ".noteWindow{width: 800px; height: 500px;position: absolute; top: 0; left: 0;}")
                .appendTo("body");

            wnd = $(template);
            wnd.appendTo("body");
            wnd.draggable({handle:"#noteTitle"});
            wnd.resizable();
            wnd.hide();

            $('#noteWindowClose').click(function () {
                wnd.hide();
            });

            $('#noteEditor').jqte();
            $('#noteEditor').jqteVal(modules.settings.settings.notes);

            modules.createInterval("noteAutoSave").set(autoSave, 5000);

            modules.uiScriptMenu.addLink("Notes", onClick);

            RoAModule.prototype.load.apply(this);
        },
        load: function () {
            $.get(modules.urls.html.noteWindow).done(function (x) {
                template = x;
                modules.uiNoteWindow.continueLoad();
            });
        }
    });

    UINoteWindow.prototype.constructor = UINoteWindow;

    modules.uiNoteWindow = new UINoteWindow();

})(modules.jQuery);