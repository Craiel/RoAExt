(function ($) {
    'use strict';

    var window;
    var template;

    function onClick() {
        window.toggle();
    }

    function UICustomTimer() {
        RoAModule.call(this, "UI Custom Timer");
    }

    UICustomTimer.prototype = Object.spawn(RoAModule.prototype, {
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
            var $helpSection = $("#helpSection");

            var $menuLink = $('<a href="javascript:;"/>')
                .html('<li class="visible-xs-inline-block visible-sm-inline-block visible-md-block visible-lg-block">Custom Timer</li>')
                .click(onClick);

            $helpSection.append($menuLink);

            $.get(modules.urls.html.custom_timer).done(function (x) {
                template = x;
                modules.uiCustomTimer.continueLoad();
            });
        }
    });

    UICustomTimer.prototype.constructor = UICustomTimer;

    modules.uiCustomTimer = new UICustomTimer();

})(modules.jQuery);