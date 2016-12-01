var AVBUConstants = (function($) {
    'use strict';

    var module = {};

    /**
     * Creates a GitHub CDN URL
     * @param {String} path Path to the file without leading slashes
     * @param {String} [author] The author. Defaults to Alorel
     * @param {String} [repo] The repository. Defaults to avabur-improved
     * @returns {String} The URL
     */
    const gitHubUrl = function (path, author, repo) {
        author = author || "Craiel";
        repo = repo || "RoAExt";

        return "https://cdn.rawgit.com/" + author + "/" + repo + "/" + GM_info.script.version + "/" + path;
    };

    module.URLS = {
        sfx: {
            circ_saw: gitHubUrl("res/sfx/circ_saw.wav"),
            message_ding: gitHubUrl("res/sfx/message_ding.wav")
        },
        css: {
            toast: gitHubUrl("lib/toastmessage/jquery.toastmessage.min.css"),
            script: gitHubUrl("res/css/avabur-improved.min.css")
        },
        img: {
            ajax_loader: gitHubUrl("res/img/ajax-loader.gif")
        },
        svg: {
            sword_clash: gitHubUrl("res/svg/sword-clash.svg"),
            log: gitHubUrl("res/svg/log.svg"),
            metal_bar: gitHubUrl("res/svg/metal-bar.svg"),
            stone_block: gitHubUrl("res/svg/stone-block.svg"),
            fishing: gitHubUrl("res/svg/fishing.svg")
        },
        html: {
            house_timers: gitHubUrl("res/html/house-timers.html"),
            settings_modal: gitHubUrl("res/html/script-settings.html"),
            market_tooltip: gitHubUrl("res/html/market-tooltip.html")
        }
    };

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

    return module;
});