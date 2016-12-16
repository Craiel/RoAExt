(function () {
    'use strict';

    var timer;

    function SessionTime() {
        RoAModule.call(this, "Session Time");
    }

    SessionTime.prototype = Object.spawn(RoAModule.prototype, {
        load: function () {
            timer = modules.createUITimer("Session Time");
            timer.increment = true;
            timer.set(0);
            timer.resume();

            RoAModule.prototype.load.apply(this);
        }
    });

    SessionTime.prototype.constructor = SessionTime;

    modules.sessionTime = new SessionTime();

})();