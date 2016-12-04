var AVBUAuto = (function ($) {
    'use strict';

    var module = {};

    var autoMax = 0;
    var autoCurr = 0;
    var initialized = false;
    var enabled = true;
    var allowAuto = true;

    function toggleAuto(self) {
        enabled = !enabled;
        console.log("Toggled auto " + enabled);

        var $this = $(this)
        if (enabled) {
            $this.text('ON');
        } else {
            $this.text('OFF');
        }
    }

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

        if(req.url != "autobattle.php" && req.url != "autoevent.php" && req.url != "autotrade.php" && req.url != "autocraft.php")
        {
            console.info(req.url);
            return;
        }

        if(enabled && allowAuto && autoMax > 5 && autoCurr > 0 && autoCurr < autoMax && autoCurr < 3)
        {
            allowAuto = false;

            $.post('stamina_replenish.php', {}).done(function(x) {
                if (x.captcha) {
                    toast.warn("Captcha required!");
                }
            });
        }
    }

    function onAjaxSendPending(event, jqxhr, settings) {
    }

    function createToggle(target) {
        var toggleButton = $("<button class='btn btn-primary'/>");
        toggleButton.click(toggleAuto);
        toggleButton.text("ON");

        $('#' + target).prepend(toggleButton);
    }

    function initialize() {

        console.log("Initializing Auto..");

        createToggle('craftingStatusButtons');
        createToggle('battleStatusButtons');
        createToggle('harvestStatusButtons');

        initialized = true;
    }

    module.enable = function() {
        if(!initialized) {
            initialize();
        }

        $(document).on("ajaxSend", onAjaxSendPending);
        $(document).on("ajaxSuccess", onAjaxSuccess);
    };

    module.disable = function() {
        $(document).off("ajaxSend", onAjaxSendPending);
        $(document).off("ajaxSuccess", onAjaxSuccess);
    };

    return module;

});