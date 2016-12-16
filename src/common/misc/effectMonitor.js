(function ($) {

    'use strict';

    var timers = {};

    function updateEffectStatus(requestData) {
        if(!requestData.json.p || !requestData.json.p.mods) {
            return;
        }

        var existing = {};
        for (var mod in requestData.json.p.mods) {
            var name = requestData.json.p.mods[mod].n;
            var time = requestData.json.p.mods[mod].ends;

            if(!name || !time || isNaN(time)) {
                continue;
            }

            existing[name] = true;
            if (!timers[name]) {
                timers[name] = modules.createUITimer(name);
                timers[name].sound = modules.settings.settings.notification.effectExpire.sound;
                timers[name].notify = modules.settings.settings.notification.effectExpire.show;
            }

            timers[name].set(time);
            timers[name].resume();
        }

        for (var name in timers) {
            if (existing[name]) {
                continue;
            }

            timers[name].delete();
            delete timers[name];
        }
    }

    function EffectMonitor() {
        RoAModule.call(this, "Effect Monitor");
    }

    EffectMonitor.prototype = Object.spawn(RoAModule.prototype, {
        load: function () {

            modules.ajaxRegisterAutoActions(updateEffectStatus);

            RoAModule.prototype.load.apply(this);
        }
    });

    EffectMonitor.prototype.constructor = EffectMonitor;

    modules.effectMonitor = new EffectMonitor();

})(modules.jQuery);