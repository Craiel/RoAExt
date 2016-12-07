(function ($) {
    'use strict';

    var template;
    var window;

    function onClick() {
        window.toggle();
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
                ".window{width: 800px; height: 500px;position: absolute; top: 0; left: 0;}")
                .appendTo("body");

            window = $(template);
            window.appendTo("body");
            window.draggable({handle:"#noteTitle"});
            window.resizable();
            window.hide();

            $('#noteWindowClose').click(function () {
                window.hide();
            });

            $('#noteEditor').jqte();
            $('#noteEditor').jqteVal(modules.settings.settings.notes);

            modules.createInterval("noteAutoSave").set(autoSave, 5000);

            RoAModule.prototype.load.apply(this);
        },
        load: function () {

            modules.uiScriptMenu.addLink("Notes", onClick);

            $.get(modules.urls.html.noteWindow).done(function (x) {
                template = x;
                modules.uiNoteWindow.continueLoad();
            });
        }
    });

    UINoteWindow.prototype.constructor = UINoteWindow;

    modules.uiNoteWindow = new UINoteWindow();

})(modules.jQuery);