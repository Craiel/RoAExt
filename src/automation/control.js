(function ($) {

    var interval;

    var inProgress = false;

    var currentDelayAction;

    function executeJQueryClick(action) {
        // Locate the target
        var control = $(action.control);
        if(action.findClause) {
            control = control.find(action.findClause).first();
        }

        if(control.length === 0 || control.is(":disabled") || control.hasClass("disabled") || control.hasClass("paused")) {
            // Push the action back onto the stack, we are not rdy to execute
            modules.automateControl.pendingActions.push(action);
            inProgress = false;
            return;
        }

        control.click();
        inProgress = false;
    }

    function beginExecuteDelayAction(action) {
        if(!action.time || action.time <= 0) {
            modules.logger.error("Invalid Time on Delay Control Action!");
            inProgress = false;
            return;
        }

        currentDelayAction = action;
        currentDelayAction.startTime = Date.now();
        currentDelayAction.elapsed = 0;
    }

    function continueExecuteDelayAction() {
        currentDelayAction.elapsed += Date.now() - currentDelayAction.startTime;
        if(currentDelayAction.elapsed >= currentDelayAction.time) {
            inProgress = false;
            currentDelayAction = null;
        }
    }

    function execute(action) {
        switch (action.type) {
            case modules.automateActionTypes.JQueryClick: {
                executeJQueryClick(action);
                break;
            }

            case modules.automateActionTypes.Delay: {
                beginExecuteDelayAction(action);
                break;
            }

            default: {
                modules.logger.warn("Unknown Automate Action Type: " + action.type);
                inProgress = false;
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
        isIdle: function () {
            return this.pendingActions.length <= 0 && !inProgress;
        },
        add: function (action) {
            this.pendingActions.unshift(action);
        },
        clear: function () {
            this.pendingActions = [];
        },
        update: function () {
            if(currentDelayAction) {
                continueExecuteDelayAction();
                return;
            }

            if(!$( document ).ready() || !modules.ajaxHooks.idle) {
                return;
            }

            if(this.pendingActions.length > 0) {
                // Ensure we know that we are executing
                inProgress = true;
                execute(this.pendingActions.pop());
            }
        }
    });

    AutomateControl.prototype.constructor = AutomateControl;

    modules.automateControl = new AutomateControl();

})(modules.jQuery);