(function ($) {

    var timer;

    var selectedSkill;
    var selectedTime;
    var request;
    var setting;

    var lastRepeat = Date.now();

    function updateHarvestState() {
        if(!setting.value || !selectedSkill || !selectedTime) {
            return;
        }

        if(!$('#harvestronNotifier').is(":visible")) {
            return;
        }

        if(Date.now() - lastRepeat < modules.constants.HarvestRepeaterMinDelay) {
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
        selectedSkill = parseInt($('#houseHarvestingJobSkill').find(":selected").val());
        selectedTime = parseInt($('#houseHarvestingJobTime').find(":selected").val());
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