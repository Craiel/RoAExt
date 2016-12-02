var AVBUAuto = (function ($) {
    'use strict';

    var module = {};

    var autoMax = 0;
    var autoCurr = 0;
    var allowAuto = true;
    var captcha = false;

    function updateAutoState(json)
    {
        autoMax = parseInt(json.autosMax);
        autoCurr = parseInt(json.autosRemaining);

        console.info("Combat state: " + autoCurr + "/" + autoMax);
    }

    function onAjaxSuccess(e, res, req, jsonres) {
        if(jsonres != null && jsonres.p != null && jsonres.p.autosMax != null)
        {
            updateAutoState(jsonres.p);
            if(!allowAuto) {
                allowAuto = autoMax > 5 && autoCurr > 0 && autoCurr >= autoMax - 1;
            }
        }

        if(req.url != "autobattle.php" && req.url != "autoevent.php" && req.url != "autotrade.php")
        {
            console.info(req.url);
            return;
        }

        if(!captcha && allowAuto && autoMax > 5 && autoCurr > 0 && autoCurr < autoMax && autoCurr < 3)
        {
            allowAuto = false;

            $.post('stamina_replenish.php', {}).done(function(x) {
                if (x.captcha) {
                    captcha = true;
                }
            });
        }
    }

    function onAjaxSendPending(event, jqxhr, settings) {
    }

    module.enable = function() {
        $(document).on("ajaxSend", onAjaxSendPending);
        $(document).on("ajaxSuccess", onAjaxSuccess);
    };

    module.disable = function() {
        $(document).off("ajaxSend", onAjaxSendPending);
        $(document).off("ajaxSuccess", onAjaxSuccess);
    };

    return module;

});