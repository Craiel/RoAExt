(function ($) {

    var timer;

    var selectedSkill = null;
    var selectedTime = null;
    var request;
    var setting;

    var lastRepeat = Date.now();

    function updateHarvestState() {
        if(!setting.value || selectedSkill === null || selectedTime === null) {
            console.log("HHR 1");
            return;
        }

        if(!$('#harvestronNotifier').is(":visible")) {
            console.log("HHR 2");
            return;
        }

        if(Date.now() - lastRepeat < modules.constants.HarvestRepeaterMinDelay) {
            console.log("HHR 3");
            return;
        }

        lastRepeat = Date.now();

        modules.logger.log("Re-sending Harvest");
        request.post({skill: selectedSkill, minutes: selectedTime});
        request.send();
    }

    function onSettingChanged() {
        modules.logger.log("Harvest Repeater turned " + (setting.value ? "On" : "Off"));
    }

    function captureHarvestronJob(requestData) {
        var match = requestData.options.data.match(/skill=([0-9]+).*?minutes=([0-9]+)/);
        if(match.length !== 3) {
            return;
        }

        selectedSkill = parseInt(match[1]);
        selectedTime = parseInt(match[2]);

        console.log("Harvest Repeater Set to: " + selectedSkill + "@" + selectedTime);
    }

    function HouseHarvestRepeater() {
        RoAModule.call(this, "House Harvest Repeater");
    }

    HouseHarvestRepeater.prototype = Object.spawn(RoAModule.prototype, {
        load: function () {

            timer = modules.createInterval("HouseHarvestRepeater");
            timer.set(updateHarvestState, 500);

            modules.ajaxHooks.registerRcv("house_harvest_job.php", captureHarvestronJob);

            request = modules.createAjaxRequest("house_harvest_job.php");

            setting = modules.createSetting("House", "Repeat Harvest", "Repeats the last started Harvestron job until turned off");
            setting.callback = onSettingChanged;

            RoAModule.prototype.load.apply(this);
        }
    });

    HouseHarvestRepeater.prototype.constructor = HouseHarvestRepeater;

    modules.houseHarvestRepeater = new HouseHarvestRepeater();

})(modules.jQuery);