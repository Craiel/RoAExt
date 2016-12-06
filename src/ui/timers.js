(function ($) {
    'use strict';

    var module = { enabled: false };

    function setupTimer(template) {
        $('#rightWrapper').append($(template));
    }

    module.enable = function () {

        $.get(modules.urls.html.custom_timer).done(setupTimer);

        this.enabled = true;

    };

    modules.uiTimers = module;

})(modules.jQuery);