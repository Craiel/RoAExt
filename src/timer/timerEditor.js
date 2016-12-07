(function ($) {
    'use strict';

    var wnd;
    var template;

    function onClick() {
        wnd.toggle();
    }

    function UITimerEditor() {
        RoAModule.call(this, "UI Timer Editor");
    }

    UITimerEditor.prototype = Object.spawn(RoAModule.prototype, {
        show: function () {
            wnd.show();
        },
        continueLoad: function () {
            $("<style>").text("" +
                ".timerEditorWindow{width: 800px; height: 500px;position: absolute; top: 0; left: 0;}")
                .appendTo("body");

            wnd = $(template);
            wnd.appendTo("body");
            wnd.draggable({handle:"#timerEditorTitle"});
            wnd.resizable();
            wnd.hide();

            $('#timerEditorWindowClose').click(function () {
                wnd.hide();
            });

            RoAModule.prototype.load.apply(this);
        },
        load: function () {
            // modules.uiScriptMenu.addLink("Custom Timer", onClick);

            $.get(modules.urls.html.timerEditor).done(function (x) {
                template = x;
                modules.uiTimerEditor.continueLoad();
            });
        }
    });

    UITimerEditor.prototype.constructor = UITimerEditor;

    modules.uiTimerEditor = new UITimerEditor();

})(modules.jQuery);