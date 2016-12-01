var AVBUInterval = (function () {
    'use strict';

    const Interval = function (n) {
        this.name = n;
    };

    Interval.prototype = {
        _intervals: {},
        isRunning: function () {
            return typeof(this._intervals[this.name]) !== "undefined"
        },
        clear: function () {
            if (this.isRunning()) {
                clearInterval(this._intervals[this.name]);
                delete this._intervals[this.name];
                return true;
            }

            return false;
        },
        set: function (callback, frequency) {
            this.clear();
            this._intervals[this.name] = setInterval(callback, frequency);
            return this._intervals[this.name];
        }
    };

    return function (n) {
        return new Interval(n);
    };

});