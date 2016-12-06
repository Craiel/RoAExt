(function () {
    'use strict';

    var module = {
        lockAutomation: false
    };

    function onCaptchaSolved(e, res, req, jsonres) {
        modules.session.lockAutomation = false;
    }

    module.captchaEncountered = function (x) {
        this.lockAutomation = true;

        if(modules.settings.settings.notification.captcha.show && modules.settings.settings.notification.enable) {
            modules.notification.warn("Captcha required!");
        }
    };

    module.enable = function () {
        modules.ajaxHooks.register("captcha_submit.php", onCaptchaSolved);
    };

    modules.session = module;

})();