(function ($) {
    'use strict';

    var window;
    var template;

    function onClick() {
        window.toggle();
    }

    function UITimerEditor() {
        RoAModule.call(this, "UI Timer Editor");
    }

    UITimerEditor.prototype = Object.spawn(RoAModule.prototype, {
        continueLoad: function () {
            $("<style>").text("" +
                ".createTimerWindow{width: 800px; height: 500px;position: absolute; top: 0; left: 0;}")
                .appendTo("body");

            window = $(template);
            window.appendTo("body");
            window.draggable({handle:"#createTimerTitle"});
            window.resizable();
            window.hide();

            RoAModule.prototype.load.apply(this);
        },
        load: function () {
            modules.uiScriptMenu.addLink("Custom Timer", onClick);

            $.get(modules.urls.html.timerEditor).done(function (x) {
                template = x;
                modules.uiTimerEditor.continueLoad();
            });
        }
    });

    UITimerEditor.prototype.constructor = UITimerEditor;

    modules.uiTimerEditor = new UITimerEditor();

})(modules.jQuery);