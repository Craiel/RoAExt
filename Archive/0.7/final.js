// ==UserScript==
// @name           Avabur Improved
// @namespace      org.craiel.avaburimproved
// @author         Craiel
// @homepage       https://github.com/Craiel/RoAExt
// @description    Some welcome additions to Avabur's UI choices
// @include        https://avabur.com/game.php
// @include        http://avabur.com/game.php
// @include        https://www.avabur.com/game.php
// @include        http://www.avabur.com/game.php
// @version        0.7
// @icon           https://cdn.rawgit.com/Craiel/RoAExt/master/res/img/logo-16.png
// @icon64         https://cdn.rawgit.com/Craiel/RoAExt/master/res/img/logo-64.png
// @run-at         document-end
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_deleteValue
// @grant          GM_notification
// @grant          GM_listValues
// @grant          GM_xmlhttpRequest
// @connect        self
// @require        https://raw.githubusercontent.com/Craiel/RoAExt/master/lib/jquery.toastmessage/javascript/jquery.toastmessage.js
// @require        https://cdnjs.cloudflare.com/ajax/libs/buzz/1.1.10/buzz.min.js
// @require        https://cdn.rawgit.com/SaneMethod/jquery-ajax-localstorage-cache/master/dist/jalc.min.js
// @require        https://cdn.rawgit.com/Alorel/alo-timer/master/src/alotimer.min.js
// @require        https://cdnjs.cloudflare.com/ajax/libs/spectrum/1.8.0/spectrum.min.js
// @require        https://cdnjs.cloudflare.com/ajax/libs/canvasjs/1.7.0/jquery.canvasjs.min.js


// @noframes
// ==/UserScript==
'use strict';

const modules = {
    jQuery: jQuery
};(function ($) {
    'use strict';

    var module = {};

    const RequestAutoSendCheckFrequency = 100;
    const RequestSendThreshold = 500; // the time where we will warn about frequent requests to the same page

    var registry = {};
    var requestHistory = {};
    var autoRequests = {};

    function onAjaxSuccess(e, res, req, jsonData) {
        var requestDate = new Date();

        if(requestHistory[req.url]) {
            var timeSinceLastRequest = requestDate - requestHistory[req.url];
            if(timeSinceLastRequest < RequestSendThreshold) {
                console.warn("Same request was done recently (" + req.url + ")");
            }
        }

        requestHistory[req.url] = requestDate;

        // check if there is an auto request for this url
        if (autoRequests[req.url]) {
            // unlock the auto since we got a response
            autoRequests[req.url].locked = false;
        }

        console.log(req.url);
        console.log(jsonData);

        for(var entry in registry) {
            if(req.url === entry) {
                for (var i = 0; i < registry[entry].length; i++) {
                    registry[entry][i](e, res, req, jsonData);
                }

                return;
            }
        }
    }

    function autoSendAjaxRequests() {
        for (var url in autoRequests) {
            var request = autoRequests[url];
            if(request.locked) {
                continue;
            }

            var timeSinceReceive = new Date() - (requestHistory[url] || 0);

            if(timeSinceReceive >= request.interval) {
                console.log("Auto-sending ajax for " + url);
                request.locked = true;
                $.post(url, request.payload);
            }
        }
    }

    module.registerAutoSend = function (url, payload, interval) {
        if(autoRequests[url]) {
            console.error("Url " + url + " is already registered for auto send!");
            return;
        }

        autoRequests[url] = { payload: payload, interval: interval, locked: false };
    };

    module.register = function(site, callback) {
        if(!registry[site]) {
            registry[site] = [];
        }

        registry[site].push(callback);
    };

    module.enable = function () {
        //$(document).on("ajaxSend", onAjaxSendPending);
        $(document).on("ajaxSuccess", onAjaxSuccess);

        modules.createInterval("ajaxHooksAutoSend").set(autoSendAjaxRequests, RequestAutoSendCheckFrequency);
    };

    modules.ajaxHooks = module;

})(modules.jQuery);(function ($) {
    'use strict';

    var module = {};

    function updateIngredientIds() {
        const cached_ids = window.sessionStorage.getItem("TRADESKILL_MATERIAL_IDS");
        if (cached_ids) {
            modules.cache.TRADESKILL_MATS = JSON.parse(cached_ids);
        } else {
            $.post("/market.php", {
                type: "ingredient",
                page: 0,
                st: "all"
            }, function (r) {
                const select = $("<select/>"),
                    mats = {};
                select.html(r.filter);

                select.find(">option:not([value=all])").each(function () {
                    const $this = $(this);
                    mats[$this.text().trim()] = parseInt($this.val());
                });

                window.sessionStorage.setItem("TRADESKILL_MATERIAL_IDS", JSON.stringify(mats));
                modules.cache.TRADESKILL_MATS = mats;
            });
        }
    }

    module.TRADESKILL_MATS = {};

    module.enable = function () {
        updateIngredientIds();
    };

    modules.cache = module;

})(modules.jQuery);(function($) {
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

    modules.constants = module;
})(modules.jQuery);(function ($) {
    'use strict';

    var module = {};

    module.enable = function () {
        // Load css we need
        const $head = $("head"),
            keys = Object.keys(modules.constants.URLS.css);

        for (var i = 0; i < keys.length; i++) {
            $head.append("<link type='text/css' rel='stylesheet' href='" + modules.constants.URLS.css[keys[i]] + "'/>");
        }
    };

    modules.css = module;

})(modules.jQuery);(function ($) {
    'use strict';

    var module = {};

    module.click = {
        house_state_refresh: function () {
            $.post("/house.php", {}, modules.request.proto.callbacks.success.house_state_refresh);
        },
        topbar_currency: function () {
            const type = $(this).find(">td:first").text().trim();
            modules.utils.openMarket(type.substring(0, type.length - 1));
        },
        ingredient: function () {
            modules.constants.$DOM.modal.modal_background.click();
            modules.utils.openMarket("Ingredients");
        },
        script_menu: function () {
            modules.constants.$DOM.modal.modal_title.text(GM_info.script.name + " " + GM_info.script.version);
            modules.utils.openStdModal(modules.constants.$DOM.modal.script_settings);
        },
        delegate_click: function () {
            $($(this).data("delegate-click")).click();
        }
    };

    module.change = {
        settings_notification: function () {
            const $this = $(this);
            modules.settings.settings.notifications[$this.data("notification")][$this.data("type")] = $this.is(":checked");
            modules.settings.save();
        },
        settings_feature: function () {
            const $this = $(this);
            modules.settings.settings.features[$this.data("feature")] = $this.is(":checked");
            modules.settings.save();
        }
    };

    module.mouseenter = {
        inventory_table_ingredient: function () {
            const $this = $(this),
                ingredient = $this.text().trim();

            if (typeof(modules.cache.TRADESKILL_MATS[ingredient]) === "undefined") {
                toast.error("Failed to lookup " + ingredient + ": ID not found");
            } else {
                (modules.request.create("/market.php", modules.constants.CACHE_TTL.market))
                    .post({
                        type: "ingredient",
                        page: 0,
                        q: 0,
                        ll: 0,
                        hl: 0,
                        st: modules.cache.TRADESKILL_MATS[ingredient]
                    }).done(function (r) {
                    const describedBy = $this.attr("aria-describedby"),
                        $describedBy = $("#" + describedBy);

                    if (describedBy && $describedBy.length) {
                        const analysis = modules.utils.analysePrice(r.l),
                            $tds = $describedBy.find("tr[data-id=prices]>td");

                        $tds.first().text(modules.utils.numberWithCommas(analysis.low))
                            .next().text(modules.utils.numberWithCommas(analysis.avg))
                            .next().text(modules.utils.numberWithCommas(analysis.high));
                    }
                });
            }
        }
    };

    module.each = {
        settings_notification: function () {
            const $this = $(this);

            $this.prop("checked", modules.settings.settings.notifications[$this.data("notification")][$this.data("type")]);
        },
        settings_features: function () {
            const $this = $(this);
            $this.prop("checked", modules.settings.settings.features[$this.data("feature")]);
        },
        inventory_table_ingredients: function () {
            const $this = $(this),
                ingredient = $this.text().trim(),
                $span = $('<span>' + ingredient + '</span>');
            $this.html($span);

            $span.popover({
                title: ingredient,
                html: true,
                trigger: "hover",
                container: "body",
                viewport: {"selector": "body", "padding": 0},
                placement: "auto right",
                content: modules.constants.$DOM.market.market_tooltip
            });

            $span.mouseenter(this.mouseenter.inventory_table_ingredient)
                .css("cursor", "pointer")
                .click(this.click.ingredient);
        }
    };

    modules.handlers = module;

})(modules.jQuery);(function ($) {
    'use strict';

    const Interval = function (n) {
        this.name = n;
    };

    Interval.prototype = {
        _intervals: {},
        isRunning: function () {
            return typeof(this._intervals[this.name]) !== "undefined"
        },
        clear: function () {
            if (this.isRunning()) {
                clearInterval(this._intervals[this.name]);
                delete this._intervals[this.name];
                return true;
            }

            return false;
        },
        set: function (callback, frequency) {
            this.clear();
            this._intervals[this.name] = setInterval(callback, frequency);
            return this._intervals[this.name];
        }
    };

    modules.createInterval = function (n) {
        return new Interval(n);
    };
})(modules.jQuery);(function ($) {
    'use strict';

    var module = {};

    /** Mutation observer for the currency page tooltip */
    module.currency_tooltips = new MutationObserver(
        /** @param {MutationRecord[]} records */
        function (records) {
            if (records.length && modules.constants.$DOM.currency_tooltip.colour_reference.is(":visible")) {
                const cssClass = modules.constants.$DOM.currency_tooltip.colour_reference.attr("class"),
                    marketID = cssClass.replace("crystals", "premium")
                        .replace("materials", "weapon_scraps")
                        .replace("fragments", "gem_fragments"),
                    $allTDs = modules.constants.$DOM.currency_tooltip.table_row.find(">td");

                modules.constants.$DOM.currency_tooltip.table_row.attr("class", cssClass);

                if (cssClass === "gold") {
                    $allTDs.text("N/A");
                    modules.utils.toggleVisibility(modules.constants.$AJAX_SPINNERS.currency_tooltip, false);
                } else {
                    $allTDs.text(" ");
                    modules.utils.toggleVisibility(modules.constants.$AJAX_SPINNERS.currency_tooltip, true);

                    (modules.request.create("/market.php", modules.constants.CACHE_TTL.market)).post({
                        type: "currency",
                        page: 0,
                        st: marketID
                    }).done(modules.request.proto.callbacks.success.currency_tooltip);
                }
            }
    });

        /** Makes sure the script settings modal doesn't get nasty with the other game modals */
    module.script_settings = new MutationObserver(function () {
            if (!modules.constants.$DOM.modal.script_settings.is(":visible")) {
                modules.constants.$DOM.modal.script_settings.hide();
            }
        }
    );

    module.house_status = new MutationObserver(function (records) {
        for (var i = 0; i < records.length; i++) {
            if (records[i].addedNodes.length) {
                modules.utils.handle_house_status_update(records[i].target.innerText.trim());
                break;
            }
        }
    });

    module.chat_whispers = new MutationObserver(
        /** @param {MutationRecord[]} records */
        function (records) {
            const sound_on = modules.settings.settings.notifications.all.sound && modules.settings.settings.notifications.whisper.sound;
            const gm_on = modules.settings.settings.notifications.all.gm && modules.settings.settings.notifications.whisper.gm;

            if (sound_on || gm_on) {
                for (var i = 0; i < records.length; i++) {
                    const addedNodes = records[i].addedNodes;
                    if (addedNodes.length) {
                        for (var j = 0; j < addedNodes.length; j++) {
                            const text = $(addedNodes[j]).text();
                            if (text.match(/^\[[0-9]+:[0-9]+:[0-9]+]\s*Whisper from/)) {
                                if (gm_on) {
                                    modules.utils.notification(text);
                                }
                                if (sound_on) {
                                    modules.constants.SFX.msg_ding.play();
                                }
                            }
                        }
                    }
                }
            }
        }
    );

    module.inventory_table = new MutationObserver(
        /** @param {MutationRecord[]} records */
        function (records) {
            for (var i = 0; i < records.length; i++) {
                if (records[i].addedNodes.length) {
                    for (var n = 0; n < records[i].addedNodes.length; n++) {
                        if (records[i].addedNodes[n] instanceof HTMLTableSectionElement) {
                            const $tbody = $(records[i].addedNodes[n]);

                            if ($tbody.find("th:contains(Ingredient)").length) { //Bingo!
                                $tbody.find(">tr>[data-th=Item]").each(modules.handlers.each.inventory_table_ingredients);
                            }
                            break;
                        }
                    }
                    break;
                }
            }
        }
    );

    modules.observers = module;

})(modules.jQuery);(function ($) {
    'use strict';

    var module = {};

    /**
     * Represents an AJAX request to be used with cache
     * @param {String} url The URL we're calling
     * @param {Boolean|Number} cacheTime Cache time in hours or false if the request should not be cached
     * @param {Function} [errorCallback]  A custom error callback
     * @constructor
     */
    const Request = function (url, cacheTime, errorCallback) {
        /** The URL we're calling */
        this.url = url;
        /** OnError callback */
        this.errorCallback = errorCallback || this.callbacks.error.generic;

        /**
         * How long the request should be cached for
         * @type {Boolean|Number}
         */
        this.cacheTime = cacheTime || false;
    };

    Request.prototype = {
        /** Ajax callbacks container */
        callbacks: {
            /** Successful AJAX callbacks */
            success: {
                /** Successful callback for the currency tooltip market info lookup */
                currency_tooltip: function (r) {
                    const analysis = modules.utils.analysePrice(r.l);

                    modules.utils.toggleVisibility(modules.constants.$AJAX_SPINNERS.currency_tooltip, false);
                    modules.constants.$DOM.currency_tooltip.market_low.text(modules.utils.numberWithCommas(analysis.low));
                    modules.constants.$DOM.currency_tooltip.market_avg.text(modules.utils.numberWithCommas(analysis.avg));
                    modules.constants.$DOM.currency_tooltip.market_high.text(modules.utils.numberWithCommas(analysis.high));
                },
                house_requery: function (evt, r, opts) {
                    if (opts.url.indexOf("house") !== -1 &&
                        typeof(r.responseJSON) !== "undefined" &&
                        typeof(r.responseJSON.m) !== "undefined") {
                        modules.utils.handle_house_status_update(r.responseJSON.m);
                    }
                },
                house_state_refresh: function (r) {
                    modules.utils.handle_house_status_update(r.m);
                }
            },
            /** Error callbacks */
            error: {
                /** Generic error callback */
                generic: function (xhr, textStatus, errorThrown) {
                    toast.error("[" + textStatus + "] " + xhr.responseText);
                    console.error({
                        xhr: xhr,
                        textStatus: textStatus,
                        errorThrown: errorThrown
                    });
                }
            }
        },

        /**
         * Make a GET request
         * @returns {*|jqXHR|XMLHTTPRequest|jQuery|$}
         */
        get: function () {
            return this._generic({
                method: "GET"
            });
        },

        /**
         * To be called internally to start the request
         * @param {Object} generated params generated by the get/post methods
         * @returns {jqXHR|XMLHTTPRequest|jQuery|$}
         * @private
         */
        _generic: function (generated) {
            const methodArgs = $.extend({
                url: this.url,
                error: this.errorCallback
            }, generated || {});

            if (this.cacheTime !== false && !isNaN(this.cacheTime)) {
                methodArgs.cacheTTL = this.cacheTime;
                methodArgs.localCache = window.sessionStorage;
            }

            return $.ajax(this.url, methodArgs);
        },

        /**
         * Make a POST request
         * @param {Object} data Post params
         * @returns {*|jqXHR|XMLHTTPRequest|jQuery|$}
         */
        post: function (data) {
            return this._generic({
                method: "POST",
                data: data
            });
        }
    };

    module.create = function (url, cacheTime, errorCallback) {
        return new Request(url, cacheTime, errorCallback);
    };

    module.proto = Request.prototype;

    modules.request = module;

})(modules.jQuery);(function($) {
    'use strict';

    const SettingsHandler = function () {
        /** @type SettingsHandler.defaults */
        this.settings = this.defaults;
        this.load();
    };

    SettingsHandler.prototype = {
        /** Default settings */
        defaults: {
            /**
             * Notification settings.
             * sound: [bool] Whether to play a sound
             * gm: [bool] Whether to show the Greasemonkey notification
             */
            notifications: {
                /** Global overrides */
                all: {
                    sound: false,
                    gm: false
                },
                /** Whisper notifcations */
                whisper: {
                    sound: true,
                    gm: true
                },
                construction: {
                    sound: true,
                    gm: true
                }
            },
            features: {
                house_timer: true
            }
        },

        save: function () {
            GM_setValue("settings", JSON.stringify(this.settings));
        },

        load: function () {
            this.settings = $.extend(true, this.defaults, JSON.parse(GM_getValue("settings") || "{}"));
        }
    };

    modules.settings = new SettingsHandler();

})(modules.jQuery);(function ($) {
    'use strict';

    var enabled = false;
    var useChromeNotifications = false;

    var module = {};

    function sendToast(type, msg) {
        if(!enabled) {
            return;
        }

        if(useChromeNotifications) {
            new Notification('Relics of Avabur', {
                body: "msg",
            });
        } else {
            $().toastmessage(type, msg);
        }
    }

    module.error = function (msg) {
        console.error(msg);
        sendToast('showErrorToast', msg);
    };

    module.notice = function (msg) {
        sendToast('showNoticeToast', msg);
    };

    module.success = function (msg) {
        sendToast('showSuccessToast', msg);
    };

    module.warn = function (msg) {
        console.warn(msg);
        sendToast('showWarningToast', msg);
    };

    module.incompatibility = function (what) {
        $().toastmessage('showToast', {
            text: "Your browser does not support " + what +
            ". Please <a href='https://www.google.co.uk/chrome/browser/desktop/' target='_blank'>" +
            "Download the latest version of Google Chrome</a>",
            sticky: true,
            position: 'top-center',
            type: 'error'
        });
    };

    module.enable = function () {
        if (Notification.permission !== "granted")
            Notification.requestPermission();
    };

    modules.toast = module;

})(modules.jQuery);(function ($) {
    'use strict';

    var module = {};

    var questNoticeOn = false, numBattles = 0, numRounds = 0, numAttacks = 0, numMulti = 0, numHits = 0, numMisses = 0,
        numUntrackedHits = 0, numCrits = 0, numUntrackedCrits = 0, numCounters = 0, numSpells = 0,
        numHeals = 0, numHealableRounds = 0, numEvade = 0, numAttacksTaken = 0,
        hitTot = 0, hitMax = 0, hitMin = 999999999, hitAvg = 0,
        critTot = 0, critMax = 0, critMin = 999999999, critAvg = 0,
        spellTot = 0, spellMax = 0, spellMin = 999999999, spellAvg = 0,
        counterTot = 0, counterMax = 0, counterMin = 999999999, counterAvg = 0,
        healTot = 0, healMax = 0, healMin = 999999999, healAvg = 0;

    function addTimeCounter() {
        $('#battleGains').find('td').first().removeAttr('colspan').after('<td class="timeCounter" title="' + Date.now() + '"><span class="timeCounterHr">00</span>:<span class="timeCounterMin">00</span>:<span class="timeCounterSec">00</span></td>');
        $('#tradeskillGains').find('td').first().removeAttr('colspan').after('<td class="timeCounter" title="' + Date.now() + '"><span class="timeCounterHr">00</span>:<span class="timeCounterMin">00</span>:<span class="timeCounterSec">00</span></td>');
        $('#gainsXP').parent().after('<tr class="hidden-xs hidden-sm visible-md visible-lg" style="color: #' + modules.constants.perHourColor + '; font-size: ' + modules.constants.perHourSize+ 'px"></td><td id="xpPerHr" colspan="2" style="text-align: center;"></td></tr>');
        $('#gainsGold').parent().after('<tr class="hidden-xs hidden-sm visible-md visible-lg" style="color: #' + modules.constants.perHourColor + '; font-size: ' + modules.constants.perHourSize+ 'px"><td id="goldPerHr" colspan="2" style="text-align: center;"></td></tr>');
        $('#gainsClanXP').parent().after('<tr class="hidden-xs hidden-sm visible-md visible-lg" style="color: #' + modules.constants.perHourColor + '; font-size: ' + modules.constants.perHourSize+ 'px"><td id="clanXpPerHr" colspan="2" style="text-align: center;"></td></tr>');
        $('#gainsClanGold').parent().after('<tr class="hidden-xs hidden-sm visible-md visible-lg" style="color: #' + modules.constants.perHourColor + '; font-size: ' + modules.constants.perHourSize+ 'px"><td id="clanGoldPerHr" colspan="2" style="text-align: center;"></td></tr>');
        $('#gainsResources').parent().after('<tr class="visible-xs-inline-block visible-sm-inline-block visible-md visible-lg" style="color: #' + modules.constants.perHourColor + '; font-size: ' + modules.constants.perHourSize+ 'px"><td id="resPerHr" colspan="2" style="text-align: center;"></td></tr>');
        $('#gainsClanResources').parent().after('<tr class="visible-xs-inline-block visible-sm-inline-block visible-md visible-lg" style="color: #' + modules.constants.perHourColor + '; font-size: ' + modules.constants.perHourSize+ 'px"><td id="clanResPerHr" colspan="2" style="text-align: center;"></td></tr>');
    }

    function addBattleTracker() {
        // Add wrapper for the battle tracker
        $('#modalWrapper').after('<div id="battleTrackerWrapper" style="width: 450px;" class="container ui-element border2 ui-draggable customWindowWrapper"><div class="row"><h4 id="battleTrackerTitle" class="center toprounder ui-draggable-handle">Battle Tracker</h4><span id="closeBattleTracker" class="closeCustomWindow"><a>�</a></span><div class="customWindowContent"><table><thead><tr><th colspan="3">Battles: <span id="battleTrackerBattles"></span></th><th colspan="3">Rounds: <span id="battleTrackerRounds"></span></th></tr></thead><tbody><tr><th>Action</th><th style="border-right: none;">Count/Max</th><th style="border-left: none;">Percent</th><th style="border-right: none;">Min</th><th style="border-right: none; border-left: none;">Max</th><th style="border-left: none;">Average</th></tr><tr><td class="bRight">Hit</td><td id="battleTrackerHitCnt"></td><td id="battleTrackerHitPerc" class="bRight"></td><td id="battleTrackerHitMin"></td><td id="battleTrackerHitMax"></td><td id="battleTrackerHitAvg"></td></tr><tr><td class="bRight">Crit</td><td id="battleTrackerCritCnt"></td><td id="battleTrackerCritPerc" class="bRight"></td><td id="battleTrackerCritMin"></td><td id="battleTrackerCritMax"></td><td id="battleTrackerCritAvg"></td></tr><tr><td class="bRight">Spell</td><td id="battleTrackerSpellCnt"></td><td id="battleTrackerSpellPerc" class="bRight"></td><td id="battleTrackerSpellMin"></td><td id="battleTrackerSpellMax"></td><td id="battleTrackerSpellAvg"></td></tr><tr><td class="bRight">Counter</td><td id="battleTrackerCounterCnt"></td><td id="battleTrackerCounterPerc" class="bRight"></td><td id="battleTrackerCounterMin"></td><td id="battleTrackerCounterMax"></td><td id="battleTrackerCounterAvg"></td></tr><tr><td class="bRight">Heal</td><td id="battleTrackerHealCnt"></td><td id="battleTrackerHealPerc" class="bRight"></td><td id="battleTrackerHealMin"></td><td id="battleTrackerHealMax"></td><td id="battleTrackerHealAvg"></td></tr><tr><td class="bRight">Multistrike</td><td id="battleTrackerMultiCnt"></td><td id="battleTrackerMultiPerc" class="bRight"></td><td colspan="3"></td></tr><tr><tr><td class="bRight">Evade</td><td id="battleTrackerEvadeCnt"></td><td id="battleTrackerEvadePerc" class="bRight"></td><td colspan="3"></td></tr></tbody></table></div></div></div>');

        // Make it a draggable and resizable window
        $('#battleTrackerWrapper').draggable({ handle: '#battleTrackerTitle' }).resizable({ minHeight: 201, minWidth: 350 });

        // Enable the close button on the battle tracker window
        $('#closeBattleTracker').on('click', function(e) {
            e.preventDefault();
            $('#battleTrackerWrapper').fadeOut('medium');
        });

        // Replace the Battle Stats label with one that opens the battle tracker window.
        $('#battleGains>h5').before('<a style="text-decoration: none;" onclick="$(\'#battleTrackerWrapper\').fadeIn(\'medium\');"><h5 class="toprounder center">Battle Stats</h5></a>').remove();
    }

    function addDropTracker(){
        // Add tracker content to the modal list
        $('#modalWrapper').after('<div id="dropsTrackerWrapper" style="width: 450px;" class="container ui-element border2 ui-draggable customWindowWrapper"><div class="row"><h4 id="dropsTrackerTitle" class="center toprounder ui-draggable-handle">Drop Tracker</h4><span id="closeDropsTracker" class="closeCustomWindow"><a>�</a></span><div class="customWindowContent"><table id="dropsTable"><thead><tr id="dropsTableTimer"><th class="bRight" style="max-width: 95px;">Categories</th><th colspan="2" class="bRight">Kills: <span class="numKills">0</span></th><th colspan="2" class="bRight">Harvests: <span class="numHarvests">0</span></th><th class="timeCounter" title="' + Date.now() + '" style="max-width: 80px;"><span class="timeCounterHr">00</span>:<span class="timeCounterMin">00</span>:<span class="timeCounterSec">00</span></th></tr></thead><tbody><tr><td class="bRight">Stats</td><td class="numStatsK">0</td><td class="bRight"><span class="percent" data-n="numStatsK" data-d="numKills">0.00</span> %</td><td class="numStatsH">0</td><td class="bRight"><span class="percent" data-n="numStatsH" data-d="numHarvests">0.00</span> %</td><td id="statsPerHr"></td></tr><tr><td class="bRight">Loot</td><td class="numLootK">0</td><td class="bRight"><span class="percent" data-n="numLootK" data-d="numKills">0.00</span> %</td><td class="numLootH">0</td><td class="bRight"><span class="percent" data-n="numLootH" data-d="numHarvests">0.00</span> %</td><td id="lootPerHr"></td></tr><tr><td class="bRight">Ingredients</td><td class="numIngredientsK">0</td><td class="bRight"><span class="percent" data-n="numIngredientsK" data-d="numKills">0.00</span> %</td><td class="numIngredientsH">0</td><td class="bRight"><span class="percent" data-n="numIngredientsH" data-d="numHarvests">0.00</span> %</td><td id="ingredientsPerHr"></td></tr></tbody><thead><tr><th class="bRight">Stats</th><th colspan="2" class="bRight">K Stats: <span class="numStatsK">0</span></th><th colspan="2" class="bRight">H Stats: <span class="numStatsH">0</span></th><td><a id="resetDropTable">Reset</a></td></tr></thead><tbody><tr><td class="bRight">Strength</td><td class="strK">0</td><td class="bRight"><span class="percent" data-n="strK" data-d="numStatsK">0.00</span> %</td><td class="strH">0</td><td class="bRight"><span class="percent" data-n="strH" data-d="numStatsH">0.00</span> %</td></tr><tr><td class="bRight">Health</td><td class="heaK">0</td><td class="bRight"><span class="percent" data-n="heaK" data-d="numStatsK">0.00</span> %</td><td class="heaH">0</td><td class="bRight"><span class="percent" data-n="heaH" data-d="numStatsH">0.00</span> %</td></tr><tr><td class="bRight">Coordination</td><td class="coordK">0</td><td class="bRight"><span class="percent" data-n="coordK" data-d="numStatsK">0.00</span> %</td><td class="coordH">0</td><td class="bRight"><span class="percent" data-n="coordH" data-d="numStatsH">0.00</span> %</td></tr><tr><td class="bRight">Agility</td><td class="agiK">0</td><td class="bRight"><span class="percent" data-n="agiK" data-d="numStatsK">0.00</span> %</td><td class="agiH">0</td><td class="bRight"><span class="percent" data-n="agiH" data-d="numStatsH">0.00</span> %</td></tr><tr><td class="bRight">Counter</td><td class="counterK">0</td><td class="bRight"><span class="percent" data-n="counterK" data-d="numStatsK">0.00</span> %</td><td></td><td class="bRight"></td></tr><tr><td class="bRight">Healing</td><td class="healingK">0</td><td class="bRight"><span class="percent" data-n="healingK" data-d="numStatsK">0.00</span> %</td><td></td><td class="bRight"></td></tr><tr><td class="bRight">Weapon</td><td class="weaponK">0</td><td class="bRight"><span class="percent" data-n="weaponK" data-d="numStatsK">0.00</span> %</td><td></td><td class="bRight"></td></tr><tr><td class="bRight">Evasion</td><td class="evasionK">0</td><td class="bRight"><span class="percent" data-n="evasionK" data-d="numStatsK">0.00</span> %</td><td></td><td class="bRight"></td></tr></tbody><thead><tr><th class="bRight">Loot</th><th colspan="2" class="bRight">K Loot: <span class="numLootK">0</span></th><th colspan="2" class="bRight">H Loot: <span class="numLootH">0</span></th></tr></thead><tbody><tr><td class="bRight">Gear & Gems</td><td class="gearK">0</td><td class="bRight"><span class="percent" data-n="gearK" data-d="numLootK">0.00</span> %</td><td class="gearH">0</td><td class="bRight"><span class="percent" data-n="gearH" data-d="numLootH">0.00</span> %</td></tr><tr><td class="bRight">Gold</td><td class="goldK">0</td><td class="bRight"><span class="percent" data-n="goldK" data-d="numLootK">0.00</span> %</td><td class="goldH">0</td><td class="bRight"><span class="percent" data-n="goldH" data-d="numLootH">0.00</span> %</td></tr><tr><td class="bRight">Platinum</td><td class="platK">0</td><td class="bRight"><span class="percent" data-n="platK" data-d="numLootK">0.00</span> %</td><td class="platH">0</td><td class="bRight"><span class="percent" data-n="platH" data-d="numLootH">0.00</span> %</td></tr><tr><td class="bRight">Crafting Mats</td><td class="craftK">0</td><td class="bRight"><span class="percent" data-n="craftK" data-d="numLootK">0.00</span> %</td><td class="craftH">0</td><td class="bRight"><span class="percent" data-n="craftH" data-d="numLootH">0.00</span> %</td></tr><tr><td class="bRight">Gem Fragment</td><td class="fragK">0</td><td class="bRight"><span class="percent" data-n="fragK" data-d="numLootK">0.00</span> %</td><td class="fragH">0</td><td class="bRight"><span class="percent" data-n="fragH" data-d="numLootH">0.00</span> %</td></tr><tr><td class="bRight">Crystals (lol)</td><td class="crystalK">0</td><td class="bRight"><span class="percent" data-n="crystalK" data-d="numLootK">0.00</span> %</td><td class="crystalH">0</td><td class="bRight"><span class="percent" data-n="crystalH" data-d="numLootH">0.00</span> %</td></tr></tbody></table></div></div></div>');
        $('#resetDropTable').on('click', function() {
            $('#dropsTableTimer .timeCounter').attr('title',Date.now()); $('#dropsTableTimer .timeCounter>span').text('00');
            $('.numKills, .numHarvests, .numStatsK, .numStatsH, .numLootK, .numLootH, .numIngredientsK, .numIngredientsH, .strK, .strH, .heaK, .heaH, .coordK, .coordH, .agiK, .agiH, .counterK, .healingK, .weaponK, .evasionK, .gearK, .gearH, .goldK, .goldH, .platK, .platH, .craftK, .craftH, .fragK, .fragH, .crystalK, .crystalH').text('0');
            $('.percent').text('0.00');
        });

        // Make it a draggable and resizable window
        $('#dropsTrackerWrapper').draggable({ handle: '#dropsTrackerTitle' }).resizable({ minHeight: 397, minWidth: 350 });

        // Enable the close button on the battle tracker window
        $('#closeDropsTracker').on('click', function(e) {
            e.preventDefault();
            $('#dropsTrackerWrapper').fadeOut('medium');
        });

        // Replace the Recent Activity label with one that opens the drop tracker window.
        $('#activityWrapper>h5').before('<a style="text-decoration: none;" onclick="$(\'#dropsTrackerWrapper\').fadeIn(\'medium\');"><h5 class="center toprounder">Recent Activity</h5></a>').remove();
    }

    function addIngredientTracker() {
        // Add wrapper for the ingredient tracker
        $('#modalWrapper').after('<div id="ingredientTrackerWrapper" style="width: 300px" class="container ui-element border2 ui-draggable customWindowWrapper"><div class="row"><h4 id="ingredientTrackerTitle" class="center toprounder ui-draggable-handle">Ingredient Tracker</h4><span id="closeIngredientTracker" class="closeCustomWindow"><a>�</a></span><div class="customWindowContent"><div id="ingredientTrackerContentWrapper" style="height: 250px;"><table><thead><tr><th>Ingredient</th><th>Enemy / Tool</th></tr></thead><tbody id="ingredientDropList">' + loadIngredientDropList() + '</tbody></table></div></div></div></div>');

        // Make it a draggable and resizable window
        $('#ingredientTrackerWrapper').draggable({ handle: '#ingredientTrackerTitle' }).resizable({ minHeight: 200, minWidth: 300, resize: function(e, ui) {$('#ingredientTrackerContentWrapper').height($('#ingredientTrackerWrapper').height() - $('#ingredientTrackerTitle').outerHeight(true) - 10);} });

        // Enable the close button on the ingredient tracker window
        $('#closeIngredientTracker').on('click', function(e) {
            e.preventDefault();
            $('#ingredientTrackerWrapper').fadeOut('medium');
        });

        $('#ingredientTrackerContentWrapper').mCustomScrollbar();

        // Replace the Ingredient Stats label with one that opens the ingredient tracker window.
        $('#clearLootGains').after('<a style="float: right; margin-right: 15px; text-decoration: none;" onclick="$(\'#ingredientTrackerWrapper\').fadeIn(\'medium\');">Ingredient Tracker</a>');
    }

    function timeCounter() {
        if(modules.constants.ENABLE_XP_GOLD_RESOURCE_PER_HOUR) {
            var diffSec = Math.round((Date.now() - Number($('#battleGains .timeCounter').first().attr('title'))) / 1000);

            var xpHourValue = Math.floor(Number($('#gainsXP').attr('data-value'))/(diffSec / 3600));
            var xpCurrent = modules.utils.getElementIntValue("currentXP");
            var xpRequired = modules.utils.getElementIntValue("levelCost");
            var ttl = ((xpRequired - xpCurrent) / xpHourValue).toFixed(2);
            var ttlh = Math.floor(ttl);
            var ttlm = Math.floor((ttl % 1).toFixed(2) * 60);

            $('#battleGains .timeCounterHr, #tradeskillGains .timeCounterHr').text(('0' + Math.floor(diffSec / 3600)).slice(-2));
            $('#battleGains .timeCounterMin, #tradeskillGains .timeCounterMin').text(('0' + Math.floor(diffSec / 60) % 60).slice(-2));
            $('#battleGains .timeCounterSec, #tradeskillGains .timeCounterSec').text(('0' + diffSec % 60).slice(-2));
            $('#xpPerHr').text(xpHourValue.toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",") + " / Hr (TTL: " + ttlh + "h " + ttlm + "m)");
            $('#clanXpPerHr').text(Math.floor(Number($('#gainsClanXP').attr('data-value'))/(diffSec / 3600)).toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",") + " / Hr");
            $('#goldPerHr').text(Math.floor(Number($('#gainsGold').attr('data-value'))/(diffSec / 3600)).toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",") + " / Hr");
            $('#clanGoldPerHr').text(Math.floor(Number($('#gainsClanGold').attr('data-value'))/(diffSec / 3600)).toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",") + " / Hr");
            $('#resPerHr').text(Math.floor(Number($('#gainsResources').attr('data-value'))/(diffSec / 3600)).toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",") + " / Hr");
            $('#clanResPerHr').text(Math.floor(Number($('#gainsClanResources').attr('data-value'))/(diffSec/3600)).toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",") + " / Hr");
        }
        if(modules.constants.ENABLE_DROP_TRACKER) {
            var diffSec = Math.round((Date.now() - Number($('#dropsTableTimer .timeCounter').first().attr('title'))) / 1000);
            $('#dropsTableTimer .timeCounterHr').text(('0' + Math.floor(diffSec / 3600)).slice(-2));
            $('#dropsTableTimer .timeCounterMin').text(('0' + Math.floor(diffSec / 60) % 60).slice(-2));
            $('#dropsTableTimer .timeCounterSec').text(('0' + diffSec % 60).slice(-2));
            $('#statsPerHr').text(Math.floor((Number($('.numStatsK').first().text()) + Number($('.numStatsH').first().text())) / (diffSec / 3600)).toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",") + " / Hr");
            $('#lootPerHr').text(Math.floor((Number($('.numLootK').first().text()) + Number($('.numLootH').first().text())) / (diffSec / 3600)).toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",") + " / Hr");
            $('#ingredientsPerHr').text(Math.floor((Number($('.numIngredientsK').first().text()) + Number($('.numIngredientsH').first().text())) / (diffSec / 3600)).toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",") + " / Hr");
        }
    }

    function parseBoostsPhp(data) {
        $('#permanentBoostWrapper>div:eq(5)').find('input.boost_count').val();
        var curReduced = 100 - 100 / (1 + data.boosts[4].tv / 100);
        var nxtReduced = 100 - 100 / (1 + (data.boosts[4].tv + 1) / 100);
        $('#questBoostInfo').remove();
        $('#permanentBoostWrapper>div:eq(5)>div:eq(1)').find('div.boost_unmaxed').before('<span id="questBoostInfo" style="position: absolute;left: 0;">Cur: (' + curReduced.toFixed(2) + '%)<br />Nxt: (' + nxtReduced.toFixed(2) + '%)</span>');
    }

    function parseAutobattlePhp(battle) {
        if(battle == null || battle.b == null)
        {
            return;
        }

        if(modules.constants.ENABLE_QUEST_COMPLETE_NOTICE && battle.b.qf != null && battle.b.qf.indexOf("You have completed your quest!  Visit the") > -1)
            fadeOutNonQuest();
        else if(questNoticeOn)
            fadeInNonQuest();

        // An ingredient has dropped for Ingredient Tracker
        if(battle.b.ir && modules.constants.ENABLE_INGREDIENT_TRACKER) {
            if(typeof Storage !== "undefined") {
                if(!localStorage.LocDrops)
                    localStorage.LocDrops = "{}";
                var item = (battle.b.ir).replace(/\+|<.*?>/img, "");
                var enemy = battle.b.m.n;
                var drops = JSON.parse(localStorage.LocDrops);
                if(drops[item] === undefined)
                    drops[item] = {};
                drops[item][enemy] = "";
                localStorage.LocDrops = JSON.stringify(drops);
            }
            else
                console.log("No Web Storage support to track drops.");
            $('#ingredientDropList').html(loadIngredientDropList());
        }

        // Battle was won and Drop Tracker enabled
        if(battle.b.r && modules.constants.ENABLE_DROP_TRACKER) {
            incrementCell('numKills');

            // This means an ingredient has dropped
            if(battle.b.ir)
                incrementCell('numIngredientsK');

            // This means a stat has dropped
            if(battle.b.sr) {
                incrementCell('numStatsK');
                var id = "";
                switch(/.*?>(.*?)</im.exec(battle.b.sr)[1]) {
                    case 'strength': id = 'strK'; break;
                    case 'health': id = 'heaK'; break;
                    case 'coordination': id = 'coordK'; break;
                    case 'agility': id = 'agiK'; break;
                    case 'counter attacking':
                    case 'counter attack': id = 'counterK'; break;
                    case 'healing': id = 'healingK'; break;
                    case 'evasion': id = 'evasionK'; break;
                    case 'unarmed combat':
                    case 'melee weapons':
                    case 'ranged weapons':
                    case 'magical weapons': id = 'weaponK';
                }
                incrementCell(id);
            }

            // This means loot has dropped
            if(battle.b.dr) {
                incrementCell('numLootK');
                var id = "";
                switch(/(Tooltip).*?>|>.*?(platinum coin|gold coin|crafting|gem frag|crystal).*?</.exec(battle.b.dr).splice(1,2).join("")) {
                    case 'Tooltip': id = "gearK"; break;
                    case 'platinum coin': id = "platK"; break;
                    case 'gold coin': id = "goldK"; break;
                    case 'crafting': id = "craftK"; break;
                    case 'gem frag': id = "fragK"; break;
                    case 'crystal': id = "crystalK";
                }
                incrementCell(id);
            }
            calcPercentCells();
        }

        // Everything after this is for the Battle Tracker
        // Also, we cannot track combat if round-by-round option is not on.
        if(battle.b.bt === null || !modules.constants.ENABLE_BATTLE_TRACKER)
            return;

        numBattles ++;
        numRounds += battle.b.ro;
        numAttacksTaken += battle.b.p.d + battle.b.m.h;

        numCounters += battle.b.p.ca;
        counterTot += battle.b.p.cd;
        counterAvg = (counterTot / numCounters).toFixed(0);
        numSpells += battle.b.p.sc;
        spellTot += battle.b.p.sd;
        spellAvg = (spellTot / numSpells).toFixed(0);
        numHeals += battle.b.p.hep;
        healTot += battle.b.p.he;
        healAvg = (healTot / numHeals).toFixed(0);
        numEvade += battle.b.p.d;

        var takenDamage = false;
        // Loop through the actions.
        for (var i = 0; i < battle.b.bt.length; i++) {
            var act = battle.b.bt[i];
            if(act.npc === null)
                if(act.type == "heal") {
                    healMax = Math.max(healMax, act.dmg);
                    healMin = Math.min(healMin, act.dmg);
                }
                else if(act.type == "counter") {
                    counterMax = Math.max(counterMax, act.dmg);
                    counterMin = Math.min(counterMin, act.dmg);
                }
                else if(act.type == "spell") {
                    spellMax = Math.max(spellMax, act.dmg);
                    spellMin = Math.min(spellMin, act.dmg);
                }
                else if(act.type == "hit") {
                    // Track other variables
                    numAttacks += act.hits + act.misses;
                    numHits += act.hits;
                    numMisses += act.misses;
                    numCrits += act.crit;
                    if(act.hits + act.misses > 1) {
                        numMulti += act.hits + act.misses - 1;
                        // If all attacks in multi are crit, add to crit total. Min/Max not tracked across multistrike.
                        if(act.hits == act.crit)
                            critTot += act.dmg;
                        // If no attacks in multi are crit, add to hit total. Min/Max not tracked across multistrike.
                        else if(!act.crit)
                            hitTot += act.dmg;
                        // If some attacks in multi are crit but not all, we cannot track totals properly so tally up untracked hits to get a proper average.
                        else {
                            numUntrackedHits += act.hits;
                            numUntrackedCrits += act.crit;
                        }
                    }
                    else if(act.crit) {
                        critTot += act.dmg;
                        critMax = Math.max(critMax, act.dmg);
                        critMin = Math.min(critMin, act.dmg);
                        critAvg = (critTot / (numCrits - numUntrackedCrits)).toFixed(0);
                    }
                    else {
                        hitTot += act.dmg;
                        hitMax = Math.max(hitMax, act.dmg);
                        if(act.dmg)
                            hitMin = Math.min(hitMin, act.dmg);
                        hitAvg = (hitTot / (numHits - numCrits - numUntrackedHits + numUntrackedCrits)).toFixed(0);
                    }
                }
                else
                    console.log("Unknown player attack type: " + act.type + ": " + xhr.responseText);
            else
            if(act.type == "hit") {
                if(act.hits && act.dmg)
                    takenDamage = true;
                if(takenDamage)
                    numHealableRounds ++;
            }
            else
                console.log("Unknown enemy attack type: " + act.type + ": " + xhr.responseText);
        }
        if(!battle.b.r)
            numHealableRounds --;

        // Update the table in the battle tracker window
        $('#battleTrackerBattles').text(numBattles);
        $('#battleTrackerRounds').text(numRounds);
        $('#battleTrackerHitCnt').text(numHits + ' / ' + numAttacks);
        $('#battleTrackerHitPerc').text((numHits * 100 / numAttacks).toFixed(2) + " %");
        if(numHits) {
            $('#battleTrackerHitMin').text(hitMin);
            $('#battleTrackerHitMax').text(hitMax);
            $('#battleTrackerHitAvg').text(hitAvg);
        }
        $('#battleTrackerCritCnt').text(numCrits + ' / ' + numHits);
        $('#battleTrackerCritPerc').text((numCrits * 100 / numHits).toFixed(2) + " %");
        if(numCrits) {
            $('#battleTrackerCritMin').text(critMin);
            $('#battleTrackerCritMax').text(critMax);
            $('#battleTrackerCritAvg').text(critAvg);
        }
        $('#battleTrackerSpellCnt').text(numSpells + ' / ' + numHits);
        $('#battleTrackerSpellPerc').text((numSpells * 100 / numHits).toFixed(2) + " %");
        if(numSpells) {
            $('#battleTrackerSpellMin').text(spellMin);
            $('#battleTrackerSpellMax').text(spellMax);
            $('#battleTrackerSpellAvg').text(spellAvg);
        }
        $('#battleTrackerCounterCnt').text(numCounters + ' / ' + numAttacksTaken);
        $('#battleTrackerCounterPerc').text((numCounters * 100 / numAttacksTaken).toFixed(2) + " %");
        if(numCounters) {
            $('#battleTrackerCounterMin').text(counterMin);
            $('#battleTrackerCounterMax').text(counterMax);
            $('#battleTrackerCounterAvg').text(counterAvg);
        }
        $('#battleTrackerHealCnt').text(numHeals + ' / ' + numHealableRounds);
        $('#battleTrackerHealPerc').text((numHeals * 100 / numHealableRounds).toFixed(2) + " %");
        if(numHeals) {
            $('#battleTrackerHealMin').text(healMin);
            $('#battleTrackerHealMax').text(healMax);
            $('#battleTrackerHealAvg').text(healAvg);
        }
        $('#battleTrackerMultiCnt').text(numMulti + ' / ' + numRounds);
        $('#battleTrackerMultiPerc').text((numMulti * 100 / numRounds).toFixed(2) + " %");
        $('#battleTrackerEvadeCnt').text(numEvade + ' / ' + numAttacksTaken);
        $('#battleTrackerEvadePerc').text((numEvade * 100 / numAttacksTaken).toFixed(2) + " %");
    }

    function parseAutoTradePhp(harvest) {
        if(modules.constants.ENABLE_QUEST_COMPLETE_NOTICE && harvest.a.qf.indexOf("You have completed your quest!  Visit the") > -1)
            fadeOutNonQuest();
        else if(questNoticeOn)
            fadeInNonQuest();

        // Track Location Drops
        if(modules.constants.ENABLE_INGREDIENT_TRACKER) {
            if(harvest.a.ir) {
                var item = (harvest.a.ir).replace(/\+|<.*?>/img, "");
                var tool = harvest.a.t;
                if(typeof Storage !== "undefined") {
                    if(!localStorage.LocDrops)
                        localStorage.LocDrops = "{}";
                    var drops = JSON.parse(localStorage.LocDrops);
                    if(drops[item] === undefined)
                        drops[item] = {};
                    drops[item][tool] = "";
                    localStorage.LocDrops = JSON.stringify(drops);
                }
                else
                    console.log("No Web Storage support to track drops.");
                $('#ingredientDropList').html(loadIngredientDropList());
            }
        }

        // Drop Tracker enabled
        if(modules.constants.ENABLE_DROP_TRACKER) {
            incrementCell('numHarvests');

            // This means an ingredient has dropped
            if(harvest.a.ir)
                incrementCell('numIngredientsH');

            // This means a stat has dropped
            if(harvest.a.sr) {
                incrementCell('numStatsH');
                var id = "";
                switch(/\+.*?>(.*?)</im.exec(harvest.a.sr)[1]) {
                    case 'strength': id = 'strH'; break;
                    case 'health': id = 'heaH'; break;
                    case 'coordination': id = 'coordH'; break;
                    case 'agility': id = 'agiH'; break;
                    default: console.log('Unknown Harvest Stat Drop: ' + harvest.a.sr);
                }
                incrementCell(id);
            }

            // This means loot has dropped
            if(harvest.a.dr) {
                incrementCell('numLootH');
                var id = "";
                switch(/(Tooltip).*?>|>.*?(platinum coin|gold coin|crafting|gem frag|crystal).*?</.exec(harvest.a.dr).splice(1,2).join("")) {
                    case 'Tooltip': id = "gearH"; break;
                    case 'platinum coin': id = "platH"; break;
                    case 'gold coin': id = "goldH"; break;
                    case 'crafting': id = "craftH"; break;
                    case 'gem frag': id = "fragH"; break;
                    case 'crystal': id = "crystalH";
                    default: console.log('Unknown Harvest Loot Drop: ' + harvest.a.dr);
                }
                incrementCell(id);
            }
            calcPercentCells();
        }
    }

    function parseResetSessionStatsPhp() {
        $('#battleGains .timeCounter, #tradeskillGains .timeCounter').attr('title',Date.now());
        $('#battleGains .timeCounter>span, #tradeskillGains .timeCounter>span').text('00');
    }

    function incrementCell(id) {
        $('.' + id).text(parseInt($('.' + id).first().text())+1);
    }

    function calcPercentCells() {
        $('.percent').each(function(){
            var idN = parseInt($('.' + $(this).attr('data-n')).first().text());
            var idD = parseInt($('.' + $(this).attr('data-d')).first().text());
            if(idD != 0)
                $(this).text((idN * 100 / idD).toFixed(2));
        });
    }

    function loadIngredientDropList() {
        var dropList = "";
        if(!localStorage.LocDrops || localStorage.LocDrops == "{}")
            return "";
        var drops = JSON.parse(localStorage.LocDrops);
        for (var drop in drops) {
            dropList += '<tr><td rowspan="' + Object.keys(drops[drop]).length + '">' + drop + '</td>';
            for(var enemy in drops[drop])
                dropList += "<td>" + enemy + "</td></tr><tr>";
            dropList = dropList.slice(0, -4);
        }
        return dropList;
    }

    function fadeOutNonQuest() {
        $('#header, #bottomWrapper, #footer, #navigationWrapper, #contentWrapper, #chatWrapper, #wrapper>div.row>div:not(:first-child)').fadeTo('opacity', 0.2);
        questNoticeOn = true;
    }

    function fadeInNonQuest() {
        $('#header, #bottomWrapper, #footer, #navigationWrapper, #contentWrapper, #chatWrapper, #wrapper>div.row>div:not(:first-child)').fadeTo('opacity', 1, function() { $(this).css('opacity', ''); });
        questNoticeOn = false;
    }

    function initialize() {
        if(modules.constants.ENABLE_XP_GOLD_RESOURCE_PER_HOUR)
            addTimeCounter();
        if(modules.constants.ENABLE_BATTLE_TRACKER)
            addBattleTracker();
        if(modules.constants.ENABLE_INGREDIENT_TRACKER)
            addIngredientTracker();
        if(modules.constants.ENABLE_DROP_TRACKER)
            addDropTracker();
        if(modules.constants.ENABLE_XP_GOLD_RESOURCE_PER_HOUR || modules.constants.ENABLE_DROP_TRACKER) {
            timeCounter();
            setInterval(timeCounter, 1000);
        }
    }

    module.enable = function() {
        initialize();

        // THIS SECTION IS RUN EVERY TIME THE BROWSER RECEIVES A DYNAMIC UPDATE USING AJAX
        $( document ).ajaxComplete(function( event, xhr, settings ) {
            if (settings.url == "autobattle.php" && (modules.constants.ENABLE_BATTLE_TRACKER || modules.constants.ENABLE_INGREDIENT_TRACKER))
                parseAutobattlePhp(JSON.parse(xhr.responseText));
            else if (settings.url == "autotrade.php" && modules.constants.ENABLE_INGREDIENT_TRACKER)
                parseAutoTradePhp(JSON.parse(xhr.responseText));
            else if (settings.url == "reset_session_stats.php" && modules.constants.ENABLE_XP_GOLD_RESOURCE_PER_HOUR)
                parseResetSessionStatsPhp();
            else if (settings.url == "boosts.php")
                parseBoostsPhp(JSON.parse(xhr.responseText));
        });
    };

    modules.trackers = module;

})(modules.jQuery);(function($) {
    'use strict';

    var module = {};

    module.parseTimeStringLong = function (str) {
        var time = 0;
        const match = str.match(/([0-9]+\s+(hours?|minutes?|seconds?))/g);

        for (var i = 0; i < match.length; i++) {
            const currentMatch = match[i].toLowerCase();
            const number = currentMatch.match(/[0-9]+/);
            var multiplier;
            if (currentMatch.indexOf("hour") !== -1) {
                multiplier = 3600000;
            } else if (currentMatch.indexOf("minute") !== -1) {
                multiplier = 60000;
            } else {
                multiplier = 1000;
            }

            time += parseInt(number) * multiplier;
        }

        return time;
    };

    module.svg = function ($this, url) {
        $this.html('<img src="' + modules.constants.URLS.img.ajax_loader + '" alt="Loading"/>');
        $.get(url).done(function (r) {
            $this.html($(r).find("svg"));
        });
        return $this;
    };

    module.house_status_update_end = function (interval) {
        interval.clear();
        modules.constants.$DOM.house_monitor.status.addClass("avi-highlight").html(
            $('<span data-delegate-click="#header_house" style="cursor:pointer;text-decoration:underline;padding-right:5px">Ready!</span>')
                .click(modules.handlers.click.delegate_click)
        )
            .append(
                $("<a href='javascript:;'>(refresh)</a>").click(modules.handlers.click.house_state_refresh)
            );
        if (modules.settings.settings.notifications.construction.sound && modules.settings.settings.notifications.all.sound) {
            modules.constants.SFX.circ_saw.play();
        }
    };

    module.handle_house_status_update = function (text) {
        if (text !== modules.constants.FUNCTION_PERSISTENT_VARS.house_update_last_msg) {
            modules.constants.FUNCTION_PERSISTENT_VARS.house_update_last_msg = text;
            const intervalFunc = modules.createInterval("house_status");
            intervalFunc.clear();

            if (text.indexOf("available again") !== -1) { // Working
                const timer = new AloTimer(this.parseTimeStringLong(text));
                intervalFunc.set(function () {
                    if (timer.isFinished) {
                        this.house_status_update_end(intervalFunc);
                    } else {
                        modules.constants.$DOM.house_monitor.status.removeClass("avi-highlight").text(timer.toString());
                    }
                }, 1000);
            } else if (text.indexOf("are available")) {
                this.house_status_update_end(intervalFunc);
            } else {
                setTimeout(function () {
                    $.get("/house.php")
                }, 3000);
            }
        }
    };

    module.pad = function(value, width, padWith) {
        padWith = padWith || '0';
        value = value + '';
        return value.length >= width ? value : new Array(width - value.length + 1).join(padWith) + value;
    };

    /**
     * Creates a floaty notification
     * @param {String} text Text to display
     * @param {Object} [options] Overrides as shown here: https://tampermonkey.net/documentation.php#GM_notification
     */
    module.notification = function (text, options) {
        GM_notification($.extend({
            text: text,
            title: GM_info.script.name,
            highlight: true,
            timeout: 5
        }, options || {}));
    };

    /**
     * Opens the market
     * @param {String} type The top category name
     */
    module.openMarket = function (type) {
        const $document = $(document);

        const $openCategory = function (evt, xhr, opts) {
            if (opts.url === "market.php") {
                $document.unbind("ajaxComplete", $openCategory);
                modules.constants.$DOM.market.navlinks.removeClass("active")
                    .filter("a:contains('" + type + "')").addClass("active").click();
            }
        };

        $document.ajaxComplete($openCategory);
        modules.constants.$DOM.nav.market.click();
    };

    module.analysePrice = function (arr) {
        const ret = {
            low: arr[0].price,
            high: arr[arr.length - 1].price
        };
        ret.avg = Math.round((parseFloat(ret.low) + parseFloat(ret.high)) / 2);
        return ret;
    };

    /**
     * Tabifies the div
     * @param {jQuery|$|HTMLElement|*} $container The div to tabify
     */
    module.tabify = function ($container) {
        const $nav = $container.find(">nav>*"),
            $tabs = $container.find(">div>*"),
            $activeNav = $nav.filter(".active");

        $nav.click(function () {
            const $this = $(this);
            $tabs.filter("[data-menu='" + $this.attr("data-menu") + "']").show().siblings().hide();
            $this.addClass("active").siblings().removeClass("active");
        });

        ($activeNav.length ? $activeNav : $nav).first().click();
    };

    /** Puts commas in large numbers */
    module.numberWithCommas = function (x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    /** Toggles the visibility attribute of the element */
    module.toggleVisibility = function ($el, shouldBeVisible) {
        $el.css("visibility", shouldBeVisible ? "visible" : "hidden");
    };

    module.openStdModal = function (item) {
        var $el;
        if (item instanceof $) {
            $el = item;
        } else if (item instanceof HTMLElement || typeof(item) === "string") {
            $el = $(item);
        } else {
            console.error("Failed to open modal: Invalid selector as shown below");
            console.error(item);
            return false;
        }

        $el.show().siblings().hide();
        modules.constants.$DOM.modal.modal_background.fadeIn();
        modules.constants.$DOM.modal.modal_wrapper.fadeIn();
    };

    /**
     * @return
     * 0 if the versions are equal
     * a negative integer iff v1 &lt; v2
     * a positive integer iff v1 &gt; v2
     * NaN if either version string is in the wrong format
     */
    module.versionCompare = function (v1, v2, options) {
        var lexicographical = options && options.lexicographical,
            zeroExtend = options && options.zeroExtend,
            v1parts = v1.split('.'),
            v2parts = v2.split('.');

        function isValidPart(x) {
            return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
        }

        if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
            return NaN;
        }

        if (zeroExtend) {
            while (v1parts.length < v2parts.length) v1parts.push("0");
            while (v2parts.length < v1parts.length) v2parts.push("0");
        }

        if (!lexicographical) {
            v1parts = v1parts.map(Number);
            v2parts = v2parts.map(Number);
        }

        for (var i = 0; i < v1parts.length; ++i) {
            if (v2parts.length == i) {
                return 1;
            }

            if (v1parts[i] == v2parts[i]) {

            }
            else if (v1parts[i] > v2parts[i]) {
                return 1;
            }
            else {
                return -1;
            }
        }

        if (v1parts.length != v2parts.length) {
            return -1;
        }

        return 0;
    };

    module.getElementIntValue = function (elementId) {
        return parseInt($('#' + elementId).text().replace(/\,/g, ''));
    };

    modules.utils = module;

})(modules.jQuery);(function ($) {
    'use strict';

    var module = {};

    var autoMax = 0;
    var autoCurr = 0;
    var initialized = false;
    var enabled = true;
    var allowAuto = true;

    function toggleAuto(self) {
        enabled = !enabled;
        console.log("Toggled auto " + enabled);

        var $this = $(this)
        if (enabled) {
            $this.text('ON');
        } else {
            $this.text('OFF');
        }
    }

    function updateAutoState(json)
    {
        autoMax = parseInt(json.autosMax);
        autoCurr = parseInt(json.autosRemaining);

        //console.info("Combat state: " + autoCurr + "/" + autoMax);
    }

    function updateAutoStamina(e, res, req, jsonres) {
        if(jsonres != null && jsonres.p != null && jsonres.p.autosMax != null)
        {
            updateAutoState(jsonres.p);
            if(!allowAuto) {
                allowAuto = autoMax > 5 && autoCurr > 0 && autoCurr >= autoMax - 1;
            }
        }

        if(enabled && allowAuto && autoMax > 5 && autoCurr > 0 && autoCurr < autoMax && autoCurr < 3)
        {
            allowAuto = false;

            $.post('stamina_replenish.php', {}).done(function(x) {
                if (x.captcha) {
                    modules.toast.warn("Captcha required!");
                }
            });
        }
    }

    function createToggle(target) {
        var toggleButton = $("<button class='btn btn-primary'/>");
        toggleButton.click(toggleAuto);
        toggleButton.text("ON");

        $('#' + target).prepend(toggleButton);
    }

    function initialize() {

        console.log("Initializing Auto..");

        createToggle('craftingStatusButtons');
        createToggle('battleStatusButtons');
        createToggle('harvestStatusButtons');

        initialized = true;
    }

    module.enable = function() {
        if(!initialized) {
            initialize();
        }

        modules.ajaxHooks.register("autobattle.php", updateAutoStamina);
        modules.ajaxHooks.register("autoevent.php", updateAutoStamina);
        modules.ajaxHooks.register("autotrade.php", updateAutoStamina);
        modules.ajaxHooks.register("autocraft.php", updateAutoStamina);
    };

    modules.automateStamina = module;

})(modules.jQuery);(function ($) {
    'use strict';

    modules.chartTimeScale = {
        Minute: {title: "Minutes"},
        Hour: {title: "Hours"},
        Day: {title: "Days"},
        Month: {title: "Months"}
    };

    const CURRENT_STORAGE_VERSION = 1;

    const ChartData = function () {
        this.reset();
    };

    ChartData.prototype = {
        storage: null,
        addDataPoint: function(dataPoint) {
            var dataPointTime = new Date();

            var dataPointMinute = dataPointTime.getMinutes();
            var dataPointHour = dataPointTime.getHours();
            var dataPointDay = dataPointTime.getDate();
            var dataPointMonth = dataPointTime.getMonth() + 1;

            this.addData("mi", dataPointMinute, dataPoint, 60); // 1 hour
            this.addData("h", dataPointHour, dataPoint, 24 * 30); // 30 days
            this.addData("d", dataPointDay, dataPoint, 356); // 1 year
            this.addData("mo", dataPointMonth, dataPoint, 12 * 5); // 5 years
        },
        addData: function (key, id, value, limit) {
            if(!this.storage[key]) {
                this.storage[key] = [];
            }

            if(this.storage[key].length > 0 && this.storage[key][this.storage[key].length - 1][0] === id) {
                return;
            }

            this.storage[key].push([id, value]);
            while (this.storage[key].length > limit) {
                this.storage[key].shift();
            }
        },
        load: function (data) {
            this.storage = JSON.parse(data);
            if(this.storage.version !== CURRENT_STORAGE_VERSION) {
                console.warn("Chart data is too old and was reset!");
                this.reset();
            }
        },
        save: function () {
            return JSON.stringify(this.storage);
        },
        reset: function () {
            this.storage = {version:CURRENT_STORAGE_VERSION, mi: [], h:[], d:[], mo:[]};
        },
        getData: function (scale) {
            if(scale === modules.chartTimeScale.Minute) {
                return this.storage.mi;
            } else if (scale === modules.chartTimeScale.Hour) {
                return this.storage.h;
            } else if (scale === modules.chartTimeScale.Day) {
                return this.storage.d;
            } else if (scale === modules.chartTimeScale.Month) {
                return this.storage.mo;
            }
        }
    };

    const Chart = function (toggleDiv, targetDiv, title) {
        this.id = targetDiv;
        this.data = new ChartData();
        this.initialize(toggleDiv, targetDiv, title);
    };

    Chart.prototype = {
        id: "ERR",
        visible: false,
        onBecameVisible: null,
        toggle: null,
        target: null,
        isGameStatChart: false,
        isElementChart: false,
        gameStatDataPoint: null,
        elementDataPoint: null,
        scale: modules.chartTimeScale.Minute,
        data: null,
        initialize: function (toggleDiv, targetDiv, title) {
            this.toggleDiv = $('#' + toggleDiv);
            this.toggleDiv.click({self: this}, function(evt) { evt.data.self.show(); });

            this.targetDiv = $('#' + targetDiv);

            this.control = new CanvasJS.Chart(targetDiv, {
                title:{
                    text: title
                },
                data: [
                    {
                        type: "line",
                        dataPoints: []
                    }
                ],
                axisX:{
                    title : "Time",
                },

                axisY:{
                    title : "Value",
                },
            });

            this.updateControlState();
        },
        load: function (data) {
            this.data.load(data);
            this.updateChartData();
            this.render();
        },
        save: function () {
            return this.data.save();
        },
        reset: function () {
            this.data.reset();
            this.updateChartData();
            this.render();
        },
        show: function () {
            if(this.visible === true) {
                return;
            }

            //console.log("Showing Chart " + this.id);
            this.visible = true;
            this.updateControlState();
            this.render();

            if(this.onBecameVisible) {
                this.onBecameVisible(this.id);
            }
        },
        hide: function () {
            if(this.visible === false) {
                return;
            }

            //console.log("Hiding Chart " + this.id);
            this.visible = false;
            this.updateControlState();
            this.render();
        },
        updateChartData: function () {
            var newData = this.data.getData(this.scale);

            this.control.options.data[0].dataPoints = [];
            for(var i = 0; i < newData.length; i++) {
                this.control.options.data[0].dataPoints.push({label: modules.utils.pad(newData[i][0], 2), x: i, y: newData[i][1]});
            }

            this.updateChartAxis();
        },
        updateChartAxis: function () {
            var controlData = this.control.options.data[0].dataPoints;

            // Rebuild min / max based on the new chart values
            var min = null;
            var max = null;

            for (var i = 0; i < controlData.length; i++) {
                if(min === null || min > controlData[i].y) {
                    min = controlData[i].y;
                }

                if(max === null || max < controlData[i].y) {
                    max = controlData[i].y;
                }
            }

            this.control.options.axisY.minimum = min;
            this.control.options.axisY.maximum = max;

            this.control.options.axisX.title = this.scale.title;
        },
        updateData: function (dataPoint) {
            if(dataPoint == null || dataPoint == NaN) {
                return
            }

            this.data.addDataPoint(dataPoint);

            this.updateChartData();
        },
        updateDataFromGameStats: function (stats) {
            if(!this.isGameStatChart) {
                return;
            }

            this.updateData(stats[this.gameStatDataPoint]);
        },
        updateDataFromElement: function() {
            var value = modules.utils.getElementIntValue(this.elementDataPoint);
            this.updateData(value);
        },
        asGameStatChart: function (dataPoint) {
            this.isGameStatChart = true;
            this.gameStatDataPoint = dataPoint;

            return this;
        },
        asElementChart: function (dataPoint) {
            this.isElementChart = true;
            this.elementDataPoint = dataPoint;
        },
        updateControlState: function() {
            if(this.visible === false) {
                this.targetDiv.hide();
                return;
            }

            this.targetDiv.show();
        },
        render: function () {
            this.control.render();
        },
        setTimeScale: function (newScale) {
            this.scale = newScale;
            this.updateChartData();
            this.render();
        }
    };

    modules.createChart = function (toggleDiv, targetDiv, title) {
        return new Chart(toggleDiv, targetDiv, title);
    };

})(modules.jQuery);(function ($) {
    'use strict';

    var module = {};

    const statUpdateDelay = 60 * 1 * 1000; // 1 minutes

    var chartWindow;

    var visibleChart = null;
    var activeCharts = {};

    function refreshStats(e, res, req, jsonData) {

        for (var id in activeCharts) {
            if (activeCharts[id].isGameStatChart) {
                activeCharts[id].updateDataFromGameStats(jsonData);
            } else if (activeCharts[id].isElementChart) {
                activeCharts[id].updateDataFromElement();
            }
        }

        redrawChart();
        saveChartData();
    }

    /*function beginRefreshStats() {
        console.log("Refreshing Stats...");

        $.post('game_stats.php', {}).done(refreshStats);
    }*/

    function loadChartData() {
        if(!localStorage.chartData) {
            return;
        }

        var data = JSON.parse(localStorage.chartData);
        for (var id in data) {
            if(activeCharts[id]) {
                activeCharts[id].load(data[id]);
            }
        }
    }

    function saveChartData() {
        var data = {};
        for (var id in activeCharts) {
            data[id] = activeCharts[id].save();
        }

        localStorage.chartData = JSON.stringify(data);
        $('#gameChartStorageSize').text(localStorage.chartData.length * 2);
    }

    function resetCharts() {
        if(window.confirm("Reset chart data?")) {
            for (var id in activeCharts) {
                activeCharts[id].reset();
            }
        }
    }

    function redrawChart() {
        if (visibleChart) {
            visibleChart.render();
        }
    }

    function debugChart() {
        if (visibleChart) {
            console.log(visibleChart);
        }
    }

    function setChartTimeScale(scale) {
        for (var id in activeCharts) {
            activeCharts[id].setTimeScale(scale);
        }
    }

    function toggleGameChartPlayerTabs() {
        hideTabCategories();
        $('#gameChartPlayerTabs').show();
    }

    function toggleGameChartStatsTabs() {
        hideTabCategories();
        $('#gameChartStatsTabs').show();
    }

    function toggleGameChartMarketTabs() {
        hideTabCategories();
        $('#gameChartMarketTabs').show();
    }

    function hideTabCategories() {
        $('#gameChartPlayerTabs').hide();
        $('#gameChartStatsTabs').hide();
        $('#gameChartMarketTabs').hide();
    }

    function setupChart(toggleDiv, targetDiv, title) {
        var chart = modules.createChart(toggleDiv, targetDiv, title);
        activeCharts[chart.id] = chart;

        chart.onBecameVisible = function (id) {
            if(visibleChart == activeCharts[id]) {
                return;
            }

            if (visibleChart) {
                visibleChart.hide();
            }

            visibleChart = activeCharts[id];
        };

        return chart;
    }

    function setupChartWindow(template) {

        $("<style>").text("" +
            ".chartWindow{width: 800px; height: 500px;position: absolute; top: 0; left: 0;}\n" +
            ".chartTab{width: 100%; height: 250px; top: 240px; position: absolute}\n" +
            ".chartCategoryTab{width: 100%; height: 100%}")
            .appendTo("body");

        chartWindow = $(template);
        chartWindow.appendTo("body");
        chartWindow.draggable({handle:"#gameChartTitle"});
        chartWindow.hide();

        var toggleButton = $('<a><div id="toggleGameCharts" class="bt1 center">Toggle Charts</div></a>');
        toggleButton.click(function () {
            chartWindow.toggle();
        });

        toggleButton.insertAfter('#showGameStats');
        
        // Hook buttons
        $('#gameChartReset').click(resetCharts);
        $('#gameChartRedraw').click(redrawChart);
        $('#gameChartDebugData').click(debugChart);
        $('#gameChartTimeMinute').click(function () { setChartTimeScale(modules.chartTimeScale.Minute); });
        $('#gameChartTimeHour').click(function () { setChartTimeScale(modules.chartTimeScale.Hour); });
        $('#gameChartTimeDay').click(function () { setChartTimeScale(modules.chartTimeScale.Day); });
        $('#gameChartTimeMonth').click(function () { setChartTimeScale(modules.chartTimeScale.Month); });

        $('#toggleGameChartPlayer').click(toggleGameChartPlayerTabs);
        $('#toggleGameChartStats').click(toggleGameChartStatsTabs);
        $('#toggleGameChartMarket').click(toggleGameChartMarketTabs);

        // Toggle the default tab view
        toggleGameChartPlayerTabs();

        // Create the chart controls
        setupChart("toggleChartBattleXP", "chartBattleXP", "Battle XP");
        setupChart("toggleChartHarvestXP", "chartHarvestXP", "Harvest XP");
        setupChart("toggleChartCraftingXP", "chartCraftingXP", "Crafting XP");
        setupChart("toggleChartGold", "chartGold", "Gold").asElementChart("gold");
        setupChart("toggleChartPlatinum", "chartPlatinum", "Platinum").asElementChart("platinum");
        setupChart("toggleChartCrystal", "chartCrystal", "Crystals").asElementChart("premium");
        setupChart("toggleChartMaterial", "chartMaterial", "Material").asElementChart("crafting_materials");
        setupChart("toggleChartFragment", "chartFragment", "Fragments").asElementChart("gem_fragments");
        setupChart("toggleChartFood", "chartFood", "Food").asElementChart("food");
        setupChart("toggleChartWood", "chartWood", "Wood").asElementChart("wood");
        setupChart("toggleChartIron", "chartIron", "Iron").asElementChart("iron");
        setupChart("toggleChartStone", "chartStone", "Stone").asElementChart("stone");

        setupChart("toggleChartMonsterSlain", "chartMonsterSlain", "Monsters Slain").asGameStatChart("AllTimeKills");
        setupChart("toggleChartGoldLooted", "chartGoldLooted", "Gold Looted").asGameStatChart("AllTimeGoldLooted");
        setupChart("toggleChartGoldInGame", "chartGoldInGame", "Gold in Game").asGameStatChart("AllTimeCurrentGold");
        setupChart("toggleChartResourcesInGame", "chartResourcesInGame", "Resources in Game").asGameStatChart("AllTimeCurrentRes");
        setupChart("toggleChartPlatinumInGame", "chartPlatinumInGame", "Platinum in Game").asGameStatChart("AllTimeCurrentPlat");
        setupChart("toggleChartMaterialInGame", "chartMaterialInGame", "Crafting Materials in Game").asGameStatChart("AllTimeCurrentMats");
        setupChart("toggleChartFragmentInGame", "chartFragmentInGame", "Gem Fragments in Game").asGameStatChart("AllTimeCurrentFrags");
        setupChart("toggleChartHarvests", "chartHarvests", "Harvests").asGameStatChart("AllTimeHarvests");
        setupChart("toggleChartResourcesHarvested", "chartResourcesHarvested", "Resources Harvested").asGameStatChart("AllTimeResources");
        setupChart("toggleChartItemsFound", "chartItemsFound", "Items found").asGameStatChart("AllTimeItemsFound");

        setupChart("toggleChartMarketCrystals", "chartMarketCrystals", "Crystals");
        setupChart("toggleChartMarketPlatinum", "chartMarketPlatinum", "Platinum");
        setupChart("toggleChartMarketFood", "chartMarketFood", "Food");
        setupChart("toggleChartMarketWood", "chartMarketWood", "Wood");
        setupChart("toggleChartMarketIron", "chartMarketIron", "Iron");
        setupChart("toggleChartMarketStone", "chartMarketStone", "Stone");
        setupChart("toggleChartMarketMaterial", "chartMarketMaterial", "Material");
        setupChart("toggleChartMarketFragment", "chartMarketFragment", "Fragments");

        loadChartData();

        modules.ajaxHooks.register("game_stats.php", refreshStats);
        modules.ajaxHooks.registerAutoSend("game_stats.php", {}, statUpdateDelay);
    }

    module.enable = function () {
        $.get(modules.constants.URLS.html.charts).done(setupChartWindow);
    };

    modules.chartWindow = module;

})(modules.jQuery);(function($) {
    'use strict';

    var module = {};

    var peopleMod = {};

    if(localStorage.peopleMod)
        peopleMod = JSON.parse(localStorage.peopleMod);

    function addChatColorPicker() {
        $('head').append('<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/spectrum/1.8.0/spectrum.min.css"><style>.sp-replacer{border: 1px solid #01b0aa; background: #01736D;}</style>');
        $('#profileOptionProfile').after(' . <input type="text" id="profileOptionColor" />');

        // Initialize color picker
        $("#profileOptionColor").spectrum({
            showInput: true,
            showInitial: true,
            allowEmpty: true,
            clickoutFiresChange: false,
            change: function(color) {
                if(color == null && ($('#profileOptionUsername').text() in peopleMod)) {
                    peopleMod[$('#profileOptionUsername').text()] = 'white';
                    modChatColors();
                    delete peopleMod[$('#profileOptionUsername').text()];
                    savePeopleMod();
                }
                else {
                    peopleMod[$('#profileOptionUsername').text()] = color.toHexString();
                    modChatColors();
                    savePeopleMod();
                }
            }
        });

        // Add observer to chat to change colors on new comments.
        var observer = new MutationObserver(function( mutations ) {
            mutations.forEach(function( mutation ) {
                if( mutation.addedNodes !== null )
                    modChatColors();
                if($('#profileOptionUsername').text() in peopleMod)
                    $("#profileOptionColor").spectrum("set", peopleMod[$('#profileOptionUsername').text()]);
                else {
                    $("#profileOptionColor").spectrum("set", '');
                    //$('#profileOptionTooltip .sp-preview-inner').css('background-color', 'transparent');
                    //$('#profileOptionTooltip .sp-preview-inner').addClass('sp-clear-display');
                }
            });
        });
        observer.observe($('#chatMessageList')[0], { childList: true, characterData: true});
        observer.observe($('#profileOptionTooltip')[0], { attributes: true, characterData: true});
    }

    /*function addChatSwap() {
        if(typeof Storage == "undefined")
            alert('Local Storage is not supported on this browser. Chat Swap preference will not be saved next session');
        var arrow = "?";
        if(localStorage.chatmove == "true") {
            var e1 = $('#contentWrapper'), e2 = $('#chatWrapper');
            e1.insertAfter(e2);
            e2.insertAfter('#navWrapper');
            $('#effectInfo').insertBefore('#activityWrapper');
            $('#houseNotificationWrapper').insertBefore('#activityWrapper');
            arrow = "?";
            $('#chatMessageListWrapper').height($('#bottomWrapper').offset().top - $('#chatMessageListWrapper').offset().top -2);
        }
        $('<div style="position: absolute;font-size: 14px;color: #01B0AA;left: 12px;cursor: pointer;padding: 1px;" font-size:="">' + arrow + '</div>').prependTo('#areaWrapper>h5').click(function(){
            localStorage.chatmove = !(localStorage.chatmove == "true");
            var e1 = $('#chatWrapper'), e2 = $('#contentWrapper');
            if(localStorage.chatmove == "true") {
                e1 = $('#contentWrapper'), e2 = $('#chatWrapper');
                $('#effectInfo').insertBefore('#activityWrapper');
                $('#houseNotificationWrapper').insertBefore('#activityWrapper');
                $(this).html('?');
            }
            else {
                $('#effectInfo').appendTo('#rightWrapper');
                $('#houseNotificationWrapper').appendTo('#rightWrapper');
                $(this).html('?');
            }
            e1.insertAfter(e2);
            e2.insertAfter('#navWrapper');
            $('#chatMessageListWrapper').height($('#bottomWrapper').offset().top - $('#chatMessageListWrapper').offset().top -2);
        });
    }*/

    function modChatColors() {
        $('#chatMessageList').find('.profileLink').each(function() {
            if($(this).text() in peopleMod) {
                var text = $(this).next();
                // Check if this is main channel by the text of the 3rd span. Whispers are special cases, other non-main channels start a [channelName] output.
                var e = $(this).closest('li').find('span:eq(2)').text();
                if(e.indexOf('Whisper') == -1 && e != '[')
                    text.css('color', peopleMod[$(this).text()]);
            }
        });
    }

    function savePeopleMod() {
        localStorage.peopleMod = JSON.stringify(peopleMod);
    }

    function initialize() {
        $('head').append('<style>.ui-icon, .ui-widget-content .ui-icon {background-image: none;}.closeCustomWindow {position: absolute;right: -12px;top: -12px;font-size: 20px;text-align: center;border-radius: 40px;border: 1px solid black;background: transparent linear-gradient(to bottom, #008681 0%, #003533 100%) repeat scroll 0% 0%;width: 30px;}.closeCustomWindow a {text-decoration: none;}.customWindowWrapper {display: none;z-index: 99;position: absolute !important;top: 120px;left: 15%;}.customWindowContent {padding: 5px;border-bottom-right-radius: 5px;border-bottom-left-radius: 5px}.customWindowContent table {width: 100%;font-size: 12px;}.customWindowContent tbody {border: 1px solid #01B0AA;border-top: none;}.customWindowContent th {text-align: center;color: #FF7;border: 1px solid #01B0AA;}.customWindowContent thead th {background-color: #01736D;font-size: 14px;}.customWindowContent td {text-align: center;}.customWindowContent .bRight {border-right: 1px solid #01B0AA;}</style>');
        /*if(constants.ENABLE_CHAT_BATTLE_SWAP)
            addChatSwap();*/
        if(modules.constants.ENABLE_CHAT_USER_COLOR_PICKER)
            addChatColorPicker();
    }

    module.enable = function () {
        initialize();
    };

    modules.chatPeopleColor = module;

})(modules.jQuery);(function ($) {
    'use strict';

    var module = {};

    var options                 = {
        scriptSettings  : {
            purge                       : true,
            channel_remove              : false,
            preview                     : true,
            preview_reset               : false,
            group_wires                 : false,
            at_username                 : true,
            join_channel_link           : true,
            auto_join                   : false,
            profile_tooltip_nickname    : true,
            profile_tooltip_mention     : true,
            profile_tooltip_quickscope  : true
        },
        channelsSettings    : {
            channelMerger       : {
                groups              : [],
                mapping             : {},
                defaultChannels     : {}
            },
            mutedChannels   : []
        },
        version: "3.1"
    };
    var groupsMap               = {};
    var channelLog              = {};
    var mainChannelID           = "2";
    var currentChannel          = "Main";
    var ServerMessagesChannel   = "SML_325725_2338723_CHC";
    var CMDResposeChannel       = "CMDRC_4000_8045237_CHC";
    var WhispersChannel         = "UW_7593725_3480021_CHC";
    var WiresChannel            = "WC_0952340_3245901_CHC";
    var MergedChannelsGroup     = "MCG_105704_4581101_CHC";

    var GlobalChannel           = 1000000000;
    var EventChannel            = 2000000000;
    var chatDirection           = "up";

    var scriptChannels          = [ServerMessagesChannel, CMDResposeChannel, WhispersChannel, WiresChannel];

    var hovering;
    var hoveringOverTab;

    function returnCustomID(channel, resolved, cname, on) {
        var obj =  {
            cID: channel,
            res: resolved,
            name: cname,
            on: typeof on !== "undefined" ? on : name
        };
        return obj;
    }

    function resolveChannelID(channel) {
        var channelID;
        var origChannelName = channel;
        var resolved = true;
        if (channel === "GLOBAL") {
            channel = "Global";
        } else if (channel === "CLAN") {
            channel = "Clan";
        } else if (channel.substr(0,4) === "AREA") {
            channel = "Area";
        } else if (channel === "HELP") {
            channel = "Help";
        } else if (channel === "STAFF") {
            channel = "Staff";
        } else if (channel === "TRADE") {
            channel = "Trade";
        } else if (channel === "Market") {
            return returnCustomID(CMDResposeChannel, true, "");//  info channel changes this later
        } else if (channel === "Whispers Log") {
            return returnCustomID(WhispersChannel, true, channel, origChannelName);
        } else if (channel === "Wires Log") {
            return returnCustomID(WiresChannel, true, channel, origChannelName);
        } else if (channel === "Server Messages") {
            return returnCustomID(ServerMessagesChannel, true, channel, origChannelName);
        } else if (channel.match(/^Level:\s+[0-9]+/)) {
            return returnCustomID(CMDResposeChannel, true, "", origChannelName);//  info channel changes this later
        }
        var map = {
            "Global": "GLOBAL",
            "Clan": "CLAN",
            "Area": "AREA",
            "Help": "HELP",
            "Staff": "STAFF",
            "Trade": "TRADE"
        };
        if (typeof map[origChannelName] !== "undefined") {
            origChannelName = map[origChannelName];
        }

        channelID = 0;
        $("select#chatChannel option").each(function(i,e){
            var n = $(e).attr("name");
            if (n==="channel"+channel) {
                channelID = $(e).attr("value");
            }
        });
        if (options.channelsSettings.channelMerger.groups.indexOf(origChannelName) !== -1) {
            channelID = MergedChannelsGroup + "_MCGID_" + groupsMap[origChannelName];
        }

        if (origChannelName == "GLOBAL"){
            channelID = GlobalChannel;
        }
        if (origChannelName == "Event"){
            channelID = EventChannel;
        }

        if (channelID === 0) {
            resolved = false;
            channelID = "2";// Main
        }

        return returnCustomID(channelID, resolved, channel, origChannelName);
    }

    function resolveChannelColor(channelID, channelName) {
        var color = "";
        try {
            color = $(".chatChannel[data-id=\"" + channelName + "\"]").css("background-color");
        } catch (e) {
            color = "";
        }
        if (color === "" || typeof color === "undefined") {
            $(".chatChannel").each(function(i,e){
                if ($(e).attr("data-id") === channelName) {
                    color = $(e).css("background-color");
                }
            });
        }
        if (channelID === ServerMessagesChannel) {
            color = "#007f23";
        } else if (channelID === CMDResposeChannel) {
            color = "#317D80";
        } else if (channelID === WhispersChannel) {
            color = "#DE3937"; //FF3
        } else if (channelID === WiresChannel) {
            color = "#39DE37"; //FF3
        }
        return color;
    }

    function updateChannelList(channel) {
        var tab = $("#channelTab" + channel.channelID);
        if (tab.length === 0) {
            if (channel.muted) {
                return;
            }
            $("<div>")
                .attr("id", "channelTab" + channel.channelID)
                .attr("data-channel", channel.channelID)
                .addClass("border2 ui-element channelTab")
                .css({
                    color: channel.channelColor
                })
                .appendTo("#channelTabList");
            tab = $("#channelTab" + channel.channelID);
        }
        var channelTabLabel = "#"+channel.channelName;
        tab.text(channelTabLabel).css({color: channel.channelColor});
        if (channel.newMessages && !channel.muted) {

            if ($(".Ch"+channel.channelID+"Badge").length === 0) {
                var badge = $("<span>")
                    .addClass("ChBadge")
                    .addClass("border2")
                    .addClass("Ch"+channel.channelID+"Badge")
                    .text(channel.newMessagesCount)
                    .appendTo("#channelTab"+channel.channelID);
            } else {
                $(".Ch"+channel.channelID+"Badge").text(channel.newMessagesCount);
            }
        }
        if (channel.muted) {
            $("<span>")
                .addClass("ChBadge fa fa-times border2 ui-element")
                .appendTo("#channelTab"+channel.channelID);
        }
    }

    function addSettingsTab() {
        $("<div>")
            .attr("id", "ToASettings")
            .addClass("border2 ui-element ToASettings")
            .prependTo("#channelTabList");
        $("<span>")
            .addClass("fa")
            .addClass("fa-cogs")
            .css({
                color: "#ffd700",
                fontWeight: 500
            })
            .appendTo("#ToASettings");
    }

    function randomInt(min, max) {
        return Math.round( Math.random() * ( max - min ) ) + min;
    }

    function randomColor() {
        var color = "#";
        for (var i = 0; i < 6; i++) {
            color += Math.floor(Math.random()*15).toString(16);
        }
        return color;
    }

    function randomName(min, max) {
        var a = "aeiou".split("");
        var b = "rtzpsdfghklmnbvc".split("");
        var l = randomInt(min, max);
        var name = "";
        for (var i = 0; i < l; i++)
        {
            var charset = i % 2 === 0 ? a : b;
            if ( i === 0 )
            {
                charset = Math.random() < 0.5 ? a : b;
            }
            var letter = charset[randomInt(0, charset.length - 1)];
            name += i === 0 ? letter.toUpperCase() : letter;
        }
        return name;
    }

    function ucfirst(str) {
        var result  = "";
        var first   = str.charAt(0).toUpperCase();

        return first + str.substr(1);
    }

    function loadDependencies() {
        //<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css">
        $("<link>")
            .attr({
                rel: "stylesheet",
                href: "//maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css"
            })
            .appendTo("head");
    }

    function prepareHTML() {
        $("<div>")
            .attr("id", "channelTabListWrapper")
            .insertBefore("#chatMessageListWrapper");
        $("<div>")
            .attr("id", "channelTabList")
            .appendTo("#channelTabListWrapper");

        /**
         * Preview channel
         */
        $("<div>")
            .attr("id", "channelPreviewWrapper")
            .addClass("border2")
            .addClass("ui-element")
            .appendTo("body");

        $("<h5>")
            .css("text-align", "center")
            .appendTo("#channelPreviewWrapper");

        $("<div>")
            .attr("id", "channelPreviewActions")
            .appendTo("#channelPreviewWrapper");

        $("<span>")
            .addClass("border2 ui-element fa fa-check sapphire cpa")
            .attr("id", "CPAReset")
            .attr("title", "Mark as read")
            .appendTo("#channelPreviewActions");

        $("<span>")
            .addClass("border2 ui-element fa fa-eraser emerald cpa")
            .attr("id", "CPAPurge")
            .attr("title", "Clear channel of all messages")
            .appendTo("#channelPreviewActions");

        $("<span>")
            .addClass("border2 ui-element fa fa-unlink ruby cpa")
            .attr("id", "CPARemove")
            .attr("title", "Clear the channel and remove it from tabs\nIf any new messages pop into it, it will come back.")
            .appendTo("#channelPreviewActions");

        $("<div>")
            .attr("id", "channelPreviewContent")
            .appendTo("#channelPreviewWrapper");

        $("<div>")
            .attr("id", "channelPreviewMessages")
            .css({
                padding:"2px",
            })
            .appendTo("#channelPreviewContent");
        $("#channelPreviewContent").mCustomScrollbar({scrollInertia: 250,mouseWheel:{scrollAmount: 40}});

        /**
         * context menu
         */

        $("<div>")
            .attr("id", "channelTabContextMenu")
            .addClass("ui-element navSection")
            .appendTo("body");

        $("<a>")
            .attr("id", "chTabCTMenuMute")
            .text("Mute channel")
            .addClass("cctmButton")
            .appendTo("#channelTabContextMenu");

        $("<span>")
            .addClass("ui-element fa fa-bell-slash titanium")
            .prependTo("#chTabCTMenuMute");

        $("<a>")
            .attr("id", "chTabCTMenuUnMute")
            .text("Un-mute channel")
            .addClass("cctmButton")
            .appendTo("#channelTabContextMenu");

        $("<span>")
            .addClass("ui-element fa fa-bell platinum")
            .prependTo("#chTabCTMenuUnMute");

        $("<a>")
            .attr("id", "chTabCTMenuReset")
            .text("Mark as read")
            .addClass("cctmButton")
            .appendTo("#channelTabContextMenu");

        $("<span>")
            .addClass("ui-element fa fa-check sapphire")
            .prependTo("#chTabCTMenuReset");

        $("<a>")
            .attr("id", "chTabCTMenuLast")
            .text("Show history")
            .addClass("cctmButton")
            .appendTo("#channelTabContextMenu");

        $("<span>")
            .addClass("ui-element fa fa-history materials")
            .prependTo("#chTabCTMenuLast");

        $("<a>")
            .attr("id", "chTabCTMenuPurge")
            .text("Purge messages")
            .addClass("cctmButton")
            .appendTo("#channelTabContextMenu");

        $("<span>")
            .addClass("ui-element fa fa-eraser emerald")
            .prependTo("#chTabCTMenuPurge");

        $("<a>")
            .attr("id", "chTabCTMenuRemove")
            .text("Remove from tabs")
            .addClass("cctmButton")
            .appendTo("#channelTabContextMenu");

        $("<span>")
            .addClass("ui-element fa fa-unlink ruby")
            .prependTo("#chTabCTMenuRemove");

        $("<a>")
            .attr("id", "chTabCTMenuLeave")
            .text("Leave channel")
            .addClass("cctmButton")
            .appendTo("#channelTabContextMenu");

        $("<span>")
            .addClass("ui-element fa fa-arrow-right diamond")
            .prependTo("#chTabCTMenuLeave");

        $("<a>")
            .attr("id", "chTabCTMenuColor")
            .text("Change color")
            .addClass("cctmButton")
            .appendTo("#channelTabContextMenu");

        $("<span>")
            .addClass("ui-element fa fa-crosshairs crystals")
            .prependTo("#chTabCTMenuColor");


        $("#channelTabContextMenu").hide();

        /**
         * settings
         */
        $("<div>")
            .attr("id", "ToASettingsWindow")
            .addClass("border2 ui-element")
            .appendTo("body");

        $("<h5>")
            .css("text-align", "center")
            .text("TabsOfAvabur v"+options.version+" - Settings")
            .appendTo("#ToASettingsWindow");

        $("<div>")
            .attr("id","ToASWMenu")
            .appendTo("#ToASettingsWindow");

        var t = $("<div>")
            .addClass("col-sm-6 text-center");

        var l = t.clone().appendTo("#ToASWMenu");
        var r = t.clone().appendTo("#ToASWMenu");

        $("<button>")
            .attr("type", "button")
            .attr("id", "ToAScriptOptions")
            .addClass("btn btn-primary btn-block")
            .text("Script options")
            .appendTo(l);

        $("<button>")
            .attr("type", "button")
            .attr("id", "ToAChannelMerger")
            .addClass("btn btn-primary btn-block")
            .text("(WIP) Channel Manager")
            .appendTo(r);

        $("<div>").addClass("clearfix").appendTo("#ToASettingsWindow");

        $("<div>")
            .attr("id", "ToASettingsWindowContent")
            .appendTo("#ToASettingsWindow");

        $("<div>")
            .attr("id", "ToASettingsScriptSettings")
            .appendTo("#ToASettingsWindowContent");

        var st  = $("<h6>").addClass("text-center");
        var t2  = $("<label>");
        var t2a = $("<input>").attr({"type":"checkbox"}).addClass("settingsChanger");
        var t2w = t.clone().removeClass("text-center");

        st.clone().text("Script settings").appendTo("#ToASettingsScriptSettings");
        // purge channel
        t2w.clone()
            .append(
                t2.clone()
                    .text(" Allow channel message purging")
                    .prepend(
                        t2a.clone()
                            .attr("data-setting","purge")
                            .prop("checked", options.scriptSettings.purge)
                    )
            )
            .appendTo("#ToASettingsScriptSettings");
        // purge and remove
        t2w.clone()
            .append(
                t2.clone()
                    .text(" Allow removing channel form tabs")
                    .prepend(
                        t2a.clone()
                            .attr("data-setting","channel_remove")
                            .prop("checked", options.scriptSettings.channel_remove)
                    )
            )
            .appendTo("#ToASettingsScriptSettings");

        // preview
        t2w.clone()
            .append(
                t2.clone()
                    .text(" Preview channel on tab hover")
                    .prepend(
                        t2a.clone()
                            .attr("data-setting","preview")
                            .prop("checked", options.scriptSettings.preview)
                    )
            )
            .appendTo("#ToASettingsScriptSettings");

        // mark read
        t2w.clone()
            .append(
                t2.clone()
                    .text(" Allow marking channels as read")
                    .prepend(
                        t2a.clone()
                            .attr("data-setting","preview_reset")
                            .prop("checked", options.scriptSettings.preview_reset)
                    )
            )
            .appendTo("#ToASettingsScriptSettings");

        // mark read
        t2w.clone()
            .append(
                t2.clone()
                    .text(" Group wires into their own channel")
                    .prepend(
                        t2a.clone()
                            .attr("data-setting","group_wires")
                            .prop("checked", options.scriptSettings.group_wires)
                    )
            )
            .appendTo("#ToASettingsScriptSettings");

        // @mention
        t2w.clone()
            .append(
                t2.clone()
                    .text(" Make @username clickable")
                    .prepend(
                        t2a.clone()
                            .attr("data-setting","at_username")
                            .prop("checked", options.scriptSettings.at_username)
                    )
            )
            .appendTo("#ToASettingsScriptSettings");

        // /join channel password
        t2w.clone()
            .append(
                t2.clone()
                    .html(" Make '/join channel' clickable. <span class='fa fa-info-circle ToATooltip' title='After you click on the link, the chat message will be filled with a /join channel text.' data-toggle='tooltip' data-placement='top' data-html='true'></span>")
                    .prepend(
                        t2a.clone()
                            .attr("data-setting","join_channel_link")
                            .prop("checked", options.scriptSettings.join_channel_link)
                    )
            )
            .appendTo("#ToASettingsScriptSettings");

        // /join channel password
        t2w.clone()
            .append(
                t2.clone()
                    .html(" Autojoin clicked channel. <span class='fa fa-info-circle ToATooltip' title='This is designed to work with the previous option to replace the /join <a>channel</a> message.<br>If this option is enabled, the prefilled message to join a channel will be automatically sent.' data-toggle='tooltip' data-placement='top' data-html='true'></span>")
                    .prepend(
                        t2a.clone()
                            .attr("data-setting","auto_join")
                            .prop("checked", options.scriptSettings.auto_join)
                    )
            )
            .appendTo("#ToASettingsScriptSettings");

        // profileOptionsTooltip - Nickname
        t2w.clone()
            .append(
                t2.clone()
                    .html(" Enable Ni[c]kname shortcut")
                    .prepend(
                        t2a.clone()
                            .attr("data-setting","profile_tooltip_nickname")
                            .prop("checked", options.scriptSettings.profile_tooltip_nickname)
                    )
            )
            .appendTo("#ToASettingsScriptSettings");

        // profileOptionsTooltip - @mention
        t2w.clone()
            .append(
                t2.clone()
                    .html(" Enable @m[e]ntion shortcut")
                    .prepend(
                        t2a.clone()
                            .attr("data-setting","profile_tooltip_mention")
                            .prop("checked", options.scriptSettings.profile_tooltip_mention)
                    )
            )
            .appendTo("#ToASettingsScriptSettings");

        // profileOptionsTooltip - Nickname
        t2w.clone()
            .append(
                t2.clone()
                    .html(" Enable [Q]uickscope shortcut")
                    .prepend(
                        t2a.clone()
                            .attr("data-setting","profile_tooltip_quickscope")
                            .prop("checked", options.scriptSettings.profile_tooltip_quickscope)
                    )
            )
            .appendTo("#ToASettingsScriptSettings");

        $("<div>").addClass("clearfix").appendTo("#ToASettingsScriptSettings");

        $("<div>")
            .attr("id", "ToASettingsChannelMerger")
            .appendTo("#ToASettingsWindowContent");

        st.clone().text("Muted channels").appendTo("#ToASettingsChannelMerger");

        /**
         * muted channels content added on settings window open
         */

        $("<div>")
            .attr("id", "ToASChMMutedChannelsHolder")
            .addClass("border2 ui-element ToASChannelsHolder")
            .appendTo("#ToASettingsChannelMerger");

        // clearfix muted channels
        $("<div>").addClass("clearfix").appendTo("#ToASettingsWindow");

        /**
         * channel merger content added on setting window open
         */
        st.clone().text("Channel Merger").appendTo("#ToASettingsChannelMerger");

        // holder for all channels - script created ones
        $("<div>")
            .attr("id", "ToASChMMergedChannelsHolder")
            .addClass("border2 ui-element ToASChannelsHolder incsort")
            .appendTo("#ToASettingsChannelMerger")
            .before(t2.clone().text("Available Channels:"));

        // holder for groups
        $("<div>")
            .attr("id", "ToASChMMergedChannelsGroupsHolder")
            .addClass("ui-element ToASChannelsHolder")
            .appendTo("#ToASettingsChannelMerger")
            .before();
        var chgl = t2.clone().text("Channel Groups:").insertBefore("#ToASChMMergedChannelsGroupsHolder");
        $("<button>").addClass("fa fa-plus btn btn-primary emerald pull-right btn-xs").attr("id", "ToASChMAddGroup").insertAfter(chgl);

        // clearfix channel merger
        $("<div>").addClass("clearfix").appendTo("#ToASettingsChannelMerger");

        // clearfix settings window
        $("<div>").addClass("clearfix").appendTo("#ToASettingsWindow");

        $("<div>")
            .attr("id", "ToASettingsSaved")
            .text("Settings have been saved and are applied")
            .addClass("text-center small")
            .appendTo("#ToASettingsWindow");

        // close button
        $("<span>")
            .attr("id", "ToASettingsWindowClose")
            .addClass("fa fa-times border2 ui-element")
            .appendTo("#ToASettingsWindow");

        /**
         * profile tooltip extras
         */
        var ToAExtraDivider = $("<span>").text(" · ");

        ToAExtraDivider.clone().addClass("ToAPONickname").toggleClass("hidden", !options.scriptSettings.profile_tooltip_nickname).appendTo("#profileOptionTooltip");
        $("<a>").addClass("ToAPONickname").toggleClass("hidden", !options.scriptSettings.profile_tooltip_nickname).text("Ni[c]kname").attr("id", "profileOptionNick").appendTo("#profileOptionTooltip");

        ToAExtraDivider.clone().addClass("ToAPOMention").toggleClass("hidden", !options.scriptSettings.profile_tooltip_mention).appendTo("#profileOptionTooltip");
        $("<a>").addClass("ToAPOMention").toggleClass("hidden", !options.scriptSettings.profile_tooltip_mention).text("@m[e]ntion").attr("id", "profileOptionAt").appendTo("#profileOptionTooltip");

        ToAExtraDivider.clone().addClass("ToAPOQuickscope").toggleClass("hidden", !options.scriptSettings.profile_tooltip_quickscope).appendTo("#profileOptionTooltip");
        $("<a>").addClass("ToAPOQuickscope").toggleClass("hidden", !options.scriptSettings.profile_tooltip_quickscope).text("[Q]uickscope").attr("id", "profileOptionQuickScope").appendTo("#profileOptionTooltip");

        // init
        $("#ToASettingsWindow").hide();
        $("#ToASettingsScriptSettings").hide();
        $("#ToASettingsChannelMerger").hide();
        $("#ToASettingsSaved").hide();
        $(".ToATooltip").tooltip();
        $("#ToASettingsWindow").draggable({handle:"h5"});
        /**
         * CSS
         */
        $("<style>").text(""+
            "#channelTabListWrapper{margin-bottom: -1px;position: relative;}#channelTabList{overflow: hidden;border-radius: 4px 4px 0 0;font-size: 9pt;}\n"+
            ".ToASettings, .channelTab{cursor: pointer;margin: 2px 2px 0 2px;border-radius: 4px 4px 0 0;display: inline-block;padding: 2px 5px;position:relative;}\n"+
            "#chatMessageList li:not(.processed){display: none;}\n"+
            "/*#chatMessageList li.processed{display: list-item;}*/\n"+
            ".ChBadge{display:inline-block;margin-left:3px;padding:1px 4px;font-size:7pt;vertical-align:top;border-color:green!important;color:#fff !important;}\n"+
            ".muted-badge{position:absolute;left:5px;top:5px;}\n"+
            ".mCSB_scrollTools.mCSB_scrollTools_horizontal{top:15px!important;}\n"+
            ".mCSB_horizontal.mCSB_inside>.mCSB_container{margin-bottom: 0 !important;}\n"+
            "#channelPreviewWrapper{position:absolute;font-size:9pt;min-width:350px;max-width:500px;background-color:rgba(0,0,0,.75)!important;}\n"+
            "#channelPreviewContent{max-height: 250px;overflow-y: hidden;}\n"+
            "#channelPreviewActions{position:absolute;right:2px;top:2px;}\n"+
            ".cpa{display:inline-block;margin-left:2px;padding: 1px 3px;font-size:9pt;vertical-align:top;cursor:pointer;}\n"+
            "#channelTabContextMenu{position:absolute;width:175px;background-color:rgba(0,0,0,.75)!important;}\n"+
            ".cctmButton{text-align:left!important;}\n"+
            "#ToASettingsWindow{position:absolute!important;width:50%;min-width: 500px;top:150px;left:25%;background-color:rgba(0,0,0,.75)!important;z-index:150;}\n"+
            ".cctmButton>span{margin: 0 15px 0 5px;font-size:8.5pt;padding:2px;}\n"+
            "#channelTabContextMenu .cctmButton {display:block;width:100%;border-left:0;}\n"+
            "#ToASettingsWindowContent label{font-size:10pt;}\n"+
            "#ToASettingsWindowContent {padding-top:5px;}\n"+
            "#ToASettingsWindowClose{position:absolute;right:2px;top:2px;color:#f00;padding:1px 4px;cursor:pointer;}\n"+
            ".ToASChannelsHolder{padding: 2px;margin:3px auto;width:97%;}\n"+
            ".ChMChannelWrapper{display:inline-block;margin:1px 2px;padding:1px 4px;font-size:10pt;}\n"+
            ".ChMMChX{margin-right:4px;padding:1px 2px;cursor:pointer;}\n"+
            "#ToASettingsWindow .tooltip{width:350px;}\n"+
            "#ToASettingsWindow .tooltip-inner{max-width:100%;}\n"+
            ".hand{curson: pointer;}\n"+
            "#ToASChMAddGroup, .ToASChMChGRemove{margin-top: 0;}\n"+
            ".incsort{border-radius: 0 !important; margin: 3px 1px; padding: 2px;}\n"+
            ".chTabSelected {background-image: " + $("#navigationWrapper > h5").css("background-image")+" !important;}\n"+
            "#ToASChMMergedChannelsGroupsHolder > .incsort > span:nth-of-type(1) {border-left-width: 7px !important;}\n"+
            "@media screen and (max-width:768px){#ToASettingsWindow{left:5%;}}")
            .appendTo("body");
    }

    var SSN = 0;
    function saveOptions() {
        clearTimeout(SSN);
        var opts = JSON.stringify(options);
        localStorage.setItem("ToAOPTS", opts);
        $("#ToASettingsSaved").show();
        SSN = setTimeout(function(){
            $("#ToASettingsSaved").fadeOut();
        }, 3E3);
    }

    function changeSetting(e) {
        var setting = $(e).attr("data-setting");
        options.scriptSettings[setting] = $(e).prop("checked");
        var match = setting.match("^profile_tooltip_([a-z]+)");
        if (match !== null) {
            var POOption = ucfirst(match[1]);
            $(".ToAPO"+POOption).toggleClass("hidden");
        }
        saveOptions();
    }

    function resetUnreadCount() {
        var channelID                           = hoveringOverTab;
        channelLog[channelID].newMessages       = false;
        channelLog[channelID].newMessagesCount  = 0;
        updateChannelList(channelLog[channelID]);
        $("#channelPreviewWrapper").hide();
        $("#channelTabContextMenu").hide();
    }

    function purgeChannel(andRemove,confirmToo) {
        andRemove       = typeof andRemove==="undefined"?options.scriptSettings.channel_remove:andRemove;
        confirmToo      = typeof confirmToo==="undefined"?false:confirmToo;
        var channelID   = hoveringOverTab;
        var channelName = channelLog[channelID].channelName;
        var confirmText = "Are you sure you want purge the \""+channelName+"\" channel"+(andRemove?" and remove it from tabs":"")+"?\nThis only affects your screen.";
        if (confirmToo || window.confirm(confirmText)){
            $(".chc_"+channelID).remove();
            resetUnreadCount();
            if (andRemove) {
                $("#channelTab"+channelID).remove();
                //delete channelLog[channelID];
                $("#channelTabMain").click();
                $("#channelPreviewWrapper").hide();
            }

        }
    }

    function loadOptions(){
        var stored = localStorage.getItem("ToAOPTS");
        try {
            var parsed = JSON.parse(stored);
            if (typeof parsed.scriptSettings !== "undefined"){
                if (typeof parsed.scriptSettings.purge !== "undefined") {
                    options.scriptSettings.purge = !!parsed.scriptSettings.purge;
                }
                if (typeof parsed.scriptSettings.channel_remove !== "undefined") {
                    options.scriptSettings.channel_remove = !!parsed.scriptSettings.channel_remove;
                }
                if (typeof parsed.scriptSettings.preview !== "undefined") {
                    options.scriptSettings.preview = !!parsed.scriptSettings.preview;
                }
                if (typeof parsed.scriptSettings.preview_reset !== "undefined") {
                    options.scriptSettings.preview_reset = !!parsed.scriptSettings.preview_reset;
                }
                if (typeof parsed.scriptSettings.group_wires !== "undefined") {
                    options.scriptSettings.group_wires = !!parsed.scriptSettings.group_wires;
                }
                if (typeof parsed.scriptSettings.at_username !== "undefined") {
                    options.scriptSettings.at_username = !!parsed.scriptSettings.at_username;
                }
                if (typeof parsed.scriptSettings.join_channel_link !== "undefined") {
                    options.scriptSettings.join_channel_link = !!parsed.scriptSettings.join_channel_link;
                }
                if (typeof parsed.scriptSettings.auto_join !== "undefined") {
                    options.scriptSettings.auto_join = !!parsed.scriptSettings.auto_join;
                }
                if (typeof parsed.scriptSettings.profile_tooltip_nickname !== "undefined") {
                    options.scriptSettings.profile_tooltip_nickname = !!parsed.scriptSettings.profile_tooltip_nickname;
                }
                if (typeof parsed.scriptSettings.profile_tooltip_mention !== "undefined") {
                    options.scriptSettings.profile_tooltip_mention = !!parsed.scriptSettings.profile_tooltip_mention;
                }
                if (typeof parsed.scriptSettings.profile_tooltip_quickscope !== "undefined") {
                    options.scriptSettings.profile_tooltip_quickscope = !!parsed.scriptSettings.profile_tooltip_quickscope;
                }
            }
            if (typeof parsed.channelsSettings !== "undefined" && typeof parsed.version !== "undefined") {
                if (typeof parsed.channelsSettings.mutedChannels !== "undefined" && Array.isArray(parsed.channelsSettings.mutedChannels)) {
                    options.channelsSettings.mutedChannels = parsed.channelsSettings.mutedChannels;
                }
                if (typeof parsed.channelsSettings.channelMerger !== "undefined") {
                    if (typeof parsed.channelsSettings.channelMerger.groups !== "undefined" && Array.isArray(parsed.channelsSettings.channelMerger.groups)) {
                        for (var ccg in parsed.channelsSettings.channelMerger.groups) {
                            var groupName = parsed.channelsSettings.channelMerger.groups[ccg];
                            if (typeof groupName === "string" && options.channelsSettings.channelMerger.groups.indexOf(groupName) === -1) {
                                options.channelsSettings.channelMerger.groups.push(groupName);
                                groupsMap[groupName] = randomName(3,5) + "_" + randomInt(5,9);
                            }
                        }
                    }
                    if (typeof parsed.channelsSettings.channelMerger.mapping !== "undefined" && typeof parsed.channelsSettings.channelMerger.mapping === "object") {
                        options.channelsSettings.channelMerger.mapping = parsed.channelsSettings.channelMerger.mapping;
                    }
                    if (typeof parsed.channelsSettings.channelMerger.defaultChannels !== "undefined" && typeof parsed.channelsSettings.channelMerger.defaultChannels === "object") {
                        options.channelsSettings.channelMerger.defaultChannels = parsed.channelsSettings.channelMerger.defaultChannels;
                    }
                }
            }
            //$.extend(true, options, parsed || {});
            saveOptions();
        } catch(e) {
            localStorage.removeItem("ToAOPTS");
            // console.log(e);
        }
    }

    function createChannelEntry(newChannel, newChannelID, newChannelColor) {
        channelLog[newChannelID] = {
            channelName: newChannel,
            channelID: newChannelID,
            channelColor: newChannelColor,
            messages: 0,
            newMessages: false,
            newMessagesCount: 0,
            muted: options.channelsSettings.mutedChannels.indexOf(newChannel) !== -1
        };
    }

    function loadAllChannels() {
        $("#chatChannel option").each(function(i,e){
            var channelName     = $(e).text();
            var channelInfo     = resolveChannelID(channelName);
            var channelID       = channelInfo.cID;
            var channelColor    = resolveChannelColor(channelID, channelInfo.name);
            if (typeof channelLog[channelID] === "undefined") {
                createChannelEntry(channelInfo.on, channelID, channelColor);
            }
        });
        if (typeof channelLog[GlobalChannel] === "undefined") {
            createChannelEntry("GLOBAL", GlobalChannel, resolveChannelColor(GlobalChannel, "Global"));
        }
        if (typeof channelLog[EventChannel] === "undefined") {
            createChannelEntry("Event", EventChannel, resolveChannelColor(EventChannel, "Event"));
        }
    }

    function quickScopeUser(){
        if (!options.scriptSettings.profile_tooltip_quickscope) {
            return false;
        }
        $("#chatMessage").text("/whois "+$("#profileOptionTooltip").attr("data-username"));
        $("#chatSendMessage").click();
        $("#profileOptionTooltip").hide();
        setTimeout(function(){$("#channelTab"+CMDResposeChannel).click();},1000);
    }

    function mentionUser() {
        if (!options.scriptSettings.profile_tooltip_mention) {
            return false;
        }
        $("#chatMessage").append(" @"+$("#profileOptionTooltip").attr("data-username")).focus();
        $("#profileOptionTooltip").hide();
    }

    function nicknameUser() {
        if (!options.scriptSettings.profile_tooltip_nickname) {
            return false;
        }
        var username = $("#profileOptionTooltip").attr("data-username");
        $.confirm({
            "title"     : "Nickname for "+username,
            "message"   : "<input type=\"text\" id=\"ToASPONicknameName\" style=\"width:100%;\" placeholder=\"Leave blank to unnickname\">",
            "buttons"   : {
                "Nickname"       : {
                    "class"     : "green",
                    "action"    : function() {
                        var newNick = $("#ToASPONicknameName").val();
                        if (newNick.match(/^\s*$/)) {
                            $("#chatMessage").text("/unnickname "+username);
                        } else {
                            $("#chatMessage").text("/nickname "+username+" "+newNick);
                        }
                        $("#chatSendMessage").click();
                    }
                },
                "Cancel"       : {
                    "class"     : "red",
                    "action"    : function() {
                    }
                }
            }
        });
        setTimeout(function() {
            $("#ToASPONicknameName").val("").focus();
        }, 500);
    }

    function isScriptChannel(channelID) {
        return scriptChannels.indexOf(channelID) !== -1;
    }

    function updateGroupName() {
        var newName     = $(this).val();
        var groupID     = $(this).attr("data-gnid");
        var origName    = options.channelsSettings.channelMerger.groups[groupID];
        var origGID     = groupsMap[origName];
        delete groupsMap[origName];
        groupsMap[newName] = origGID;
        options.channelsSettings.channelMerger.groups[groupID] = newName;
        $(this).parent().attr("data-group", newName);
        for (var x in options.channelsSettings.channelMerger.mapping) {
            if (options.channelsSettings.channelMerger.mapping[x] === origName) {
                options.channelsSettings.channelMerger.mapping[x] = newName;
            }
        }
        var groupChannelID = MergedChannelsGroup + "_MCGID_" + groupsMap[newName];
        if (typeof channelLog[groupChannelID] !== "undefined") {
            channelLog[groupChannelID].channelName = newName;
            updateChannelList(channelLog[groupChannelID]);
        }
        saveOptions();
    }

    function addChannelGroup(i, name) {
        var mcgw    = $("<div>").addClass("border2 incsort input-group");

        var mcgigb  = $("<div>").addClass("input-group-btn");

        var mcgdb   = $("<button>").addClass("ToASChMChGRemove btn btn-primary btn-xs ruby");
        var mcgn    = $("<input>").attr({type:"text",name:"mcg_cn"}).addClass("ToASChMmcgName");

        var mcgID = MergedChannelsGroup + "_MCGID_" + groupsMap[name];
        var wrapper = mcgw.clone().attr({"id": mcgID,"data-group": name}).appendTo("#ToASChMMergedChannelsGroupsHolder");

        var igb = mcgigb.clone().appendTo(wrapper);
        mcgdb.clone().attr("data-gnid", i).html("<i class=\"fa fa-times\"></i>").appendTo(igb);
        mcgn.clone().val(name).attr("data-gnid", i).appendTo(wrapper);
    }

    function handleAjaxSuccess(a,res,req,json) {
        var decide = "";
        var valid = ["up", "down"];
        if (json.hasOwnProperty("cs")) {
            if (valid.indexOf(json.cs) !== -1) {

                decide = json.cs;
            }
        } else if (json.hasOwnProperty("p") && json.p.hasOwnProperty("chatScroll")) {
            if (valid.indexOf(json.p.chatScroll) !== -1) {
                decide = json.p.chatScroll;
            }
        }
        if (decide !== "") {
            chatDirection = decide;
        }
    }

    function versionCompare(v1, v2) {
        var regex   = new RegExp("(\.0+)+");
        v1      = v1.replace(regex, "").split(".");
        v2      = v2.replace(regex, "").split(".");
        var min     = Math.min(v1.length, v2.length);

        var diff = 0;
        for (var i = 0; i < min; i++) {
            diff = parseInt(v1[i], 10) - parseInt(v2[i], 10);
            if (diff !== 0) {
                return diff;
            }
        }

        return v1.length - v2.length;
    }

    function loadMessages(t) {
        if ($("#chatChannel option").length > 2) {
            $("#chatMessageList li:not(.processed)").each(function(i,e){
                var plainText       = $(e).text();
                // lets get rid of staff stuff
                plainText           = plainText.replace(/^\[X\]\s*/, "");
                // now clean up spaces
                plainText           = plainText.replace(/\s+/g, " ");
                // default message format [11:11:11] [Channel] (optional) the rest of the message
                var defaultMsg      = plainText.match(/^\[([^\]]+)\]\s*(\[([^\]]+)\])?\s*(.*)/);
                // clan MoTD: [11 Nov, 1111] Clan Message of the Day:
                var isClanMoTD      = plainText.replace(/^\[[0-9]+\s+[a-zA-Z]+\,\s*[0-9]+\]\s*/, "").indexOf("Clan Message of the Day:") === 0;
                // clan MoTD: [11 Nov, 1111] Message of the Day:
                var isRoAMoTD       = plainText.replace(/^\[[0-9]+\s+[a-zA-Z]+\,\s*[0-9]+\]\s*/, "").indexOf("Message of the Day:") === 0;
                // Staff Server Messages [11:11:11] [ Whatever the hell. ]
                var isServerMsg     = plainText.match(/^\[[^\]]+\]\s*\[\s+.*\s+]$/);
                // whisper detection
                var isWhisper       = plainText.match(/^\[[^\]]+\]\s*Whisper\s*(to|from)\s*([^:]+)/);
                isWhisper       = isWhisper && $(this).closest("li").find("span:eq(2)").text().indexOf("Whisper") === 0;
                // wire detection
                var isWire          = plainText.match(/^\[[^\]]+\]\s*(You|[a-zA-Z]+)\s*wired\s*.*\s*(you|[a-zA-Z]+)\.$/);
                // [11:11:11] Username sent a whatever to you.

                var isChatNotif     = $(e).children(".chat_notification").length > 0 || $(e).hasClass("chat_notification");
                var isChatReconnect = $(e).attr("id") === "websocket_reconnect_line";

                var channel = "";
                if (currentChannel.match(/^[0-9]+$/)){
                    channel = channelLog[currentChannel].channelName;
                } else if (currentChannel.indexOf(MergedChannelsGroup) === 0) {
                    channel = channelLog[currentChannel].channelName;
                } else if (scriptChannels.indexOf(currentChannel) !== -1) {
                    channel = channelLog[currentChannel].channelName;
                } else {
                    channel = currentChannel;
                }
                // var channel         = currentChannel=="Main" ? currentChannel : ;
                var channelInfo     = resolveChannelID(channel);

                if (defaultMsg !== null) {
                    channel         = typeof defaultMsg[3] === "undefined" ? "Main" : defaultMsg[3];
                    if (channel !== "Main") {
                        var validate = $(this).closest("li").find("span:eq(2)").text() === "[";
                        var quickscopeinfo = channel.match(/^Level:\s+[0-9]+/);
                        if (!validate && quickscopeinfo === null) {
                            channel = "Main";
                        }
                    }
                    channelInfo     = resolveChannelID(channel);
                }
                if (isClanMoTD) {
                    channel         = "CLAN";
                    channelInfo     = resolveChannelID(channel);
                } else if (isServerMsg){
                    channel         = "Server Messages";
                    channelInfo     = resolveChannelID(channel);
                } else if (isWhisper){
                    channel         = "Whispers Log";
                    channelInfo     = resolveChannelID(channel);
                } else if (isWire && options.scriptSettings.group_wires){
                    channel         = "Wires Log";
                    channelInfo     = resolveChannelID(channel);
                }
                var channelID       = channelInfo.cID;
                channel         = channelInfo.on;
                if (
                    channelID !== CMDResposeChannel &&
                    channelID !== ServerMessagesChannel &&
                    channelID !== WiresChannel &&
                    ( isChatNotif || isChatReconnect)
                ) {

                    channelID       = channelInfo.cID;
                }
                // console.log("chinfo:");
                // console.log(channelInfo);
                if (channelID === CMDResposeChannel){
                    channel         = "Info Channel";
                }
                var channelColor    = resolveChannelColor(channelID, channelInfo.name);

                if (typeof options.channelsSettings.channelMerger.mapping[channel] !== "undefined") {
                    var groupName   = options.channelsSettings.channelMerger.mapping[channel];
                    var groupID     = options.channelsSettings.channelMerger.groups.indexOf(groupName);
                    channelID       = MergedChannelsGroup + "_MCGID_" + groupsMap[groupName];
                    channel         = groupName;
                    channelColor    = randomColor();
                }
                // console.log("cl",currentChannel, "cID", channelID);
                if (currentChannel != channelID){
                    $(e).addClass("hidden");
                } /*else {
                 $(e).show();
                 }*/
                $(e).addClass("processed");
                $(e).addClass("chc_" + channelID);
                if (typeof channelLog[channelID] === "undefined") {
                    createChannelEntry(channel, channelID, channelColor);
                    /*channelLog[channelID] = {
                     channelName: channel,
                     channelID: channelID,
                     channelColor: channelColor,
                     messages: 0,
                     newMessages: false,
                     newMessagesCount: 0,
                     muted: options.channelsSettings.mutedChannels.indexOf(channel) !== -1
                     };*/
                }
                if (channelID != currentChannel){
                    channelLog[channelID].newMessages = true;
                    channelLog[channelID].newMessagesCount++;
                }
                channelLog[channelID].messages++;
                if (options.channelsSettings.mutedChannels.indexOf(channel) !== -1){
                    $(e).remove();
                }

                if (options.scriptSettings.at_username) {
                    $(e).html($(e).html().replace(/\@([a-zA-Z]+)/g,"@<a class=\"profileLink\">$1</a>"));
                }

                if (options.scriptSettings.join_channel_link) {
                    $(e).html($(e).html().replace(/\/join\s+([^\s]+)\s*([^\s<]+)?/, "/join <a class=\"joinChannel\">$1</a> <span class=\"jcPWD\">$2</span>"));
                }

                updateChannelList(channelLog[channelID]);
            });
        }

        if (typeof t === "undefined") {
            setTimeout(loadMessages, 500);
        }
        if ($("#chatWrapper>div:nth-child(2)").attr("id") === "chatMessageWrapper") {
            $("#channelTabListWrapper").insertBefore("#chatMessageListWrapper");
        }
    }

    function init() {
        loadOptions();
        loadDependencies();
        prepareHTML();
        addSettingsTab();
        loadMessages();

        $("#channelTabListWrapper").mCustomScrollbar({axis:"x",advanced:{autoExpandHorizontalScroll:true}});
        $("#channelTabList").sortable({items:".channelTab",distance: 5});
        $("#channelTabList").disableSelection();
        setTimeout(function(){$("#channelTabList > div:nth-child(2)").click();},2000);
    }

    $(document).on("ajaxSuccess", handleAjaxSuccess);

    $(document).on("change", ".settingsChanger", function(e){
        changeSetting(this);
    });

    $(document).on("click", ".channelTab", function(e){
        $(".channelTab").removeClass("chTabSelected");
        var channelID = $(this).attr("data-channel");
        channelLog[channelID].newMessages = false;
        channelLog[channelID].newMessagesCount = 0;
        updateChannelList(channelLog[channelID]);
        // $(".processed").hide();
        $("#chatMessageList > li:not(.hidden)").addClass("hidden");
        $(".chc_"+channelID).removeClass("hidden");
        $("#channelTab"+channelID).addClass("chTabSelected");
        $("#channelPreviewWrapper").hide();
        currentChannel = channelID;
        if (channelID.match(/^[0-9]+$/) === null) {
            var groupName = channelLog[channelID].channelName;
            if (options.channelsSettings.channelMerger.groups.indexOf(groupName) !== -1) {
                if (typeof options.channelsSettings.channelMerger.defaultChannels[groupName] !== "undefined") {
                    channelID = resolveChannelID(options.channelsSettings.channelMerger.defaultChannels[groupName]).cID;
                }
            }
        }
        var channelOption = $("#chatChannel option[value="+channelID+"]");
        if (channelOption.length > 0){
            $("#chatChannel").val(channelID);
        }
        if (chatDirection === "down") {
            setTimeout(function(){
                $("#chatMessageListWrapper").mCustomScrollbar("scrollTo",  "bottom");
            }, 500);
        }
    });

    $(document).on("click", "#CPAReset, #chTabCTMenuReset", function(){
        resetUnreadCount();
    });

    $(document).on("click", "#CPAReset, #chTabCTMenuLast", function(){
        var channelName = channelLog[hoveringOverTab].channelName;
        var msg = "/last "+channelName;
        if (channelName === "CLAN") {
            msg = "/c /last";
        } else if (options.channelsSettings.channelMerger.groups.indexOf(channelName) !== -1) {
            if (typeof options.channelsSettings.channelMerger.defaultChannels[channelName] !== "undefined") {
                msg = "/last " + options.channelsSettings.channelMerger.defaultChannels[channelName];
            }
        } else if (channelName === "Whispers Log") {
            msg = "/w /last";
        } else if (scriptChannels.indexOf(hoveringOverTab) !== -1) {
            return false;
        }
        $("#chatMessage").text(msg);
        $("#chatSendMessage").click();
    });

    $(document).on("click", "#CPAPurge, #chTabCTMenuPurge", function(){
        var confirmToo = $(this).attr("id") === "chTabCTMenuPurge";
        purgeChannel(false, confirmToo);
    });

    $(document).on("click", "#CPARemove, #chTabCTMenuRemove", function(){
        var confirmToo = $(this).attr("id") === "chTabCTMenuRemove";
        purgeChannel(true, confirmToo);
    });

    $(document).on("click", "#chTabCTMenuLeave", function(){
        var channelName = channelLog[hoveringOverTab].channelName;
        purgeChannel(true, true);
        $("#chatMessage").text("/leave " + channelName);
        $("#chatSendMessage").click();
    });

    $(document).on("click", "#chTabCTMenuColor", function(){
        if (hoveringOverTab.indexOf(MergedChannelsGroup) !== -1) {
            var color = randomColor();
            channelLog[hoveringOverTab].channelColor = color;
            updateChannelList(channelLog[hoveringOverTab]);
        } else {
            $.alert("Tab color change failed! Please try again!", "Group tab color change");
        }
    });

    $(document).on("click", "#chTabCTMenuMute", function(){
        if (typeof hoveringOverTab === "undefined"){
            return;
        }
        var channel = channelLog[hoveringOverTab].channelName;
        if (options.channelsSettings.mutedChannels.indexOf(channel) === -1) {
            options.channelsSettings.mutedChannels.push(channel);
            saveOptions();
        }
        channelLog[hoveringOverTab].muted = true;
        updateChannelList(channelLog[hoveringOverTab]);
    });

    $(document).on("click", "#chTabCTMenuUnMute", function(){
        if (typeof hoveringOverTab === "undefined"){
            return;
        }
        var channel = channelLog[hoveringOverTab].channelName;
        var pos = options.channelsSettings.mutedChannels.indexOf(channel);
        if (pos !== -1) {
            options.channelsSettings.mutedChannels.splice(pos,1);
            saveOptions();
        }
        channelLog[hoveringOverTab].muted = false;
        updateChannelList(channelLog[hoveringOverTab]);
    });

    $(document).on("mouseover", ".channelTab", function(e){
        clearTimeout(hovering);
        var channelID       = $(this).attr("data-channel");
        hoveringOverTab     = channelID;
        if (!options.scriptSettings.preview){
            return;
        }
        var channelName     = channelLog[channelID].channelName;

        var channelPreviewWrapper = $("#channelPreviewWrapper");

        var channelTabHolder    = $(this);

        var cssOptions = {
            top: ($(this).offset().top + 25)+"px"
        };
        var previewContent = "There are no new messages in this channel!";
        if (channelLog[channelID].newMessages === true) {
            var previewMessages = [];
            $(".chc_"+channelID).each(function(i,e){
                if (i < channelLog[channelID].newMessagesCount){
                    previewMessages.push($(e).html());
                }
            });
            previewContent = previewMessages.join("<br>");
        }

        $("#channelPreviewMessages").html(previewContent);

        if ($(this).offset().left > $(document).width() / 2){
            cssOptions.left = ($(this).offset().left - channelPreviewWrapper.width() + 50)+"px";
        } else {
            cssOptions.left = ($(this).offset().left + 50)+"px";
        }
        channelPreviewWrapper
            .css(cssOptions)
            .children("h5")
            .text("'"+channelName+"' preview");

        if (options.scriptSettings.preview_reset){
            $("#CPAReset").show();
        } else {
            $("#CPAReset").hide();
        }
        if (options.scriptSettings.purge){
            $("#CPAPurge").show();
        } else {
            $("#CPAPurge").hide();
        }
        if (options.scriptSettings.channel_remove){
            $("#CPARemove").show();
        } else {
            $("#CPARemove").hide();
        }
    });

    $(document).on("mouseover", function(e){
        clearTimeout(hovering);
        if (typeof hoveringOverTab !== "undefined" && typeof channelLog[hoveringOverTab] !== "undefined") {

            var channelTab              = $("#channelTab" + hoveringOverTab);
            var channelPreviewWrapper   = $("#channelPreviewWrapper");
            var shouldShow              = channelLog[hoveringOverTab].newMessages === true;
            var OpenAndKeep             = $(e.target).closest(channelTab).length || $(e.target).closest(channelPreviewWrapper).length;
            var delay                   = OpenAndKeep ? 500 : 250;
            hovering = setTimeout(function(){
                if (options.scriptSettings.preview && OpenAndKeep && shouldShow) {
                    channelPreviewWrapper.show(0, function(){
                        if (chatDirection === "down") {
                            $("#channelPreviewContent").mCustomScrollbar("scrollTo",  "bottom");
                        }
                    });


                } else {
                    channelPreviewWrapper.hide();
                }
            }, delay);
        }
    });

    $(document).on("contextmenu", ".channelTab", function(e){
        e.preventDefault();
        var cssOptions = {
            top: e.pageY+"px"
        };

        if ($(this).offset().left > $(document).width() / 2){
            cssOptions.left = (e.pageX - $(this).width())+"px";
        } else {
            cssOptions.left = e.pageX+"px";
        }

        if (options.scriptSettings.preview_reset){
            $("#chTabCTMenuReset").show();
        } else {
            $("#chTabCTMenuReset").hide();
        }
        if (options.scriptSettings.purge){
            $("#chTabCTMenuPurge").show();
        } else {
            $("#chTabCTMenuPurge").hide();
        }
        if (options.scriptSettings.channel_remove){
            $("#chTabCTMenuRemove").show();
        } else {
            $("#chTabCTMenuRemove").hide();
        }

        if (options.channelsSettings.mutedChannels.indexOf(channelLog[hoveringOverTab].channelName) !== -1){
            $("#chTabCTMenuUnMute").show();
            $("#chTabCTMenuMute").hide();
        } else {
            $("#chTabCTMenuMute").show();
            $("#chTabCTMenuUnMute").hide();
        }

        if (hoveringOverTab.match(/^[a-z]+/i)) {
            $("#chTabCTMenuLeave").hide();
            if (hoveringOverTab.indexOf(MergedChannelsGroup) !== -1) {
                $("#chTabCTMenuColor").show();
            } else {
                $("#chTabCTMenuColor").hide();
            }
        } else {
            $("#chTabCTMenuColor").hide();
            $("#chTabCTMenuLeave").show();
        }

        if (scriptChannels.indexOf(hoveringOverTab) !== -1 && hoveringOverTab !== WhispersChannel) {
            $("#chTabCTMenuLast").hide();
        } else {
            $("#chTabCTMenuLast").show();
        }
        // $("#chTabCTMenuColor").hide();

        $("#channelTabContextMenu").css(cssOptions).show();
        $("#channelPreviewWrapper").hide();
        return false;
    });

    $(document).on("click", "#ToASettings", function(){
        $("#modalBackground").show();
        $("#ToASettingsWindow").show();
        loadAllChannels();

        /**
         * load muted channel
         */

        var mchw    = $("<span>").addClass("ChMChannelWrapper border2");
        var mchx    = $("<span>").addClass("ChMMChX ui-element fa fa-times ruby");

        $("#ToASChMMutedChannelsHolder").html("");
        $("#ToASChMMergedChannelsHolder").html("");
        $("#ToASChMMergedChannelsGroupsHolder").html("");
        var channelName = "";
        for (var i in options.channelsSettings.mutedChannels) {
            channelName = options.channelsSettings.mutedChannels[i];
            var holder      = mchw.clone().append(channelName).appendTo("#ToASChMMutedChannelsHolder");
            mchx.clone().attr("data-channel", channelName).prependTo(holder);
        }
        channelName = "";

        $("#ToASChMMergedChannelsGroupsHolder").html("");
        for (var j in options.channelsSettings.channelMerger.groups){
            var mcggn = options.channelsSettings.channelMerger.groups[j];
            addChannelGroup(j, mcggn);
        }
        for (var channelID in channelLog) {
            if (!channelID.match(/^[0-9]+$/)) {
                continue;
            }
            var channelInfo     = channelLog[channelID];
            channelName     = channelInfo.channelName;
            var channelBlob     = mchw.clone().attr("data-channel", channelName).text(channelName);
            if (typeof options.channelsSettings.channelMerger.mapping[channelName] !== "undefined") {
                var grouppedInto    = options.channelsSettings.channelMerger.mapping[channelName];
                var mcgGroupID      = options.channelsSettings.channelMerger.groups.indexOf(grouppedInto);
                mcgGroupID      = MergedChannelsGroup + "_MCGID_" + groupsMap[grouppedInto];
                if (options.channelsSettings.channelMerger.defaultChannels[grouppedInto] === channelName) {
                    channelBlob.insertAfter("#"+mcgGroupID+" > input");
                } else {
                    channelBlob.appendTo("#"+mcgGroupID);
                }
            } else {
                channelBlob.appendTo("#ToASChMMergedChannelsHolder");
            }
        }
        channelName = "";
        $(".incsort").sortable({
            items: "span",
            connectWith: ".incsort",
            receive: function(i,e) {
                channelName = $(e.item[0]).attr("data-channel");
                var groupName   = $(this).attr("data-group");
                if (typeof groupName === "undefined") {
                    delete options.channelsSettings.channelMerger.mapping[channelName];
                } else {
                    options.channelsSettings.channelMerger.mapping[channelName] = groupName;
                }
                saveOptions();
            },
            update: function(i,e){
                var groupName   = $(this).attr("data-group");
                if (typeof groupName !== "undefined") {
                    var channels = $(i.target).children("span");
                    var channelName = $(channels[0]).attr("data-channel");
                    options.channelsSettings.channelMerger.defaultChannels[groupName] = channelName;
                    saveOptions();
                } // else branch makes no sense :)
            }
        }).disableSelection();
    });

    $(document).on("click", ".ChMMChX", function(){
        var channel             = $(this).attr("data-channel");
        var channelID           = resolveChannelID(channel).cID;
        channelLog[channelID].muted  = false;
        updateChannelList(channelLog[channelID]);
        var pos = options.channelsSettings.mutedChannels.indexOf(channel);
        if (pos !== -1) {
            options.channelsSettings.mutedChannels.splice(pos,1);
        }
        $(this).parent().fadeOut("slow", function(){
            $(this).remove();
        });
        saveOptions();
    });

    $(document).on("click", ".joinChannel", function(){
        // trim(",");
        var chn = $(this).text().replace(/^,+|,+$/gm,"");
        $("#chatMessage").text("/join "+ chn);
        var pwd = $(this).parent().find(".jcPWD").text();
        $("#chatMessage").append(" " + pwd);
        if (options.scriptSettings.auto_join) {
            $("#chatSendMessage").click();
        }
    });

    $(document).on("click", function(e){
        $("#channelTabContextMenu").hide();
        var settings = $("#ToASettingsWindow");
        if (
            !$(e.target).closest("#ToASettingsWindow").length &&
            !$(e.target).closest("#ToASettings").length &&
            !$(e.target).closest("#confirmOverlay").length &&
            !$(e.target).closest(".replenishStamina").length ||
            $(e.target).closest("#ToASettingsWindowClose").length) {

            settings.hide();
            $("#ToASettingsChannelMerger").hide();
            $("#ToASettingsScriptSettings").hide();
            if ($(e.target).closest("#ToASettingsWindowClose").length) {
                $("#modalBackground").fadeOut();
            }
        }
    });

    $(document).on("click", "#ToAScriptOptions, #ToAChannelMerger", function(){
        var id = $(this).attr("id");
        if (id === "ToAScriptOptions") {
            $("#ToASettingsChannelMerger").slideUp(function(){
                $("#ToASettingsScriptSettings").slideDown();
            });
        } else {
            $("#ToASettingsScriptSettings").slideUp(function(){
                $("#ToASettingsChannelMerger").slideDown();
            });
        }
    });

    $(document).on("click", "#profileOptionQuickScope", quickScopeUser);
    $(document).on("click", "#profileOptionAt", mentionUser);
    $(document).on("click", "#profileOptionNick", nicknameUser);

    $(document).on("keydown", function(e){
        var keys = {
            Q: 81, // [Q]uickscope
            C: 67, // Ni[c]kname
            E: 69 // @m[e]ntion
        };
        var key = e.which;
        if ($("#profileOptionTooltip").css("display")==="block") {

            if (key === keys.Q) {
                quickScopeUser();
            } else if (key === keys.E) {
                mentionUser();
                e.preventDefault();
            } else if (key === keys.C) {
                nicknameUser();
            }
        }
    });

    // on blur ... hmm
    $(document).on("change", ".ToASChMmcgName", updateGroupName);

    $(document).on("click", "#ToASChMAddGroup", function(){
        $.confirm({
            "title"     : "New Group Name",
            "message"   : "<input type=\"text\" id=\"ToASChMNewgroupName\" style=\"width:100%;\">",
            "buttons"   : {
                "Create"       : {
                    "class"     : "green",
                    "action"    : function() {
                        var groupName = $("#ToASChMNewgroupName").val();
                        if (groupName.match(/^\s*$/)){
                            groupName = randomName(7,13);
                        }
                        options.channelsSettings.channelMerger.groups.push(groupName);
                        groupsMap[groupName] = randomName(3,5) + "_" + randomInt(5,9);
                        $("#ToASettings").click();
                    }
                },
                "Cancel"       : {
                    "class"     : "red",
                    "action"    : function() {
                    }
                }
            }
        });
        $("#ToASChMNewgroupName").focus();
    });

    $(document).on("click", ".ToASChMChGRemove", function() {
        var elem = $(this);
        $.confirm({
            "title"     : "Group Delete Confirmation",
            "message"   : "Are you sure you want to remove this channel group?",
            "buttons"   : {
                "Yes"       : {
                    "class"     : "green",
                    "action"    : function() {
                        var groupID = elem.attr("data-gnid");

                        var groupName = options.channelsSettings.channelMerger.groups[groupID];

                        for (var x in options.channelsSettings.channelMerger.mapping) {
                            if (options.channelsSettings.channelMerger.mapping[x] === groupName) {
                                delete options.channelsSettings.channelMerger.mapping[x];
                            }
                        }

                        options.channelsSettings.channelMerger.groups.splice(groupID, 1);

                        var groupChannelID = MergedChannelsGroup + "_MCGID_" + groupsMap[groupName];
                        $("#channelTab"+groupChannelID).remove();
                        delete channelLog[groupChannelID];
                        delete groupsMap[groupName];
                        delete options.channelsSettings.channelMerger.defaultChannels[groupName];
                        $("#chatMessageList li").attr("class", "");
                        saveOptions();
                        $("#channelTabList > div:nth-child(2)").click();
                        loadMessages("reload");
                        $("#ToASettings").click();
                    }
                },
                "No"       : {
                    "class"     : "red",
                    "action"    : function() {
                    }
                }
            }
        });
    });

    module.enable = function () {
        init();
    };

    modules.chatTabs = module;

})(modules.jQuery);(function ($) {
    'use strict';

    var module = {};

    module.enable = function () {
        modules.observers.chat_whispers.observe(document.querySelector("#chatMessageList"), {
            childList: true
        });
    };

    modules.chatWhisperMonitor = module;

})(modules.jQuery);(function ($) {
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
        if(modules.constants.ENABLE_CLAN_DONATION_TABLE_MOD)
            addClanDonationMod();
    }

    module.enable = function () {
        initialize();

        modules.ajaxHooks.register("clan_donations.php", parseClanDonationsPhp);
    };

    modules.clanDonations = module;

})(modules.jQuery);(function ($) {
    'use strict';

    var module = {};

    const MY_WALL_COLOR = "#ff0000";
    const STORAGE_KEY = "dungeon";
    const DUNGEON_MAP_VERSION = 0.1;

    /**********************************************************/
    /*              NO NEED TO EDIT FURTHER                  */
    /*  ABOVE SETTING WILL NOT BE CARIED OVER SCRIPT UPDATES  */
    /**********************************************************/

    var WALL_COLOR = MY_WALL_COLOR;

    var initialize = function () {
        dungeon = { r:{}, cf:0, ct:null, v: DUNGEON_MAP_VERSION };
        localStorage.setItem(STORAGE_KEY, dungeon);
    };

    var dungeon = localStorage.getItem(STORAGE_KEY);
    if(dungeon == null) {
        initialize();
    } else {
        try {
            dungeon = JSON.parse(dungeon);
            if(dungeon == null || dungeon.v == null || dungeon.v != DUNGEON_MAP_VERSION)
            {
                initialize();
            }
        }catch (e) {
            initialize();
        }
    }

    function onLeaveDungeon() {
        initialize();
    }

    function onUpdateDungeon(e, res, req, jsonres) {
        if (jsonres.hasOwnProperty("data") && jsonres.data.hasOwnProperty("map")) {
            if (dungeon.cf !== jsonres.data.floor) {
                dungeon.r = {};
                dungeon.cf = jsonres.data.floor;
            }
            var jrd = jsonres.data;
            var data = {};
            var token = $(jrd.map).text().replace("↓", "v"); // map
            token = btoa(JSON.stringify(token)); // token
            if (dungeon.r.hasOwnProperty(token)) {
                data = JSON.parse(JSON.stringify(dungeon.r[token]));
            } else {
                data.pe = "";
                data.ps = "";
                data.pn = "";
                data.pw = "";
                data.t  = token;
            }
            if (dungeon.ct === null) {
                dungeon.ct = token;
            }

            data.e = jrd.e?1:0; // east
            data.s = jrd.s?1:0; // south
            data.n = jrd.n?1:0; // north
            data.w = jrd.w?1:0; // west
            data.r = !!jrd.search; // raided
            data.b = Object.keys(jrd.enemies).length; // battles available

            dungeon.r[data.t] = data;

            var walk = jsonres.hasOwnProperty("m") && jsonres.m.match(/You walked (east|south|north|west)/);
            walk = walk ? jsonres.m.match(/You walked (east|south|north|west)/) : false;
            if (walk !== false) {
                walk = walk[1].match(/^./)[0];
                if (dungeon.ct !== data.t) {
                    if (typeof dungeon.r[dungeon.ct] !== "undefined") {
                        dungeon.r[dungeon.ct]["p"+walk] = data.t;
                        var sm = {
                            "s": "n",
                            "n": "s",
                            "e": "w",
                            "w": "e"
                        };
                        dungeon.r[data.t]["p"+sm[walk]] = dungeon.ct;
                    }
                    dungeon.ct = data.t;
                }
            }
            localStorage.setItem("dungeon", JSON.stringify(dungeon));
            updateDungeonMap(false);
        } else {
            updateDungeonMap(req.url.indexOf("dungeon_") === -1);
        }
    }

    var dmc, dmctx, dmv;
    function updateDungeonMap(hide) {
        var d = JSON.parse(JSON.stringify(dungeon));
        if ($("#dungeonMapCanvas").length === 0) {
            var h = $("<div>")
                .attr("id", "dMCW")
                .css({position:"absolute",top:0,left:0})
                .addClass("border2 ui-component")
                .appendTo("body");
            $("<canvas>").attr({
                id: "dungeonMapCanvas",
                width: "325",
                height: "325"
            }).appendTo("#dMCW");
            h.draggable({handle:"#dungeonMapCanvas"}).resizable({stop:function(e,d){$("#dungeonMapCanvas").attr({width:d.size.width,height:d.size.height});updateDungeonMap(false);}});
            dmc = document.getElementById("dungeonMapCanvas");
            dmctx = dmc.getContext("2d");
        }
        if (hide === false) {
            $("#dMCW").show();
            dmv = [];
            dmctx.clearRect(0,0,dmc.width,dmc.height);
            drawTile(d.ct, Math.floor(dmc.width/2), Math.floor(dmc.height/2), 1);
        } else {
            $("#dMCW").hide();
        }
    }

    function drawTile(id, x, y, player) {
        if (typeof player === "undefined") {
            player = 0;
        }

        if (dmv.indexOf(id) !== -1) {
            return;
        }
        var tile = dungeon.r[id];
        dmv.push(id);

        // console.log(id,x,y);
        // console.log(JSON.stringify(tile, null, "\t"));

        dmctx.fillStyle = "#333";
        dmctx.fillRect(x-4, y-4, 10, 10);

        drawTileWall(x,y,"top", !tile.n);
        drawTileWall(x,y,"left", !tile.w);
        drawTileWall(x,y,"right", !tile.e);
        drawTileWall(x,y,"bot", !tile.s);

        if (tile.r) {
            dmctx.fillStyle     = "#ffd700";
            dmctx.strokeStyle   = "#ffd700";
            dmctx.arc(x,y,2, 0, 2*Math.PI);
            dmctx.fill();
        }

        if (tile.b > 0) {
            dmctx.fillStyle     = "#ff0000";
            dmctx.strokeStyle   = "#ff0000";
            dmctx.arc(x,y,2, 0, 2*Math.PI);
            dmctx.fill();
        }

        if (player === 1) {
            dmctx.fillStyle     = "#ffffff";
            dmctx.strokeStyle   = "#ffffff";
            dmctx.arc(x,y,2, 0, 2*Math.PI);
            dmctx.fill();
        }

        if (tile.n === 1 && tile.pn !== "") {
            // console.log(tile.pn);
            drawTile(tile.pn, x, y-10);
        }
        if (tile.w === 1 && tile.pw !== "") {
            // console.log(tile.pw);
            drawTile(tile.pw, x-10, y);
        }
        if (tile.e === 1 && tile.pe !== "") {
            // console.log(tile.pe);
            drawTile(tile.pe, x+10, y);
        }
        if (tile.s === 1 && tile.ps !== "") {
            // console.log(tile.ps);
            drawTile(tile.ps, x, y+10);
        }
    }

    function drawTileWall(x,y,which, blocked) {
        if (blocked) {
            dmctx.strokeStyle = WALL_COLOR;
            dmctx.fillStyle   = "#ffffff";
        } else {
            dmctx.strokeStyle = "#333";
            return;
        }
        dmctx.beginPath();
        if (which === "top") {
            dmctx.moveTo(x-5, y-5);
            dmctx.lineTo(x+5, y-5);
        } else if (which === "left") {
            dmctx.moveTo(x-5, y-5);
            dmctx.lineTo(x-5, y+5);
        } else if (which === "right") {
            dmctx.moveTo(x+5, y+5);
            dmctx.lineTo(x+5, y-5);
        } else if (which === "bot") {
            dmctx.moveTo(x-5, y+5);
            dmctx.lineTo(x+5, y+5);
        }
        dmctx.stroke();
        dmctx.closePath();
    }

    module.enable = function () {
        modules.ajaxHooks.register("dungeon_leave.php", onLeaveDungeon);
        modules.ajaxHooks.register("dungeon_info.php", onUpdateDungeon);
        modules.ajaxHooks.register("dungeon_move.php", onUpdateDungeon);
        modules.ajaxHooks.register("dungeon_search.php", onUpdateDungeon);
    };

    modules.dungeonMap = module;

})(modules.jQuery);(function ($) {
    'use strict';

    var module = {};

    module.enable = function () {
        if (modules.settings.settings.features.house_timer) {
            $.get(modules.constants.URLS.html.house_timers).done(function (r) {
                const $timer = $(r),
                    $body = $("body");

                $("#houseTimerInfo").addClass("avi-force-block");
                $body.append("<style>#constructionNotifier,#houseTimerTable [data-typeid='Construction']{display:none!important}</style>");
                $("#houseTimerTable").prepend($timer);
                modules.constants.$DOM.house_monitor.status = $("#avi-house-construction").click(modules.handlers.click.house_state_refresh);
                modules.observers.house_status.observe(document.querySelector("#house_notification"), {
                    childList: true,
                    characterData: true
                });
                $(document).ajaxComplete(modules.request.proto.callbacks.success.house_requery);
                $.get("/house.php")
            });
        } else {
            console.log("(skipped due to user settings)");
        }
    };

    modules.houseMonitor = module;

})(modules.jQuery);(function ($) {
    'use strict';

    var module = {};

    var initialize = function () {
        // Tooltips
        $.get(modules.constants.URLS.html.market_tooltip).done(function (r) {
            modules.constants.$DOM.market.market_tooltip = r;

            const $tooltipTable = $(r);

            $tooltipTable.find("th[colspan]").append(modules.constants.$AJAX_SPINNERS.currency_tooltip);
            modules.constants.$DOM.currency_tooltip.table_row = $tooltipTable.find("tr[data-id=prices]");
            modules.constants.$DOM.currency_tooltip.market_low = modules.constants.$DOM.currency_tooltip.table_row.find(">td").first();
            modules.constants.$DOM.currency_tooltip.market_avg = modules.constants.$DOM.currency_tooltip.market_low.next();
            modules.constants.$DOM.currency_tooltip.market_high = modules.constants.$DOM.currency_tooltip.market_avg.next();

            //Add our stuff to the currency tooltips
            modules.constants.$DOM.currency_tooltip.the_tooltip.append($tooltipTable);

            modules.observers.currency_tooltips.observe(modules.constants.$DOM.currency_tooltip.the_tooltip[0], {
                attributes: true
            });

            modules.observers.inventory_table.observe(document.querySelector("#inventoryTable"), {
                childList: true,
                characterData: true
            });
        });

        // Market shortcuts
        $("#allThemTables").find(".currencyWithTooltip:not(:contains(Gold))").css("cursor", "pointer")
            .click(modules.handlers.click.topbar_currency);
    };

    module.enable = function () {
        initialize();
    };

    modules.marketTooltips = module;

})(modules.jQuery);(function ($) {
    'use strict';

    var module = {};

    module.enable = function () {
        $.get(modules.constants.URLS.html.settings_modal).done(function (r) {
            modules.constants.$DOM.modal.script_settings = $(r);
            $("#modalContent").append(modules.constants.$DOM.modal.script_settings);
            modules.utils.tabify(modules.constants.$DOM.modal.script_settings);

            modules.constants.$DOM.modal.script_settings.find('[data-setting="notifications"]')
                .each(modules.handlers.each.settings_notification)
                .change(modules.handlers.change.settings_notification);

            modules.constants.$DOM.modal.script_settings.find('[data-setting="features"]')
                .each(modules.handlers.each.settings_features)
                .change(modules.handlers.change.settings_feature);

            modules.observers.script_settings.observe(modules.constants.$DOM.modal.modal_wrapper[0], {attributes: true});
        });
    };

    modules.uiSettings = module;

})(modules.jQuery);(function ($) {
    'use strict';

    var module = {};

    module.enable = function () {
        const $helpSection = $("#helpSection"),
            $menuLink = $('<a href="javascript:;"/>')
                .html('<li class="active">' + GM_info.script.name + " " + GM_info.script.version + '</li>')
                .click(modules.handlers.click.script_menu),
            $appends = {
                battle: $("<a href='javascript:;' data-delegate-click='#loadMobList' class='avi-tip avi-menu-shortcut' title='Open Battles'/>"),
                fishing: $("<a href='javascript:;' data-delegate-click='#loadFishing' class='avi-tip avi-menu-shortcut' title='Open Fishing'/>"),
                wc: $("<a href='javascript:;' data-delegate-click='#loadWoodcutting' class='avi-tip avi-menu-shortcut' title='Open Woodcutting'/>"),
                mine: $("<a href='javascript:;' data-delegate-click='#loadMining' class='avi-tip avi-menu-shortcut' title='Open Ironing (lol)'/>"),
                quarry: $("<a href='javascript:;' data-delegate-click='#loadStonecutting' class='avi-tip avi-menu-shortcut' title='Open Stoners'/>")
            };

        $helpSection.append($menuLink);
        $("#navWrapper").css("padding-top", $menuLink.height()).find("ul")
            .append(
                $('<li class="avi-menu"/>')
                    .append($appends.battle)
                    .append($appends.fishing)
                    .append($appends.wc)
                    .append($appends.mine)
                    .append($appends.quarry)
            );

        modules.utils.svg($appends.battle, modules.constants.URLS.svg.sword_clash);
        modules.utils.svg($appends.fishing, modules.constants.URLS.svg.fishing);
        modules.utils.svg($appends.wc, modules.constants.URLS.svg.log);
        modules.utils.svg($appends.mine, modules.constants.URLS.svg.metal_bar);
        modules.utils.svg($appends.quarry, modules.constants.URLS.svg.stone_block);
    };

    modules.uiSideMenu = module;

})(modules.jQuery);(function ($) {
    'use strict';

    var module = {};

    module.enable = function () {
        $(".avi-tip").tooltip({
            container: "body",
            viewport: {"selector": "body", "padding": 0}
        });
        $("[data-delegate-click]").click(modules.handlers.click.delegate_click);
    };

    modules.uiTooltips = module;

})(modules.jQuery);//Check if the user can even support the bot
if (typeof(window.sessionStorage) === "undefined") {
    toast.incompatibility("Session storage");
} else if (typeof(MutationObserver) === "undefined") {
    toast.incompatibility("MutationObserver");
} else {

    // utility and core modules go first
    modules.cache.enable();
    modules.css.enable();
    modules.toast.enable();
    modules.trackers.enable();
    modules.ajaxHooks.enable();

    // Automation
    modules.automateStamina.enable();

    // Chart
    modules.chartWindow.enable();

    // Chat
    modules.chatPeopleColor.enable();
    modules.chatTabs.enable();
    modules.chatWhisperMonitor.enable();

    // Clan
    modules.clanDonations.enable();

    // Dungeon
    modules.dungeonMap.enable();

    // House
    modules.houseMonitor.enable();

    // Market
    modules.marketTooltips.enable();

    // UI
    modules.uiSideMenu.enable();
    modules.uiSettings.enable();
    modules.uiTooltips.enable();
}
