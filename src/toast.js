(function ($) {
    'use strict';

    var enabled = false;
    var useChromeNotifications = false;

    var module = {};

    function sendToast(type, msg) {
        if(!enabled) {
            return;
        }

        if(useChromeNotifications) {
            new Notification('Relics of Avabur', {
                body: "msg",
            });
        } else {
            $().toastmessage(type, msg);
        }
    }

    module.error = function (msg) {
        console.error(msg);
        sendToast('showErrorToast', msg);
    };

    module.notice = function (msg) {
        sendToast('showNoticeToast', msg);
    };

    module.success = function (msg) {
        sendToast('showSuccessToast', msg);
    };

    module.warn = function (msg) {
        console.warn(msg);
        sendToast('showWarningToast', msg);
    };

    module.incompatibility = function (what) {
        $().toastmessage('showToast', {
            text: "Your browser does not support " + what +
            ". Please <a href='https://www.google.co.uk/chrome/browser/desktop/' target='_blank'>" +
            "Download the latest version of Google Chrome</a>",
            sticky: true,
            position: 'top-center',
            type: 'error'
        });
    };

    module.enable = function () {
        if (Notification.permission !== "granted")
            Notification.requestPermission();
    };

    modules.toast = module;

})(modules.jQuery);