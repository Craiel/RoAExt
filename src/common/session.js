(function () {
    'use strict';

    function onCaptchaSolved(requestData) {
        modules.session.lockAutomation = false;
    }

    function Session() {
        RoAModule.call(this, "Session");
    }

    Session.prototype = Object.spawn(RoAModule.prototype, {
        lockAutomation: false,
        dungeonNeedsUpdate: true,
        captchaEncountered: function () {
            // TODO: not working properly right now
            // this.lockAutomation = true;

            if(modules.settings.settings.notification.captcha.show && modules.settings.settings.notification.enable) {
                modules.notification.warn("Captcha required!");
            }
        },
        load: function () {
            modules.ajaxHooks.register("captcha_submit.php", onCaptchaSolved);

            RoAModule.prototype.load.apply(this);
        }
    });

    Session.prototype.constructor = Session;

    modules.session = new Session();

})();