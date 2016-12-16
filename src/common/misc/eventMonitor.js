(function () {
    'use strict';

    var eventTimer;
    var timeSinceEventTimer;

    function updateEventStatus(requestData) {
        if(!requestData.json.p) {
            return;
        }

        if(requestData.json.p.event_time && requestData.json.p.event_time > 0) {
            modules.settings.settings.lastEventTime = null;

            if(timeSinceEventTimer) {
                timeSinceEventTimer.delete();
                timeSinceEventTimer = null;
            }

            if(!eventTimer) {
                eventTimer = modules.createUITimer("Next Event");
                eventTimer.sound = modules.settings.settings.notification.event.sound;
                eventTimer.notify = modules.settings.settings.notification.event.show;
            }

            eventTimer.set(requestData.json.p.event_time);
            eventTimer.resume();
        } else if (eventTimer) {
            eventTimer.delete();
            eventTimer = null;

            if(!timeSinceEventTimer) {
                modules.settings.settings.lastEventTime = new Date();
                createLastEventTimer(0);
            }
        }
    }

    function createLastEventTimer(time) {
        timeSinceEventTimer = modules.createUITimer("Last Event");
        timeSinceEventTimer.increment = true;
        timeSinceEventTimer.set(time);
        timeSinceEventTimer.resume();
    }

    function EventMonitor() {
        RoAModule.call(this, "Event Monitor");
    }

    EventMonitor.prototype = Object.spawn(RoAModule.prototype, {
        load: function () {

            modules.ajaxRegisterAutoActions(updateEventStatus);

            // Load the time since last event if it's there
            if (modules.settings.settings.lastEventTime) {
                var timeSinceEvent = new Date() - Date.parse(modules.settings.settings.lastEventTime);
                createLastEventTimer(timeSinceEvent);
            }

            RoAModule.prototype.load.apply(this);
        }
    });

    EventMonitor.prototype.constructor = EventMonitor;

    modules.eventMonitor = new EventMonitor();

})();