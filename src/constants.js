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
    const gitHubUrl = function (path, author, repo, ver) {
        author = author || "Craiel";
        repo = repo || "RoAExt";
        var version = ver || "master"; // GM_info.script.version

        //var rawGitUrl = "https://cdn.rawgit.com/";

        // For dev this is quicker updates
        var rawGitUrl = "https://rawgit.com/";

        return rawGitUrl + author + "/" + repo + "/" + version + "/" + path;
    };

    module.ENABLE_QUEST_COMPLETE_NOTICE = true;
    module.ENABLE_XP_GOLD_RESOURCE_PER_HOUR = true;
    module.ENABLE_BATTLE_TRACKER = true;
    module.ENABLE_CLAN_DONATION_TABLE_MOD = true;
    module.ENABLE_INGREDIENT_TRACKER = true;
    module.ENABLE_DROP_TRACKER = true;
    module.ENABLE_QUEST_BOOST_REAL_REDUCTION = true;
    module.ENABLE_CHAT_BATTLE_SWAP = true;
    module.ENABLE_CHAT_USER_COLOR_PICKER = true;
    module.perHourColor = "99cc99";
    module.perHourSize = "12";     // Default is 14

    module.URLS = {
        sfx: {
            circ_saw: gitHubUrl("res/sfx/circ_saw.wav"),
            message_ding: gitHubUrl("res/sfx/message_ding.wav")
        },
        css: {
            toast: gitHubUrl("lib/jquery.toastmessage/resources/css/jquery.toastmessage.css"),
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
            charts: gitHubUrl("res/html/charts.html"),
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