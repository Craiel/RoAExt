(function ($) {
    'use strict';

    var module = {};

    var window;

    function onClick() {
        window.toggle();
    }

    function setupTimerWindow(template) {
        $("<style>").text("" +
            ".createTimerWindow{width: 800px; height: 500px;position: absolute; top: 0; left: 0;}")
            .appendTo("body");

        window = $(template);
        window.appendTo("body");
        window.draggable({handle:"#createTimerTitle"});
        window.resizable();
        window.hide();
    }

    module.enable = function () {

        var $helpSection = $("#helpSection");

        var $menuLink = $('<a href="javascript:;"/>')
            .html('<li class="visible-xs-inline-block visible-sm-inline-block visible-md-block visible-lg-block">Custom Timer</li>')
            .click(onClick);

        $helpSection.append($menuLink);

        $.get(modules.urls.html.custom_timer).done(setupTimerWindow);
    };

    modules.uiCustomTimer = module;

})(modules.jQuery);