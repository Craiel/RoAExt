var AVBUCombat = (function ($) {
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
        console.info("AJAX_SUCC: " + e);

        if(jsonres != null && jsonres.p != null && jsonres.p.autosMax != null)
        {
            updateAutoState(jsonres.p);
            if(!allowAuto) {
                allowAuto = autoMax > 0 && autoCurr > 0 && autoCurr >= autoMax - 1;
            }
        }

        if(req.url != "autobattle.php")
        {
            return;
        }

        if(!captcha && allowAuto && autoMax > 0 && autoCurr > 0 && autoCurr < autoMax && autoCurr < autoMax / 2)
        {
            allowAuto = false;

            $.post('stamina_replenish.php', {}).done(function(x) {
                if (x.captcha) {
                    captcha = true;
                }
            });
        }

        /*console.info(res);
        console.info(req);
        console.info(jsonres);*/
    }

    function onAjaxSendPending(event, jqxhr, settings) {
        //console.info("AJAX_SEND: " + event)
        //console.info(jqxhr);
        //console.info(settings);
    }

    module.resetAuto = function () {
        allowAuto = true;
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