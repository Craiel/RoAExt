(function () {
    'use strict';

    function Logger() {
        RoAModule.call(this, "Logger");
    }

    Logger.prototype = Object.spawn(RoAModule.prototype, {
        formatMessage: function (msg, type) {
            var type = type || "info";
            var d = new Date();
            var time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();

            return "[" + time + "] " + GM_info.script.name + "." + type + ": " + msg;
        },
        log: function (msg) {
            console.log(this.formatMessage(msg));
        },
        warn: function (msg) {
            console.log(this.formatMessage(msg));
        },
        error: function (msg) {
            console.log(this.formatMessage(msg));
        },
        load: function () {
            RoAModule.prototype.load.apply(this);
        }
    });

    Logger.prototype.constructor = Logger;

    modules.logger = new Logger();

})();