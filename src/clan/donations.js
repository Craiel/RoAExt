(function ($) {
    'use strict';

    var template;

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

    function ClanDonations() {
        RoAModule.call(this, "Clan Donations");
    }

    ClanDonations.prototype = Object.spawn(RoAModule.prototype, {
        continueLoad: function() {
            // Add a checkbox button and label to the clan donators list tab.
            $('#myClanDonationTable').before($(template));

            // Enable the checkbox to toggle the values in the table from original to percentages and back.
            $('#toggleDonationPercent').change(function() {
                var format = $(this).is(':checked') ? 'percFormat' : 'origFormat';

                for(var i = 0; i < donatorColumns.length; i++) {
                    $(donatorColumns[i]).each(function(){ $(this).text($(this).attr(format)); });
                }
            });

            modules.ajaxHooks.register("clan_donations.php", parseClanDonationsPhp);

            RoAModule.prototype.load.apply(this);
        },
        load: function () {
            $.get(modules.urls.html.clanDonationPercent).done(function (x) {
                template = x;
                modules.clanDonations.continueLoad();
            });
        }
    });

    ClanDonations.prototype.constructor = ClanDonations;

    modules.clanDonations = new ClanDonations();

})(modules.jQuery);