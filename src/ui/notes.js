(function ($) {
    'use strict';

    var module = {};

    var noteWindow;

    function onClick() {
        noteWindow.toggle();
    }

    function setupNoteWindow(template) {
        $("<style>").text("" +
            ".noteWindow{width: 800px; height: 500px;position: absolute; top: 0; left: 0;}")
            .appendTo("body");

        noteWindow = $(template);
        noteWindow.appendTo("body");
        noteWindow.draggable({handle:"#noteWindowTitle"});
        noteWindow.resizable();
        noteWindow.hide();

        $('#noteEditor').jqte();
    }

    module.enable = function () {
        var $helpSection = $("#helpSection");

        var $menuLink = $('<a href="javascript:;"/>')
            .html('<li class="visible-xs-inline-block visible-sm-inline-block visible-md-block visible-lg-block">Notes</li>')
            .click(onClick);

        $helpSection.append($menuLink);

        $.get(modules.urls.html.notes).done(setupNoteWindow);
    };

    modules.uiNotes = module;

})(modules.jQuery)