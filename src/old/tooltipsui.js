(function ($) {
    'use strict';

    var module = {};

    module.enable = function () {
        $(".avi-tip").tooltip({
            container: "body",
            viewport: {"selector": "body", "padding": 0}
        });
        $("[data-delegate-click]").click(modules.handlers.click.delegate_click);
    };

    modules.uiTooltips = module;

})(modules.jQuery);