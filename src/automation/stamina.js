(function ($) {
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

        //console.info("Combat state: " + autoCurr + "/" + autoMax);
    }

    function updateAutoStamina(e, res, req, jsonres) {
        if(jsonres != null && jsonres.p != null && jsonres.p.autosMax != null)
        {
            updateAutoState(jsonres.p);
            if(!allowAuto) {
                allowAuto = autoMax > 5 && autoCurr > 0 && autoCurr >= autoMax - 1;
            }
        }

        if(modules.session.lockAutomation) {
            return;
        }

        if(enabled && allowAuto && autoMax > 5 && autoCurr > 0 && autoCurr < autoMax && autoCurr < 3)
        {
            allowAuto = false;

            $.post('stamina_replenish.php', {}).done(function(x) {
                if (x.captcha) {
                    modules.session.captchaEncountered(x);
                }
            });
        }
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

        modules.ajaxHooks.register("autobattle.php", updateAutoStamina);
        modules.ajaxHooks.register("autoevent.php", updateAutoStamina);
        modules.ajaxHooks.register("autotrade.php", updateAutoStamina);
        modules.ajaxHooks.register("autocraft.php", updateAutoStamina);
    };

    modules.automateStamina = module;

})(modules.jQuery);