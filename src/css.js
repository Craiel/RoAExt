(function ($) {
    'use strict';

    var module = {};

    module.enable = function () {
        // Load css we need
        const $head = $("head"),
            keys = Object.keys(modules.constants.URLS.css);

        for (var i = 0; i < keys.length; i++) {
            $head.append("<link type='text/css' rel='stylesheet' href='" + modules.constants.URLS.css[keys[i]] + "'/>");
        }
    };

    modules.css = module;

})(modules.jQuery);