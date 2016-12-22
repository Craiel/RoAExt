(function ($) {
    'use strict';

    var template;
    var wrapper;

    function onMilestoneUpdate(requestData) {
        wrapper.empty();

        if(!requestData.json || requestData.json.length <= 0) {
            return;
        }

        var entryData = requestData.json[0];
        var entry = template.replace(/%NAME%/g, entryData.name);
        entry = entry.replace(/%VALUECUR%/g, entryData.current);
        entry = entry.replace(/%VALUEMAX%/g, entryData.next);
        entry = entry.replace(/%PROGRESS%/g, entryData.percent.toFixed(2));
        entry = entry.replace(/%REWARD%/g, entryData.reward);

        wrapper.append($(entry));
    }

    function MilestoneBar() {
        RoAModule.call(this, "Player Gain Window");
    }

    MilestoneBar.prototype = Object.spawn(RoAModule.prototype, {
        continueLoad: function () {

            wrapper = $('<div style="width: 96%; margin-left: 2%;"></div>');
            $('#areaContent').parent().append(wrapper);

            RoAModule.prototype.load.apply(this);
        },
        load: function () {
            template = modules.templates.milestoneBar;

            //type=PROGRESS_CHECK
            modules.ajaxHooks.register("settings_milestones.php", onMilestoneUpdate);
            modules.ajaxHooks.registerAutoSend("settings_milestones.php", {type: "PROGRESS_CHECK"}, modules.constants.MilestoneUpdateInterval);

            this.continueLoad();
        }
    });

    MilestoneBar.prototype.constructor = MilestoneBar;

    modules.playerMilestoneBar = new MilestoneBar();
    /*<div class="milestoneBarWrapper"><div class="milestoneBarName">Base Stats</div><div class="milestoneBarProgressText">7,057 / 7,260 (97.20%)</div><div class="milestoneBarFillComplete" style="width: 97.203856749311%"></div><div class="milestoneBarFillIncomplete"></div><div style="clear: both;"></div></div>*/


})(modules.jQuery);