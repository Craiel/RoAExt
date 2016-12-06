(function ($) {
    'use strict';

    var module = {};

    function setupTimer(template) {
        $('#rightWrapper').append($(template));
    }

    module.enable = function () {

        $.get(modules.urls.html.timers).done(setupTimer);

    };

    modules.uiTimers = module;

    // Always enable
    modules.uiTimers.enable();

})(modules.jQuery);