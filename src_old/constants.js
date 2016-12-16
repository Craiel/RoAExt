module.perHourColor = "99cc99";
module.perHourSize = "12";     // Default is 14

////////////////////////////////////////////////////////////////////////
// These are the settings - you can safely change them, but they will //
// be overwritten during script updates                               //
////////////////////////////////////////////////////////////////////////

/** How long our AJAX cache is meant to last */
module.CACHE_TTL = {
    /** Resource tooltip market price lookups */
    market: 1 / 3600 * 60, //30 sec,
    /** Tradeskill material ID mapping */
    tradeskill_mats: 1
};

module.SFX = {
    circ_saw: new buzz.sound(module.URLS.sfx.circ_saw),
    msg_ding: new buzz.sound(module.URLS.sfx.message_ding)
};

/** AJAX spinners throughout the page */
module.$AJAX_SPINNERS = {
    /** The spinner @ the currency tooltip */
    currency_tooltip: $('<img src="' + module.URLS.img.ajax_loader + '"/>')
};

module.FUNCTION_PERSISTENT_VARS = {
    house_update_last_msg: null,
};

/////////////////////////////////////////////////////
// This is the script code. Don't change it unless //
// you know what you're doing ;)                   //
/////////////////////////////////////////////////////

/** Our persistent DOM stuff */
module.$DOM = {
    currency_tooltip: {
        the_tooltip: $("#currencyTooltip"),
        /** The HTML element which will be used for currency tooltip colour references */
        colour_reference: $("#currencyTooltipMarketable"),
        /** Thr row we will be colouring */
        table_row: null,
        /** The 1st page low price */
        market_low: null,
        /** The 1st page avg price */
        market_avg: null,
        /** The 1st page high price */
        market_high: null
    },
    /** Game modals */
    modal: {
        /** The outer wrapper */
        modal_wrapper: $("#modalWrapper"),
        /** The faded background for modals */
        modal_background: $("#modalBackground"),
        /** The title for modal windows */
        modal_title: $("#modalTitle"),
        /** The script settings modal */
        script_settings: null
    },
    /** Navigation items */
    nav: {
        market: $("#viewMarket")
    },
    house_monitor: {
        status: null
    },
    market: {
        navlinks: $("#marketTypeSelector").find("a"),
        market_tooltip: null
    }
};