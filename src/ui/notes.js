(function ($) {
    'use strict';

    var template;
    var noteWindow;

    function onClick() {
        noteWindow.toggle();
    }

    function autoSave() {
        var text = $('.jqte_editor').html();

        modules.settings.settings.notes = text;
    }

    function UINotes() {
        RoAModule.call(this, "UI Timers");
    }

    UINotes.prototype = Object.spawn(RoAModule.prototype, {
        continueLoad: function () {
            $("<style>").text("" +
                ".noteWindow{width: 800px; height: 500px;position: absolute; top: 0; left: 0;}")
                .appendTo("body");

            noteWindow = $(template);
            noteWindow.appendTo("body");
            noteWindow.draggable({handle:"#noteTitle"});
            noteWindow.resizable();
            noteWindow.hide();

            $('#noteEditor').jqte();
            $('#noteEditor').jqteVal(modules.settings.settings.notes);

            modules.createInterval("noteAutoSave").set(autoSave, 5000);

            RoAModule.prototype.load.apply(this);
        },
        load: function () {

            modules.uiScriptMenu.addLink("Notes", onClick);

            $.get(modules.urls.html.notes).done(function (x) {
                template = x;
                modules.uiNotes.continueLoad();
            });
        }
    });

    UINotes.prototype.constructor = UINotes;

    modules.uiNotes = new UINotes();

})(modules.jQuery);