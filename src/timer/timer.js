(function () {
    'use strict';

    const UpdateInterval = modules.createInterval("UITimerUpdate");
    UpdateInterval.set(updateTimers, 10);

    var timers = {};

    function updateTimers() {
        for (var name in timers) {
            timers[name].update();
        }
    }

    function UITimer(name, canEdit) {
        this.name = name;
        this.canEdit = canEdit;

        timers[name] = this;
        modules.uiTimerMenu.registerTimer(this);
    }

    UITimer.prototype = {
        name: null,
        sound: false,
        notify: false,
        lastUpdate: null,
        startValue: 0,
        remaining: 0,
        ended: true,
        callback: null,
        paused: false,
        canEdit: false,
        set: function (timeInSeconds, callback) {
            this.remaining = timeInSeconds * 1000;
            this.startValue = this.remaining;
            this.ended = false;
            this.callback = callback;
        },
        setFromData: function (data) {
            this.remaining = data.r;
            this.startValue = data.st;
            this.notify = data.n;
            this.sound = data.s;

            var tdiff = new Date() - Date.parse(data.t);
            if(!tdiff || isNaN(tdiff)) { tdiff = 0; }

            this.remaining = data.r - tdiff;
        },
        end: function () {
            this.remaining = 0;
        },
        getStartTimeString : function () {
            return new Date(this.startValue).toISOString().substr(11, 8);
        },
        getTimeString: function () {
            return new Date(this.remaining).toISOString().substr(11, 8);
        },
        resume: function () {
            this.lastUpdate = new Date();
            this.paused = false;
            this.ended = false;
        },
        suspend: function () {
            this.paused = true;
        },
        delete: function () {
            modules.uiTimerMenu.unregisterTimer(this.name);
            delete timers[this.name];
        },
        save: function () {
            return {
                t: new Date(),
                r: this.remaining,
                st: this.startValue,
                s: this.sound,
                n: this.notify
            };
        },
        update: function () {
            if (this.paused) {
                return;
            }

            var newUpdateTime = new Date();
            var diff = newUpdateTime - this.lastUpdate;
            this.lastUpdate = newUpdateTime;

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

    modules.createUITimer = function (name, canEdit) {
        return new UITimer(name, canEdit);
    };

})();