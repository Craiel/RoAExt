var AVBUClan = (function ($) {
    'use strict';

    var module = {};

    function addClanDonationMod() {
        // Add a checkbox button and lable to the clan donators list tab.
        $('#myClanDonationTable').before('<label style="display: block; padding-left: 15px; text-indent: -15px; margin-top:-25px"><input type="checkbox" id="toggleDonationPercent" style="width: 13px; height: 13px; padding: 0; margin: 0; vertical-align: bottom; position: relative; top: -3px; *overflow: hidden;" /> Show %</label>');

        // Enable the checkbox to toggle the values in the table from original to percentages and back.
        $('#toggleDonationPercent').change(function() {
            var format = $(this).is(':checked') ? 'percFormat' : 'origFormat';
            $('.donator_list_crystals, .donator_list_platinum, .donator_list_gold, .donator_list_food, .donator_list_wood, .donator_list_iron, .donator_list_stone, .donator_list_experience').each(function(){ $(this).text($(this).attr(format)); });
        });
    }

    function parseClanDonationsPhp() {
        var tCryst = 0, tPlat = 0, tGold = 0, tFood = 0, tWood = 0, tIron = 0, tStone = 0, tExp = 0;
        $('#toggleDonationPercent').attr("checked", false);

        // Get totals from each resource column
        $('.donator_list_crystals').each(function() { tCryst += parseInt($(this).attr('title').replace(/,/g, '')); });
        $('.donator_list_platinum').each(function() { tPlat += parseInt($(this).attr('title').replace(/,/g, '')); });
        $('.donator_list_gold').each(function() { tGold += parseInt($(this).attr('title').replace(/,/g, '')); });
        $('.donator_list_food').each(function() { tFood += parseInt($(this).attr('title').replace(/,/g, '')); });
        $('.donator_list_wood').each(function() { tWood += parseInt($(this).attr('title').replace(/,/g, '')); });
        $('.donator_list_iron').each(function() { tIron += parseInt($(this).attr('title').replace(/,/g, '')); });
        $('.donator_list_stone').each(function() { tStone += parseInt($(this).attr('title').replace(/,/g, '')); });
        $('.donator_list_experience').each(function() { tExp += parseInt($(this).attr('title').replace(/,/g, '')); });

        // Add additional attributes to each cell that contain it's original value and the percent format
        $('.donator_list_crystals').each(function() { $(this).attr({ 'origFormat': $(this).text(), 'percFormat': (parseInt($(this).attr('title').replace(/,/g, ''))*100/tCryst).toFixed(2) + " %" }); });
        $('.donator_list_platinum').each(function() { $(this).attr({ 'origFormat': $(this).text(), 'percFormat': (parseInt($(this).attr('title').replace(/,/g, ''))*100/tPlat).toFixed(2) + " %" }); });
        $('.donator_list_gold').each(function() { $(this).attr({ 'origFormat': $(this).text(), 'percFormat': (parseInt($(this).attr('title').replace(/,/g, ''))*100/tGold).toFixed(2) + " %" }); });
        $('.donator_list_food').each(function() { $(this).attr({ 'origFormat': $(this).text(), 'percFormat': (parseInt($(this).attr('title').replace(/,/g, ''))*100/tFood).toFixed(2) + " %" }); });
        $('.donator_list_wood').each(function() { $(this).attr({ 'origFormat': $(this).text(), 'percFormat': (parseInt($(this).attr('title').replace(/,/g, ''))*100/tWood).toFixed(2) + " %" }); });
        $('.donator_list_iron').each(function() { $(this).attr({ 'origFormat': $(this).text(), 'percFormat': (parseInt($(this).attr('title').replace(/,/g, ''))*100/tIron).toFixed(2) + " %" }); });
        $('.donator_list_stone').each(function() { $(this).attr({ 'origFormat': $(this).text(), 'percFormat': (parseInt($(this).attr('title').replace(/,/g, ''))*100/tStone).toFixed(2) + " %" }); });
        $('.donator_list_experience').each(function() { $(this).attr({ 'origFormat': $(this).text(), 'percFormat': (parseInt($(this).attr('title').replace(/,/g, ''))*100/tExp).toFixed(2) + " %" }); });
    }

    function initialize() {
        if(constants.ENABLE_CLAN_DONATION_TABLE_MOD)
            addClanDonationMod();
    }

    initialize();

    $( document ).ajaxComplete(function( event, xhr, settings ) {
        if (settings.url == "clan_donations.php" && constants.ENABLE_CLAN_DONATION_TABLE_MOD)
            parseClanDonationsPhp();
    });

    return module;

});