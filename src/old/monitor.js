(function ($) {
    'use strict';

    var module = {};

    module.enable = function () {
        if (modules.settings.settings.features.house_timer) {
            $.get(modules.urls.html.house_timers).done(function (r) {
                const $timer = $(r),
                    $body = $("body");

                $("#houseTimerInfo").addClass("avi-force-block");
                $body.append("<style>#constructionNotifier,#houseTimerTable [data-typeid='Construction']{display:none!important}</style>");
                $("#houseTimerTable").prepend($timer);
                modules.constants.$DOM.house_monitor.status = $("#avi-house-construction").click(modules.handlers.click.house_state_refresh);
                modules.observers.house_status.observe(document.querySelector("#house_notification"), {
                    childList: true,
                    characterData: true
                });
                $(document).ajaxComplete(modules.request.proto.callbacks.success.house_requery);
                $.get("/house.php")
            });
        } else {
            console.log("(skipped due to user settings)");
        }
    };

    modules.houseMonitor = module;

})(modules.jQuery);