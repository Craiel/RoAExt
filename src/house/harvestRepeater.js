(function ($) {

    var toggle;
    var timer;

    var selectedSkill;
    var selectedTime;
    var request;
    var setting;

    function updateHarvestState() {
        if(!setting.value || !selectedSkill || !selectedTime) {
            return;
        }

        if(!$('#harvestronNotifier').is(":visible")) {
            return;
        }

        modules.logger.log("Re-sending Harvest");
        request.post({skill: selectedSkill, minutes: selectedTime});
        request.send();
    }

    function onSettingChanged() {
        toggle.text("Repeat " + setting.value === true ? "On" : "Off");
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