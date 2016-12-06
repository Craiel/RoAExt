(function ($) {
    'use strict';

    var module = {};

    var noteWindow;

    function onClick() {
        noteWindow.toggle();
    }

    function autoSave() {
        var text = $('.jqte_editor').html();

        modules.settings.settings.notes = text;
    }

    function setupNoteWindow(template) {
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
    }

    module.enable = function () {
        var $menuSection = $("#roaMenuContent");

        var $menuLink = $('<a href="javascript:;"/>')
            .html('<li class="visible-xs-inline-block visible-sm-inline-block visible-md-block visible-lg-block">Notes</li>')
            .click(onClick);

        $menuSection.append($menuLink);

        $.get(modules.urls.html.notes).done(setupNoteWindow);
    };

    modules.uiNotes = module;

})(modules.jQuery);