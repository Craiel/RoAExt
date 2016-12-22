(function () {
    'use strict';

    const IntervalUpdateFrequency = 10;

    var intervals = {};

    const Interval = function (n) {
        this.name = n;
    };

    Interval.prototype = {
        isRunning: function () {
            return typeof(intervals[this.name]) !== "undefined"
        },
        clear: function () {
            delete intervals[this.name];
        },
        set: function (callback, frequency) {
            intervals[this.name] = { c: callback, f: frequency, l: Date.now() };
        }
    };

    function updateIntervalHandler() {
        modules.intervalHandler.update();
    }

    function IntervalHandler() {
        RoAModule.call(this, "Interval Handler");
    }

    IntervalHandler.prototype = Object.spawn(RoAModule.prototype, {
        update: function () {
            var time = Date.now();
            for(var key in intervals) {
                var interval = intervals[key];
                if(time - interval.l > interval.f) {
                    interval.c();
                    interval.l = time;
                }
            }
        },
        load: function () {

            setInterval(updateIntervalHandler, IntervalUpdateFrequency);

            RoAModule.prototype.load.apply(this);
        }
    });

    IntervalHandler.prototype.constructor = IntervalHandler;

    modules.createInterval = function (n) {
        return new Interval(n);
    };

    modules.intervalHandler = new IntervalHandler();

})();