(function () {

    var actionType = {
        JQueryClick: 0
    };

    function AutomateControlAction(type) {
        RoAModule.call(this, "Automate Control Action");

        this.type = type;
    }

    AutomateControlAction.prototype = Object.spawn(RoAModule.prototype, {
        type: null,
        pendingActions: [],
        load: function () {
            RoAModule.prototype.load.apply(this);
        }
    });

    AutomateControlAction.prototype.constructor = AutomateControlAction;

    modules.automateActionTypes = actionType;

    modules.createAutomateAction = function (type) {
        return new AutomateControlAction(type);
    };

})();