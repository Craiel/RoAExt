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

    module.formatNumber = function(n, c, d, t) {
        var c = isNaN(c = Math.abs(c)) ? 2 : c, d = d == undefined ? "." : d, t = t == undefined ? ","
            : t, s = n < 0 ? "-" : "", i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", j = (j = i.length) > 3 ? j % 3
            : 0;
        return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t)
            + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
    };

    module.hasFraction = function (n) {
        return (n % 1) > 0;
    };

    module.randomInt = function(min, max) {
        return Math.round(Math.random() * ( max - min )) + min;
    };

    module.randomColor = function() {
        var color = "#";
        for (var i = 0; i < 6; i++) {
            color += Math.floor(Math.random() * 15).toString(16);
        }

        return color;
    };

    module.randomName = function(min, max) {
        var a = "aeiou".split("");
        var b = "rtzpsdfghklmnbvc".split("");
        var l = modules.utils.randomInt(min, max);
        var name = "";
        for (var i = 0; i < l; i++)
        {
            var charset = i % 2 === 0 ? a : b;
            if ( i === 0 )
            {
                charset = Math.random() < 0.5 ? a : b;
            }

            var letter = charset[modules.utils.randomInt(0, charset.length - 1)];
            name += i === 0 ? letter.toUpperCase() : letter;
        }

        return name;
    };

    module.capitalizeFirstLetter = function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    modules.utils = module;

})(modules.jQuery);