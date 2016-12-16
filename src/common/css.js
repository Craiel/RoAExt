(function ($) {
    'use strict';

    function CSS() {
        RoAModule.call(this, "CSS");
    }

    CSS.prototype = Object.spawn(RoAModule.prototype, {
        load: function () {
            // Load css we need
            const $head = $("head");

            for (var key in modules.urls.css) {
                $head.append("<link type='text/css' rel='stylesheet' href='" + modules.urls.css[key] + "'/>");
            }

            RoAModule.prototype.load.apply(this);
        }
    });

    CSS.prototype.constructor = CSS;

    modules.css = new CSS();

})(modules.jQuery);