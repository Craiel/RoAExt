(function ($) {
    'use strict';

    var module = {};

    const donatorColumns = ['.donator_list_crystals', '.donator_list_platinum', '.donator_list_gold', '.donator_list_food',
        '.donator_list_wood', '.donator_list_iron', '.donator_list_stone', '.donator_list_experience'];

    function parseClanDonationsPhp() {
        $('#toggleDonationPercent').attr("checked", false);

        // Get totals from each resource column
        for(var i = 0; i < donatorColumns.length; i++) {
            var total = 0;
            var column = $(donatorColumns[i]);
            column.each(function() { total += parseInt($(this).attr('title').replace(/,/g, '')); });
            column.each(function() { $(this).attr({ 'origFormat': $(this).text(), 'percFormat': (parseInt($(this).attr('title').replace(/,/g, ''))*100/total).toFixed(2) + " %" }); });
        }
    }

    function initialize(template) {
        // Add a checkbox button and label to the clan donators list tab.
        $('#myClanDonationTable').before(template);

        // Enable the checkbox to toggle the values in the table from original to percentages and back.
        $('#toggleDonationPercent').change(function() {
            var format = $(this).is(':checked') ? 'percFormat' : 'origFormat';
            $(donatorColumns.join(', ')).each(function(){ $(this).text($(this).attr(format)); });
        });

        modules.ajaxHooks.register("clan_donations.php", parseClanDonationsPhp);
    }

    module.enable = function () {
        $.get(modules.urls.clan_donation_percent).done(initialize);
    };

    modules.clanDonations = module;

})(modules.jQuery);