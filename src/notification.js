(function ($) {
    'use strict';

    var enabled = false;

    var module = {};

    function send(msg) {
        if(!enabled) {
            return;
        }

        new Notification('Relics of Avabur', {
            body: msg,
        });
    }

    module.error = function (msg) {
        console.error(msg);
        send('ERROR: ' + msg);
    };

    module.notice = function (msg) {
        console.log(msg);
        send('NOTE: ' + msg);
    };

    module.warn = function (msg) {
        console.warn(msg);
        send('WARNING: ' + msg);
    };

    module.incompatibility = function (what) {
        this.error("Your browser does not support " + what +
            ". Please <a href='https://www.google.co.uk/chrome/browser/desktop/' target='_blank'>" +
            "Download the latest version of Google Chrome</a>");
    };

    module.enable = function () {
        if (Notification.permission !== "granted") {
            Notification.requestPermission(function () {
                enabled = true;
            });
        } else {
            enabled = true;
        }
    };

    modules.notification = module;

})(modules.jQuery);