(function ($) {

    var interval;

    function executeJQueryClick(action) {
        // Locate the target
        var control = $(action.control);
        if(action.findClause) {
            control = control.find(action.findClause).first();
        }

        if(control.length === 0 || control.is(":disabled") || control.hasClass("disabled") || control.hasClass("paused")) {
            // Push the action back onto the stack, we are not rdy to execute
            modules.automateControl.pendingActions.push(action);
            return;
        }

        control.click();
    }

    function execute(action) {
        switch (action.type) {
            case modules.automateActionTypes.JQueryClick: {
                executeJQueryClick(action);
                break;
            }

            default: {
                modules.logger.warn("Unknown Automate Action Type: " + action.type);
            }
        }
    }

    function onUpdateAutomateControl() {
        modules.automateControl.update();
    }

    function AutomateControl() {
        RoAModule.call(this, "Automate Control");
    }

    AutomateControl.prototype = Object.spawn(RoAModule.prototype, {
        pendingActions: [],
        load: function () {

            interval = modules.createInterval("AutomateControl");
            interval.set(onUpdateAutomateControl, 200);

            RoAModule.prototype.load.apply(this);
        },
        add: function (action) {
            this.pendingActions.unshift(action);
        },
        clear: function () {
            this.pendingActions = [];
        },
        update: function () {
            if(!$( document ).ready() || !modules.ajaxHooks.idle) {
                return;
            }

            if(this.pendingActions.length > 0) {
                execute(this.pendingActions.pop());
            }
        }
    });

    AutomateControl.prototype.constructor = AutomateControl;

    modules.automateControl = new AutomateControl();

})(modules.jQuery);