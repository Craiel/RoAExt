(function ($) {

    var toggle;
    var timer;
    var enabled = false;

    var selectedSkill;
    var selectedTime;

    function updateHarvestState() {
        if(!enabled || !selectedSkill || !selectedTime) {
            return;
        }

        if(!$('#harvestronNotifier').is(":visible")) {
            return;
        }

        modules.logger.log("Re-sending Harvest");
        request.post({skill: selectedSkill, minutes: selectedTime});
        request.send();
    }

    function toggleEnable() {
        enabled = !enabled;
        toggle.text("Repeat " + enabled === true ? "On" : "Off");
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

            toggle = $('<div></div>');
            toggle.click(toggleEnable);

            $('#houseHarvestingJobCancel').before(toggle);

            timer = modules.createInterval("HouseHarvestRepeater");
            timer.set(updateHarvestState, 500);

            modules.ajaxHooks.registerRcv("house_harvest_job.php", captureHarvestronJob);

            request = modules.createAjaxRequest("house_harvest_job.php");

            RoAModule.prototype.load.apply(this);
        }
    });

    HouseHarvestRepeater.prototype.constructor = HouseHarvestRepeater;

    modules.houseHarvestRepeater = new HouseHarvestRepeater();

})(modules.jQuery);