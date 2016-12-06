(function () {
    'use strict';

    const Interval = function (n) {
        this.name = n;
    };

    Interval.prototype = {
        intervals: {},
        isRunning: function () {
            return typeof(this.intervals[this.name]) !== "undefined"
        },
        clear: function () {
            if (this.isRunning()) {
                clearInterval(this.intervals[this.name]);
                delete this.intervals[this.name];
                return true;
            }

            return false;
        },
        set: function (callback, frequency) {
            this.clear();
            this.intervals[this.name] = setInterval(callback, frequency);
            return this.intervals[this.name];
        }
    };

    modules.createInterval = function (n) {
        return new Interval(n);
    };

})();