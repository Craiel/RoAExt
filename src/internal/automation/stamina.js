(function ($) {
    'use strict';

    const CaptchaWarningInterval = 60 * 5 * 1000; // warn every 5 minutes

    var autoMax = 0;
    var autoCurr = 0;
    var enabled = true;
    var allowAuto = true;
    var lastWarningTime = Date.now();

    var replenishRequest;

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

    function updateAutoStamina(requestData) {
        if(requestData.json != null && requestData.json.p != null && requestData.json.p.autosMax != null)
        {
            updateAutoState(requestData.json.p);
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
            replenishRequest.send();
        }

        if(enabled && autoCurr < 0) {
            if(Date.now() - lastWarningTime > CaptchaWarningInterval) {
                lastWarningTime = Date.now();
                modules.notification.warn("Auto Stamina requires Captcha Attention!");
            }
        }
    }

    function onStaminaReplenish(requestData) {
        if (requestData.json.captcha) {
            lastWarningTime = Date.now();
            modules.session.captchaEncountered();
        }
    }

    function createToggle(target) {
        var toggleButton = $("<button class='btn btn-primary'/>");
        toggleButton.click(toggleAuto);
        toggleButton.text("ON");

        $('#' + target).prepend(toggleButton);
    }

    function AutoStamina() {
        RoAModule.call(this, "Auto Stamina");
    }

    AutoStamina.prototype = Object.spawn(RoAModule.prototype, {
        load: function () {
            createToggle('craftingStatusButtons');
            createToggle('battleStatusButtons');
            createToggle('harvestStatusButtons');
            createToggle('harvestBossStatusButtons');
            createToggle('bossStatusButtons');

            replenishRequest = modules.createAjaxRequest('stamina_replenish.php').post();
            modules.ajaxHooks.register('stamina_replenish.php', onStaminaReplenish);

            modules.ajaxRegisterAutoActions(updateAutoStamina);

            RoAModule.prototype.load.apply(this);
        }
    });

    AutoStamina.prototype.constructor = AutoStamina;

    modules.automateStamina = new AutoStamina();

})(modules.jQuery);