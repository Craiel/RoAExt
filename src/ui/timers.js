(function ($) {
    'use strict';

    var template;

    function UITimers() {
        RoAModule.call(this, "UI Timers");
    }

    UITimers.prototype = Object.spawn(RoAModule.prototype, {
        continueLoad: function() {
            $('#rightWrapper').append($(template));

            RoAModule.prototype.load.apply(this);
        },
        load: function () {
            $.get(modules.urls.html.timers).done(function (x) {
                template = x;
                modules.uiTimers.continueLoad();
            });
        }
    });

    UITimers.prototype.constructor = UITimers;

    modules.uiTimers = new UITimers();

})(modules.jQuery);