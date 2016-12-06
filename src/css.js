(function ($) {
    'use strict';

    var module = {};

    module.enable = function () {
        // Load css we need
        const $head = $("head");

        for (var key in modules.urls.css) {
            $head.append("<link type='text/css' rel='stylesheet' href='" + modules.urls.css[key] + "'/>");
        }
    };

    modules.css = module;

})(modules.jQuery);