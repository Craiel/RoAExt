var AVBU = (function ($) {
    'use strict';

    var module = {};

    module.start = function () {
        var load = AVBULoad($);
        load.loadAll()
    };

    return module;

}());