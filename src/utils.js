(function($) {
    'use strict';

    var module = {};

    module.parseTimeStringLong = function (str) {
        var time = 0;
        const match = str.match(/([0-9]+\s+(hours?|minutes?|seconds?))/g);

        for (var i = 0; i < match.length; i++) {
            const currentMatch = match[i].toLowerCase();
            const number = currentMatch.match(/[0-9]+/);
            var multiplier;
            if (currentMatch.indexOf("hour") !== -1) {
                multiplier = 3600000;
            } else if (currentMatch.indexOf("minute") !== -1) {
                multiplier = 60000;
            } else {
                multiplier = 1000;
            }

            time += parseInt(number) * multiplier;
        }

        return time;
    };

    module.svg = function ($this, url) {
        $this.html('<img src="' + modules.urls.gif.ajax_loader + '" alt="Loading"/>');
        $.get(url).done(function (r) {
            $this.html($(r).find("svg"));
        });
        return $this;
    };

    module.pad = function(value, width, padWith) {
        padWith = padWith || '0';
        value = value + '';
        return value.length >= width ? value : new Array(width - value.length + 1).join(padWith) + value;
    };

    module.getElementIntValue = function (elementId) {
        return parseInt($('#' + elementId).text().replace(/\,/g, ''));
    };

    modules.utils = module;

})(modules.jQuery);