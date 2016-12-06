(function () {
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

    function Notifications() {
        RoAModule.call(this, "Notifications");
    }

    Notifications.prototype = Object.spawn(RoAModule.prototype, {
        error: function (msg) {
            modules.logger.error(msg);
            send('ERROR: ' + msg);
        },
        notice: function (msg) {
            modules.logger.log(msg);
            send('NOTE: ' + msg);
        },
        warn: function (msg) {
            modules.logger.warn(msg);
            send('WARNING: ' + msg);
        },
        incompatibility: function (what) {
            this.error("Your browser does not support " + what +
                ". Please <a href='https://www.google.co.uk/chrome/browser/desktop/' target='_blank'>" +
                "Download the latest version of Google Chrome</a>");
        },
        load: function () {
            if (Notification.permission !== "granted") {
                Notification.requestPermission(function () {
                    enabled = true;
                });
            } else {
                enabled = true;
            }

            RoAModule.prototype.load.apply(this);
        }
    });

    Notifications.prototype.constructor = Notifications;

    modules.notification = new Notifications();

})();