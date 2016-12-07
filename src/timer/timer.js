(function ($) {
    'use strict';

    const UpdateInterval = 10;

    function UITimer(name) {
        this.name = name;

        modules.uiTimerMenu.registerTimer(this);
    }

    UITimer.prototype = {
        name: null,
        sound: false,
        notify: false,
        lastUpdate: null,
        remaining: 0,
        ended: true,
        interval: null,
        callback: null,
        set: function (timeInSeconds, callback) {
            this.remaining = timeInSeconds;
            this.ended = false;
            this.callback = callback;

            this.interval = modules.createInterval("UITimer_" + this.name);
        },
        getTimeString: function () {
            return new Date(this.remaining).toISOString().substr(11, 8);
        },
        resume: function () {
            this.lastUpdate = new Date();
            this.interval.set(this.updateTimer, UpdateInterval);
        },
        suspend: function () {
            this.interval.cancel();
        },
        updateTimer: function () {
            var diff = new Date() - this.lastUpdate;
            this.remaining = this.remaining - diff;

            if (this.remaining <= 0) {
                this.remaining = 0;
                this.ended = true;
                this.suspend();

                if (this.sound) {
                    console.warn("TODO: implement SFX");
                }

                if (this.notify) {
                    modules.notification.notice("Timer has Ended: " + this.name);
                }

                if (this.callback) {
                    this.callback();
                }
            }
        }
    };

    modules.createUITimer = function (name) {
        return new UITimer(name);
    };

})(modules.jQuery);