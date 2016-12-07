// ==UserScript==
// @name           RoAExt
// @namespace      org.craiel.avaburextended
// @author         Craiel
// @homepage       https://github.com/Craiel/RoAExt
// @description    Extension for Avabur
// @include        https://avabur.com/game.php
// @include        http://avabur.com/game.php
// @include        https://www.avabur.com/game.php
// @include        http://www.avabur.com/game.php
// @version        0.8
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
// @require        https://cdnjs.cloudflare.com/ajax/libs/buzz/1.1.10/buzz.min.js
// @require        https://cdnjs.cloudflare.com/ajax/libs/spectrum/1.8.0/spectrum.min.js
// @require        https://cdnjs.cloudflare.com/ajax/libs/canvasjs/1.7.0/jquery.canvasjs.min.js
// @require        https://cdnjs.cloudflare.com/ajax/libs/jquery-te/1.4.0/jquery-te.min.js


// @noframes
// ==/UserScript==
'use strict';

const modules = {
    jQuery: jQuery
};function RoAModule(name) {
    this.name = name;
}

RoAModule.prototype = {
    name: "NO_NAME",
    loaded: false,
    load: function () {
        this.loaded = true;

        var loadString = " - Loaded Module " + this.name;

        if(modules.logger) {
            modules.logger.log(loadString);
        } else {
            console.log(loadString);
        }
    }
};

Object.spawn = function (parent, props) {
    var defs = {}, key;
    for (key in props) {
        if (props.hasOwnProperty(key)) {
            defs[key] = {value: props[key], enumerable: true, configurable: true, writable: true};
        }
    }
    return Object.create(parent, defs);
};(function ($) {
    'use strict';

    const RequestAutoSendCheckFrequency = 100;
    const RequestSendThreshold = 500; // the time where we will warn about frequent requests to the same page

    var rcvForwards = [];
    var forwards = [];
    var targetedForwards = {};
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

        for(var entry in targetedForwards) {
            if(req.url === entry) {
                for (var i = 0; i < targetedForwards[entry].length; i++) {
                    targetedForwards[entry][i](e, res, req, jsonData);
                }

                break;
            }
        }

        for (var i = 0; i < forwards.length; i++) {
            forwards[i](e, res, req, jsonData);
        }
    }
    
    function onAjaxSendPending(event, jqxhr, options) {
        for (var i = 0; i < rcvForwards.length; i++) {
            rcvForwards[i](event, jqxhr, options);
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

    function AjaxHooks() {
        RoAModule.call(this, "Ajax Hooks");
    }

    AjaxHooks.prototype = Object.spawn(RoAModule.prototype, {
        registerAutoSend: function (url, payload, interval) {
            if(autoRequests[url]) {
                console.error("Url " + url + " is already registered for auto send!");
                return;
            }

            autoRequests[url] = { payload: payload, interval: interval, locked: false };
        },
        register: function(site, callback) {
            if(!targetedForwards[site]) {
                targetedForwards[site] = [];
            }

            targetedForwards[site].push(callback);
        },
        registerAll: function (callback) {
            forwards.push(callback);
        },
        registerRcvAll: function (callback) {
            rcvForwards.push(callback);
        },
        load: function () {
            $(document).on("ajaxSend", onAjaxSendPending);
            $(document).on("ajaxSuccess", onAjaxSuccess);

            modules.createInterval("ajaxHooksAutoSend").set(autoSendAjaxRequests, RequestAutoSendCheckFrequency);

            RoAModule.prototype.load.apply(this);
        }
    });

    AjaxHooks.prototype.constructor = AjaxHooks;

    modules.ajaxHooks = new AjaxHooks();

})(modules.jQuery);(function ($) {
    'use strict';

    function updateIngredientIdsFromQuery(result) {
        const select = $("<select/>"),
            mats = {};
        select.html(result.filter);

        select.find(">option:not([value=all])").each(function () {
            const $this = $(this);
            mats[$this.text().trim()] = parseInt($this.val());
        });

        window.sessionStorage.setItem("TRADESKILL_MATERIAL_IDS", JSON.stringify(mats));
        modules.cache.TRADESKILL_MATS = mats;
    }

    function Cache() {
        RoAModule.call(this, "Cache");
    }

    Cache.prototype = Object.spawn(RoAModule.prototype, {
        TRADESKILL_MATS: {},
        updateIngredientIds: function() {
            const cached_ids = window.sessionStorage.getItem("TRADESKILL_MATERIAL_IDS");
            if (cached_ids) {
                this.TRADESKILL_MATS = JSON.parse(cached_ids);
            } else {
                $.post("market.php", { type: "ingredient", page: 0, st: "all" }, updateIngredientIdsFromQuery);
            }
        },
        load: function () {
            this.updateIngredientIds();

            RoAModule.prototype.load.apply(this);
        }
    });

    Cache.prototype.constructor = Cache;

    modules.cache = new Cache();

})(modules.jQuery);(function () {
    'use strict';

    function Constants() {
        RoAModule.call(this, "Constants");
    }

    Constants.prototype = Object.spawn(RoAModule.prototype, {
        SettingsAutoSaveInterval: 1000,
        SettingsSaveVersion: 1,
        SettingsSaveKey: "settings",

        DungeonWallColor: "#ff0000",
        DungeonRoomSearchedColor: "#ffd700",
        DungeonRoomHasEnemiesColor: "#ff0000",
        DungeonPlayerColor: "#ffffff",
        DungeonMapVersion: 0.1,

        HouseUpdateInterval: 60 * 2 * 1000, // 2 minutes

        ChartUpdateInterval: 60 * 1 * 1000 // 1 minutes
    });

    Constants.prototype.constructor = Constants;

    modules.constants = new Constants();

})();(function ($) {
    'use strict';

    function CSS() {
        RoAModule.call(this, "CSS");
    }

    CSS.prototype = Object.spawn(RoAModule.prototype, {
        load: function () {
            // Load css we need
            const $head = $("head");

            for (var key in modules.urls.css) {
                $head.append("<link type='text/css' rel='stylesheet' href='" + modules.urls.css[key] + "'/>");
            }

            RoAModule.prototype.load.apply(this);
        }
    });

    CSS.prototype.constructor = CSS;

    modules.css = new CSS();

})(modules.jQuery);(function () {
    'use strict';

    const Interval = function (n) {
        this.name = n;
    };

    Interval.prototype = {
        intervals: {},
        isRunning: function () {
            return typeof(this.intervals[this.name]) !== "undefined"
        },
        clear: function () {
            if (this.isRunning()) {
                clearInterval(this.intervals[this.name]);
                delete this.intervals[this.name];
                return true;
            }

            return false;
        },
        set: function (callback, frequency) {
            this.clear();
            this.intervals[this.name] = setInterval(callback, frequency);
            return this.intervals[this.name];
        }
    };

    modules.createInterval = function (n) {
        return new Interval(n);
    };

})();(function () {

    const IntervalName = "roaLoader";
    const LoadUpdateTime = 1000;

    var loadOperations = {
        essentials: [],
        optionals: [],
    };

    var loadTimer;

    function loadEnd() {
        RoAModule.prototype.load.apply(this);

        modules.logger.log("Loading finished!");
    }

    function continueLoadOptionals() {
        for (var i = 0; i < loadOperations.optionals.length; i++) {
            if(!loadOperations.optionals[i].loaded) {
                return;
            }
        }

        loadTimer.clear();

        loadEnd();
    }

    function beginLoadOptionals() {
        loadTimer.clear();

        for (var i = 0; i < loadOperations.optionals.length; i++) {
            loadOperations.optionals[i].load();
        }

        loadTimer.set(continueLoadOptionals, LoadUpdateTime);
    }

    function continueLoadEssentials() {
        loadTimer.clear();

        for (var i = 0; i < loadOperations.essentials.length; i++) {
            if(!loadOperations.essentials[i].loaded) {
                return;
            }
        }

        loadTimer.set(beginLoadOptionals, LoadUpdateTime);
    }

    function beginLoadEssentials() {
        loadTimer.clear();

        for (var i = 0; i < loadOperations.essentials.length; i++) {
            loadOperations.essentials[i].load();
        }

        loadTimer.set(continueLoadEssentials, LoadUpdateTime);
    }

    function initializeEssentials() {
        loadOperations.essentials = [];

        // utility and core modules go first
        loadOperations.essentials.push(modules.cache);
        loadOperations.essentials.push(modules.css);
        loadOperations.essentials.push(modules.ajaxHooks);

        loadOperations.essentials.push(modules.uiScriptMenu);
        loadOperations.essentials.push(modules.uiTimers);
    }

    function initializeOptionals() {
        // Automation
        loadOperations.optionals.push(modules.automateStamina);

        // Chart
        loadOperations.optionals.push(modules.chartWindow);

        // Chat
        loadOperations.optionals.push(modules.chatPeopleColor);
        loadOperations.optionals.push(modules.chatTabs);

        // Clan
        loadOperations.optionals.push(modules.clanDonations);

        // Dungeon
        loadOperations.optionals.push(modules.dungeonMap);

        // House
        loadOperations.optionals.push(modules.houseMonitor);

        // UI
        loadOperations.optionals.push(modules.uiDebug);
        loadOperations.optionals.push(modules.uiChartMenu);
        loadOperations.optionals.push(modules.uiNotes);
        loadOperations.optionals.push(modules.uiCustomTimer);
        loadOperations.optionals.push(modules.uiActionShortcuts);
    }

    function Loader() {
        RoAModule.call(this, "Loader");
    }

    Loader.prototype = Object.spawn(RoAModule.prototype, {
        load: function () {
            modules.logger.log("Beginning Load...");

            initializeEssentials();
            initializeOptionals();

            loadTimer = modules.createInterval(IntervalName);
            loadTimer.set(beginLoadEssentials, LoadUpdateTime);
        }
    });

    Loader.prototype.constructor = Loader;

    modules.loader = new Loader();

})();(function () {
    'use strict';

    function Logger() {
        RoAModule.call(this, "Logger");
    }

    Logger.prototype = Object.spawn(RoAModule.prototype, {
        formatMessage: function (msg, type) {
            var type = type || "info";
            var d = new Date();
            var time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();

            return "[" + time + "] " + GM_info.script.name + "." + type + ": " + msg;
        },
        log: function (msg) {
            console.log(this.formatMessage(msg));
        },
        warn: function (msg) {
            console.log(this.formatMessage(msg));
        },
        error: function (msg) {
            console.log(this.formatMessage(msg));
        }
    });

    Logger.prototype.constructor = Logger;

    modules.logger = new Logger();

})();(function () {
    'use strict';

    var enabled = false;

    var module = {};

    function send(msg) {
        if(!enabled) {
            return;
        }

        new Notification('Relics of Avabur', {
            body: msg,
        });
    }

    function Notifications() {
        RoAModule.call(this, "Notifications");
    }

    Notifications.prototype = Object.spawn(RoAModule.prototype, {
        error: function (msg) {
            modules.logger.error(msg);
            send('ERROR: ' + msg);
        },
        notice: function (msg) {
            modules.logger.log(msg);
            send('NOTE: ' + msg);
        },
        warn: function (msg) {
            modules.logger.warn(msg);
            send('WARNING: ' + msg);
        },
        incompatibility: function (what) {
            this.error("Your browser does not support " + what +
                ". Please <a href='https://www.google.co.uk/chrome/browser/desktop/' target='_blank'>" +
                "Download the latest version of Google Chrome</a>");
        },
        load: function () {
            if (Notification.permission !== "granted") {
                Notification.requestPermission(function () {
                    enabled = true;
                });
            } else {
                enabled = true;
            }

            RoAModule.prototype.load.apply(this);
        }
    });

    Notifications.prototype.constructor = Notifications;

    modules.notification = new Notifications();

})();(function () {
    'use strict';

    function onCaptchaSolved(e, res, req, jsonres) {
        modules.session.lockAutomation = false;
    }

    function Session() {
        RoAModule.call(this, "Session");
    }

    Session.prototype = Object.spawn(RoAModule.prototype, {
        lockAutomation: false,
        captchaEncountered: function (x) {
            // this.lockAutomation = true;

            if(modules.settings.settings.notification.captcha.show && modules.settings.settings.notification.enable) {
                modules.notification.warn("Captcha required!");
            }
        },
        load: function () {
            modules.ajaxHooks.register("captcha_submit.php", onCaptchaSolved);

            RoAModule.prototype.load.apply(this);
        }
    });

    Session.prototype.constructor = Session;

    modules.session = new Session();

})();(function($) {
    'use strict';

    var autoSaveInterval;

    function Settings() {
        this.settings = this.defaults;

        autoSaveInterval = modules.createInterval("settingsAutoSave");

        RoAModule.call(this, "Settings");
    }

    Settings.prototype = Object.spawn(RoAModule.prototype, {
        defaults: {
            version: modules.constants.SettingsSaveVersion,
            notification: {
                enable: false,
                enableSound: false,
                whisper: {
                    sound: true,
                    show: true
                },
                construction: {
                    sound: true,
                    show: true
                },
                event: {
                    sound: true,
                    show: true
                },
                captcha: {
                    sound: false,
                    show: true
                },
            },
            features: {
                house_timer: true
            },
            dungeonMap: {},
            chartData: {},
            notes: ""
        },
        save: function () {
            GM_setValue(modules.constants.SettingsSaveKey, JSON.stringify(this.settings));
        },
        load: function () {
            var data = JSON.parse(GM_getValue(modules.constants.SettingsSaveKey) || "{}");
            if(data.version === modules.constants.SettingsSaveVersion) {
                this.settings = $.extend(true, this.defaults, data);
            }

            autoSaveInterval.set(function () {
                modules.settings.save();
            }, modules.constants.SettingsAutoSaveInterval);

            RoAModule.prototype.load.apply(this);
        }
    });

    Settings.prototype.constructor = Settings;

    modules.settings = new Settings();

})(modules.jQuery);(function() {
    'use strict';

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

    function URLS() {
        RoAModule.call(this, "URLS");
    }

    URLS.prototype = Object.spawn(RoAModule.prototype, {
        sfx: {
            circ_saw: gitHubUrl("res/sfx/circ_saw.wav"),
            message_ding: gitHubUrl("res/sfx/message_ding.wav")
        },
        css: {
            jquery_te: "https://cdnjs.cloudflare.com/ajax/libs/jquery-te/1.4.0/jquery-te.min.css",
            script: gitHubUrl("res/css/roaext.css")
        },
        gif: {
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
            market_tooltip: gitHubUrl("res/html/market-tooltip.html"),
            clan_donation_percent: gitHubUrl("res/html/clan-donation-percent.html"),
            notes: gitHubUrl("res/html/notes.html"),
            custom_timer: gitHubUrl("res/html/custom-timer.html"),
            debug: gitHubUrl("res/html/debug.html"),
            timers: gitHubUrl("res/html/timers.html"),
            script_menu: gitHubUrl("res/html/script-menu.html")
        }
    });

    URLS.prototype.constructor = URLS;

    modules.urls = new URLS;

})();(function($) {
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
        $this.html('<img src="' + modules.urls.gif.ajax_loader + '" alt="Loading"/>');
        $.get(url).done(function (r) {
            $this.html($(r).find("svg"));
        });
        return $this;
    };

    module.pad = function(value, width, padWith) {
        padWith = padWith || '0';
        value = value + '';
        return value.length >= width ? value : new Array(width - value.length + 1).join(padWith) + value;
    };

    module.getElementIntValue = function (elementId) {
        return parseInt($('#' + elementId).text().replace(/\,/g, ''));
    };

    modules.utils = module;

})(modules.jQuery);(function ($) {
    'use strict';

    var autoMax = 0;
    var autoCurr = 0;
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

        if(modules.session.lockAutomation) {
            return;
        }

        if(enabled && allowAuto && autoMax > 5 && autoCurr > 0 && autoCurr < autoMax && autoCurr < 3)
        {
            allowAuto = false;

            $.post('stamina_replenish.php', {}).done(function(x) {
                if (x.captcha) {
                    modules.session.captchaEncountered(x);
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

    function AutoStamina() {
        RoAModule.call(this, "Auto Stamina");
    }

    AutoStamina.prototype = Object.spawn(RoAModule.prototype, {
        load: function () {
            createToggle('craftingStatusButtons');
            createToggle('battleStatusButtons');
            createToggle('harvestStatusButtons');
            createToggle('harvestBossStatusButtons');

            modules.ajaxHooks.register("autobattle.php", updateAutoStamina);
            modules.ajaxHooks.register("autoevent.php", updateAutoStamina);
            modules.ajaxHooks.register("autotrade.php", updateAutoStamina);
            modules.ajaxHooks.register("autocraft.php", updateAutoStamina);

            RoAModule.prototype.load.apply(this);
        }
    });

    AutoStamina.prototype.constructor = AutoStamina;

    modules.automateStamina = new AutoStamina();

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
        additive: false,
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

            if(this.storage[key].length > 0) {
                var existingEntry = this.storage[key][this.storage[key].length - 1];
                if (existingEntry[0] === id) {
                    if (this.additive) {
                        // We are additive so add the y values
                        existingEntry[1] += value;
                    }

                    return;
                }
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

    const Chart = function (toggleDiv, targetDiv, title, type) {
        this.id = targetDiv;
        this.data = new ChartData();
        this.initialize(toggleDiv, targetDiv, title, type);
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
        initialize: function (toggleDiv, targetDiv, title, type) {
            var type = type || "line";
            this.toggleDiv = $('#' + toggleDiv);
            this.toggleDiv.click({self: this}, function(evt) { evt.data.self.show(); });

            this.targetDiv = $('#' + targetDiv);

            this.control = new CanvasJS.Chart(targetDiv, {
                title:{
                    text: title
                },
                data: [
                    {
                        type: type,
                        color: "blue",
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

            return this;
        },
        asAdditive: function () {
            this.data.additive = true;

            return this;
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

    modules.createChart = function (toggleDiv, targetDiv, title, type) {
        return new Chart(toggleDiv, targetDiv, title, type);
    };

})(modules.jQuery);(function ($) {
    'use strict';

    var chartWindow;

    var template;
    var visibleChart = null;
    var activeCharts = {};

    function onAutoBattle(e, res, req, jsonData) {
        if(jsonData && jsonData.b) {
            if(jsonData.b.xp && jsonData.b.xp > 0) {
                activeCharts['chartPlayerBattleXP'].updateData(jsonData.b.xp);
            }

            if(jsonData.b.g && jsonData.b.g > 0) {
                activeCharts['chartPlayerGoldLooted'].updateData(jsonData.b.g);
            }
        }
    }

    function onAutoTrade(e, res, req, jsonData) {
        if(jsonData && jsonData.a && jsonData.a.xp && jsonData.a.xp > 0) {
            activeCharts['chartPlayerHarvestXP'].updateData(jsonData.a.xp);
        }
    }

    function onAutoCraft(e, res, req, jsonData) {
        if(jsonData && jsonData.a && jsonData.a.xp && jsonData.a.xp > 0) {
            activeCharts['chartPlayerCraftingXP'].updateData(jsonData.a.xp);
        }
    }

    function onStatsReceived(e, res, req, jsonData) {

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

    function setupChart(toggleDiv, targetDiv, title, type) {
        var chart = modules.createChart(toggleDiv, targetDiv, title, type);
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

    function ChartWindow() {
        RoAModule.call(this, "Chart Window");
    }

    ChartWindow.prototype = Object.spawn(RoAModule.prototype, {
        continueLoad: function() {
            $("<style>").text("" +
                ".chartWindow{width: 800px; height: 500px;position: absolute; top: 0; left: 0;}\n" +
                ".chartTab{width: 100%; height: 250px; top: 240px; position: absolute}\n" +
                ".chartCategoryTab{width: 100%; height: 100%}")
                .appendTo("body");

            chartWindow = $(template);
            chartWindow.appendTo("body");
            chartWindow.draggable({handle:"#gameChartTitle"});
            chartWindow.hide();

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
            setupChart("toggleChartPlayerBattleXP", "chartPlayerBattleXP", "Battle XP", "column").asAdditive();
            setupChart("toggleChartPlayerHarvestXP", "chartPlayerHarvestXP", "Harvest XP", "column").asAdditive();
            setupChart("toggleChartPlayerCraftingXP", "chartPlayerCraftingXP", "Crafting XP", "column").asAdditive();
            setupChart("toggleChartPlayerGold", "chartPlayerGold", "Gold").asElementChart("gold");
            setupChart("toggleChartPlayerGoldLooted", "chartPlayerGoldLooted", "Gold Looted", "column").asAdditive();
            setupChart("toggleChartPlayerPlatinum", "chartPlayerPlatinum", "Platinum").asElementChart("platinum");
            setupChart("toggleChartPlayerCrystal", "chartPlayerCrystal", "Crystals").asElementChart("premium");
            setupChart("toggleChartPlayerMaterial", "chartPlayerMaterial", "Material").asElementChart("crafting_materials");
            setupChart("toggleChartPlayerFragment", "chartPlayerFragment", "Fragments").asElementChart("gem_fragments");
            setupChart("toggleChartPlayerFood", "chartPlayerFood", "Food").asElementChart("food");
            setupChart("toggleChartPlayerWood", "chartPlayerWood", "Wood").asElementChart("wood");
            setupChart("toggleChartPlayerIron", "chartPlayerIron", "Iron").asElementChart("iron");
            setupChart("toggleChartPlayerStone", "chartPlayerStone", "Stone").asElementChart("stone");

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

            modules.ajaxHooks.register("autobattle.php", onAutoBattle);
            modules.ajaxHooks.register("autotrade.php", onAutoTrade);
            modules.ajaxHooks.register("autocraft.php", onAutoCraft);
            modules.ajaxHooks.register("game_stats.php", onStatsReceived);
            modules.ajaxHooks.registerAutoSend("game_stats.php", {}, modules.constants.ChartUpdateInterval);

            RoAModule.prototype.load.apply(this);
        },
        load: function () {
            $.get(modules.urls.html.charts).done(function (x) {
                template = x;
                modules.chartWindow.continueLoad();
            });
        },
        toggle: function () {
            chartWindow.toggle();
        }
    });

    ChartWindow.prototype.constructor = ChartWindow;

    modules.chartWindow = new ChartWindow();

})(modules.jQuery);(function($) {
    'use strict';

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

    function ChatPeopleColor() {
        RoAModule.call(this, "Chat People Colors");
    }

    ChatPeopleColor.prototype = Object.spawn(RoAModule.prototype, {
        load: function () {
            initialize();

            RoAModule.prototype.load.apply(this);
        }
    });

    ChatPeopleColor.prototype.constructor = ChatPeopleColor;

    modules.chatPeopleColor = new ChatPeopleColor();

})(modules.jQuery);(function ($) {
    'use strict';

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

    function ChatTabs() {
        RoAModule.call(this, "Chat Tabs");
    }

    ChatTabs.prototype = Object.spawn(RoAModule.prototype, {
        load: function () {
            init();

            RoAModule.prototype.load.apply(this);
        }
    });

    ChatTabs.prototype.constructor = ChatTabs;

    modules.chatTabs = new ChatTabs();

})(modules.jQuery);(function ($) {
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
                $().each(function(){ $(this).text($(this).attr(format)); });
            });

            modules.ajaxHooks.register("clan_donations.php", parseClanDonationsPhp);

            RoAModule.prototype.load.apply(this);
        },
        load: function () {
            $.get(modules.urls.html.clan_donation_percent).done(function (x) {
                template = x;
                modules.clanDonations.continueLoad();
            });
        }
    });

    ClanDonations.prototype.constructor = ClanDonations;

    modules.clanDonations = new ClanDonations();

})(modules.jQuery);(function ($) {
    'use strict';

    var initialize = function () {
        modules.settings.dungeonMap = { r:{}, cf:0, ct:null, v: modules.constants.DungeonMapVersion };
    };

    function onLeaveDungeon() {
        initialize();
    }

    function onUpdateDungeon(e, res, req, jsonres) {
        if (jsonres.hasOwnProperty("data") && jsonres.data.hasOwnProperty("map")) {
            if (modules.settings.dungeonMap.cf !== jsonres.data.floor) {
                modules.settings.dungeonMap.r = {};
                modules.settings.dungeonMap.cf = jsonres.data.floor;
            }
            var jrd = jsonres.data;
            var data = {};
            var token = $(jrd.map).text().replace("↓", "v"); // map
            token = btoa(JSON.stringify(token)); // token
            if (modules.settings.dungeonMap.r.hasOwnProperty(token)) {
                data = JSON.parse(JSON.stringify(modules.settings.dungeonMap.r[token]));
            } else {
                data.pe = "";
                data.ps = "";
                data.pn = "";
                data.pw = "";
                data.t  = token;
            }

            if (modules.settings.dungeonMap.ct === null) {
                modules.settings.dungeonMap.ct = token;
            }

            data.e = jrd.e?1:0; // east
            data.s = jrd.s?1:0; // south
            data.n = jrd.n?1:0; // north
            data.w = jrd.w?1:0; // west
            data.r = !!jrd.search; // raided
            data.b = Object.keys(jrd.enemies).length; // battles available

            modules.settings.dungeonMap.r[data.t] = data;

            var walk = jsonres.hasOwnProperty("m") && jsonres.m.match(/You walked (east|south|north|west)/);
            walk = walk ? jsonres.m.match(/You walked (east|south|north|west)/) : false;
            if (walk !== false) {
                walk = walk[1].match(/^./)[0];
                if (modules.settings.dungeonMap.ct !== data.t) {
                    if (typeof modules.settings.dungeonMap.r[modules.settings.dungeonMap.ct] !== "undefined") {
                        modules.settings.dungeonMap.r[modules.settings.dungeonMap.ct]["p"+walk] = data.t;
                        var sm = {
                            "s": "n",
                            "n": "s",
                            "e": "w",
                            "w": "e"
                        };
                        modules.settings.dungeonMap.r[data.t]["p"+sm[walk]] = modules.settings.dungeonMap.ct;
                    }
                    modules.settings.dungeonMap.ct = data.t;
                }
            }

            modules.settings.save();
            updateDungeonMap(false);
        } else {
            updateDungeonMap(req.url.indexOf("dungeon_") === -1);
        }
    }

    function onResizeEnd(e) {
        $("#dungeonMapCanvas").attr({width: modules.settings.dungeonMap.size.width, height: modules.settings.dungeonMap.size.height});
        updateDungeonMap(false);
    }

    var dmc, dmctx, dmv;
    function updateDungeonMap(hide) {
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
            h.draggable({handle:"#dungeonMapCanvas"}).resizable({stop: onResizeEnd});
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
        var tile = modules.settings.dungeonMap.r[id];
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
            dmctx.fillStyle     = modules.constants.DungeonRoomSearchedColor;
            dmctx.strokeStyle   = modules.constants.DungeonRoomSearchedColor;
            dmctx.arc(x,y,2, 0, 2*Math.PI);
            dmctx.fill();
        }

        if (tile.b > 0) {
            dmctx.fillStyle     = modules.constants.DungeonRoomHasEnemiesColor;
            dmctx.strokeStyle   = modules.constants.DungeonRoomHasEnemiesColor;
            dmctx.arc(x,y,2, 0, 2*Math.PI);
            dmctx.fill();
        }

        if (player === 1) {
            dmctx.fillStyle     = modules.constants.DungeonPlayerColor;
            dmctx.strokeStyle   = modules.constants.DungeonPlayerColor;
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
            dmctx.strokeStyle = modules.constants.DungeonWallColor;
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

    function DungeonMap() {
        RoAModule.call(this, "Dungeon Map");
    }

    DungeonMap.prototype = Object.spawn(RoAModule.prototype, {
        load: function () {
            if(modules.settings.dungeonMap == null) {
                initialize();
            } else {
                try {
                    if(modules.settings.dungeonMap == null || modules.settings.dungeonMap.v == null || modules.settings.dungeonMap.v != modules.constants.DungeonMapVersion)
                    {
                        initialize();
                    }
                } catch (e) {
                    initialize();
                }
            }

            modules.ajaxHooks.register("dungeon_leave.php", onLeaveDungeon);
            modules.ajaxHooks.register("dungeon_info.php", onUpdateDungeon);
            modules.ajaxHooks.register("dungeon_move.php", onUpdateDungeon);
            modules.ajaxHooks.register("dungeon_search.php", onUpdateDungeon);

            RoAModule.prototype.load.apply(this);
        }
    });

    DungeonMap.prototype.constructor = DungeonMap;

    modules.dungeonMap = new DungeonMap();

})(modules.jQuery);(function ($) {
    'use strict';

    var lastMessage;
    var $houseStatus;

    var template;
    var interval;
    var constructionTimeRemaining = 0;
    var constructionTimeUpdate;

    function updateHouseStatus(e, res, req, jsonres) {
        var text = jsonres.m;

        if (text === lastMessage) {
            return;
        }

        interval.clear();

        if (text.indexOf("available again") !== -1) { // Working
            constructionTimeRemaining = modules.utils.parseTimeStringLong(text);
            constructionTimeUpdate = new Date();
            interval.set(updateHouseConstructionTimer, 1000);
        } else if (text.indexOf("are available")) {
            houseConstructionFinished();
        }
    }

    function updateHouseConstructionTimer() {
        var currentDate = new Date();
        var updateDiff = currentDate - constructionTimeUpdate;
        constructionTimeRemaining -= updateDiff;
        constructionTimeUpdate = currentDate;

        if (constructionTimeRemaining <= 0) {
            houseConstructionFinished();
        } else {
            var timeString = new Date(constructionTimeRemaining).toISOString().substr(11, 8);
            $houseStatus.removeClass("avi-highlight").text(timeString);
        }
    }

    function houseConstructionFinished() {
        interval.clear();

        $houseStatus.addClass("avi-highlight").html(
            $('<span data-delegate-click="#header_house" style="cursor:pointer;text-decoration:underline;padding-right:5px">Ready!</span>')
                //.click() // TODO
        );

        if (modules.settings.settings.notification.construction.sound && modules.settings.settings.notification.enableSound) {
            modules.constants.SFX.circ_saw.play();
        }

        if (modules.settings.settings.notification.construction.show && modules.settings.settings.notification.enable) {
            modules.notification.notice("House construction finished!");
        }
    }

    function HouseMonitor() {
        RoAModule.call(this, "House Monitor");
    }

    HouseMonitor.prototype = Object.spawn(RoAModule.prototype, {
        continueLoad: function() {
            const $timer = $(template);
            const $body = $("body");

            $("#houseTimerInfo").addClass("avi-force-block");
            $body.append("<style>#constructionNotifier,#houseTimerTable [data-typeid='Construction']{display:none!important}</style>");

            $("#houseTimerTable").prepend($timer);

            $houseStatus = $("#avi-house-construction");

            interval = modules.createInterval("house_status");

            modules.ajaxHooks.register("house.php", updateHouseStatus);
            modules.ajaxHooks.registerAutoSend("house.php", {}, modules.constants.HouseUpdateInterval);

            RoAModule.prototype.load.apply(this);
        },
        load: function () {
            $.get(modules.urls.html.house_timers).done(function (x) {
                template = x;
                modules.houseMonitor.continueLoad();
            });
        }
    });

    HouseMonitor.prototype.constructor = HouseMonitor;

    modules.houseMonitor = new HouseMonitor();

})(modules.jQuery);(function ($) {
    'use strict';

    function UIActionShortcuts() {
        RoAModule.call(this, "UI Action Shortcuts");
    }

    UIActionShortcuts.prototype = Object.spawn(RoAModule.prototype, {
        load: function () {
            if (!modules.uiScriptMenu.enabled) {
                console.warn("Script Menu is disabled, will not enable Action Shortcuts");
                return;
            }

            var $menuLink = $('#roaMenu');

            // Side shortcuts
            var $appends = {
                battle: $("<a href='javascript:;' data-delegate-click='#loadMobList' class='avi-tip avi-menu-shortcut' title='Open Battle'/>"),
                fishing: $("<a href='javascript:;' data-delegate-click='#loadFishing' class='avi-tip avi-menu-shortcut' title='Open Fishing'/>"),
                wc: $("<a href='javascript:;' data-delegate-click='#loadWoodcutting' class='avi-tip avi-menu-shortcut' title='Open Lumber Mill'/>"),
                mine: $("<a href='javascript:;' data-delegate-click='#loadMining' class='avi-tip avi-menu-shortcut' title='Open Mine'/>"),
                quarry: $("<a href='javascript:;' data-delegate-click='#loadStonecutting' class='avi-tip avi-menu-shortcut' title='Open Quarry'/>")
            };

            $("#navWrapper").css("padding-top", $menuLink.height()).find("ul")
                .append(
                    $('<li class="avi-menu"/>')
                        .append($appends.battle)
                        .append($appends.fishing)
                        .append($appends.wc)
                        .append($appends.mine)
                        .append($appends.quarry)
                );

            modules.utils.svg($appends.battle, modules.urls.svg.sword_clash);
            modules.utils.svg($appends.fishing, modules.urls.svg.fishing);
            modules.utils.svg($appends.wc, modules.urls.svg.log);
            modules.utils.svg($appends.mine, modules.urls.svg.metal_bar);
            modules.utils.svg($appends.quarry, modules.urls.svg.stone_block);

            RoAModule.prototype.load.apply(this);
        }
    });

    UIActionShortcuts.prototype.constructor = UIActionShortcuts;

    modules.uiActionShortcuts = new UIActionShortcuts();

})(modules.jQuery);(function () {
    'use strict';

    function onClick() {
        modules.chartWindow.toggle();
    }

    function UIChartMenu() {
        RoAModule.call(this, "UI Chart Menu");
    }

    UIChartMenu.prototype = Object.spawn(RoAModule.prototype, {
        load: function () {

            modules.uiScriptMenu.addLink("Charts", onClick);

            RoAModule.prototype.load.apply(this);
        }
    });

    UIChartMenu.prototype.constructor = UIChartMenu;

    modules.uiChartMenu = new UIChartMenu();

})(modules.jQuery);(function ($) {
    'use strict';

    var window;
    var template;

    function onClick() {
        window.toggle();
    }

    function UICustomTimer() {
        RoAModule.call(this, "UI Custom Timer");
    }

    UICustomTimer.prototype = Object.spawn(RoAModule.prototype, {
        continueLoad: function () {
            $("<style>").text("" +
                ".createTimerWindow{width: 800px; height: 500px;position: absolute; top: 0; left: 0;}")
                .appendTo("body");

            window = $(template);
            window.appendTo("body");
            window.draggable({handle:"#createTimerTitle"});
            window.resizable();
            window.hide();

            RoAModule.prototype.load.apply(this);
        },
        load: function () {
            var $helpSection = $("#helpSection");

            var $menuLink = $('<a href="javascript:;"/>')
                .html('<li class="visible-xs-inline-block visible-sm-inline-block visible-md-block visible-lg-block">Custom Timer</li>')
                .click(onClick);

            $helpSection.append($menuLink);

            $.get(modules.urls.html.custom_timer).done(function (x) {
                template = x;
                modules.uiCustomTimer.continueLoad();
            });
        }
    });

    UICustomTimer.prototype.constructor = UICustomTimer;

    modules.uiCustomTimer = new UICustomTimer();

})(modules.jQuery);(function ($) {
    'use strict';

    var template;
    var window;

    var requestHistory = {};

    function onClick() {
        window.toggle();
    }

    function updateDebugContent() {
        var $tableBody = $('#debugWindowContentBody');
        $tableBody.empty();

        for(var key in requestHistory) {
            var $rowRcvLink = $('<a href="javascript:;">Log to Console</a>').click({key: key}, function (event) {
                console.log('DEBUG: Printing data for ' + event.data.key);
                console.log(requestHistory[event.data.key].data);
            });

            var $rowSentLink = $('<a href="javascript:;">Log to Console</a>').click({key: key}, function (event) {
                console.log('DEBUG: Printing Sent data for ' + event.data.key);
                console.log(requestHistory[event.data.key].dataSent);
            });

            var timeString = requestHistory[key].time.getHours() + ":" + requestHistory[key].time.getMinutes() + ":" + requestHistory[key].time.getSeconds();;

            var $row = $('<tr></tr>');
            $row.append($('<td>' + key + '</td>'));
            $row.append($('<td>' + timeString + '</td>'));
            $row.append($('<td></td>').append($rowSentLink));
            $row.append($('<td></td>').append($rowRcvLink));

            $tableBody.append($row);
        }
    }

    function initEntry(url) {
        if(requestHistory[url]) {
            requestHistory[url].time = new Date();
            return;
        }

        requestHistory[url] = { time: new Date(), data: null, dataSent: null };
    }

    function onAjaxDone(e, res, req, jsonData) {
        initEntry(req.url);
        requestHistory[req.url].data = jsonData;

        updateDebugContent();
    }

    function onAjaxSentPending(event, jqxhr, options) {
        initEntry(options.url);
        requestHistory[options.url].dataSent = options;

        updateDebugContent();
    }

    function UIDebug() {
        RoAModule.call(this, "UI Debug");
    }

    UIDebug.prototype = Object.spawn(RoAModule.prototype, {
        continueLoad: function () {
            $("<style>").text("" +
                ".debugWindow{width: 800px; height: 500px;position: absolute; top: 0; left: 0;}")
                .appendTo("body");

            window = $(template);
            window.appendTo("body");
            window.draggable({handle:"#debugWindowTitle"});
            window.resizable();
            window.hide();

            modules.ajaxHooks.registerAll(onAjaxDone);
            modules.ajaxHooks.registerRcvAll(onAjaxSentPending);

            RoAModule.prototype.load.apply(this);
        },
        load: function () {
            modules.uiScriptMenu.addLink("Debug", onClick);

            $.get(modules.urls.html.debug).done(function (x) {
                template = x;
                modules.uiDebug.continueLoad();
            });
        }
    });

    UIDebug.prototype.constructor = UIDebug;

    modules.uiDebug = new UIDebug();

})(modules.jQuery);(function ($) {
    'use strict';

    var template;
    var noteWindow;

    function onClick() {
        noteWindow.toggle();
    }

    function autoSave() {
        var text = $('.jqte_editor').html();

        modules.settings.settings.notes = text;
    }

    function UINotes() {
        RoAModule.call(this, "UI Timers");
    }

    UINotes.prototype = Object.spawn(RoAModule.prototype, {
        continueLoad: function () {
            $("<style>").text("" +
                ".noteWindow{width: 800px; height: 500px;position: absolute; top: 0; left: 0;}")
                .appendTo("body");

            noteWindow = $(template);
            noteWindow.appendTo("body");
            noteWindow.draggable({handle:"#noteTitle"});
            noteWindow.resizable();
            noteWindow.hide();

            $('#noteEditor').jqte();
            $('#noteEditor').jqteVal(modules.settings.settings.notes);

            modules.createInterval("noteAutoSave").set(autoSave, 5000);

            RoAModule.prototype.load.apply(this);
        },
        load: function () {

            modules.uiScriptMenu.addLink("Notes", onClick);

            $.get(modules.urls.html.notes).done(function (x) {
                template = x;
                modules.uiNotes.continueLoad();
            });
        }
    });

    UINotes.prototype.constructor = UINotes;

    modules.uiNotes = new UINotes();

})(modules.jQuery);(function ($) {
    'use strict';

    var template;

    var $menuContent;

    function UIScriptMenu() {
        RoAModule.call(this, "UI Script Menu");
    }

    UIScriptMenu.prototype = Object.spawn(RoAModule.prototype, {
        addLink: function (text, callback) {
            var link = $('<a href="javascript:;"/>');
            link.append($('<li class="visible-xs-inline-block visible-sm-inline-block visible-md-block visible-lg-block">' + text + '</li>'));
            link.click(callback);

            $menuContent.append(link);
            /*
             .html('<li class="visible-xs-inline-block visible-sm-inline-block visible-md-block visible-lg-block">Debug</li>')
             .click(onClick);*/
            /*<a href="javascript:;"><li class="visible-xs-inline-block visible-sm-inline-block visible-md-block visible-lg-block">Custom Timer</li></a>*/
        },
        continueLoad: function () {
            $('#navWrapper').prepend($(template));

            $('#roaMenuTitle').text(GM_info.script.name + " " + GM_info.script.version);

            $menuContent = $("#roaMenuContent");

            RoAModule.prototype.load.apply(this);
        },
        load: function () {
            $.get(modules.urls.html.script_menu).done(function (x) {
                template = x;
                modules.uiScriptMenu.continueLoad();
            });
        }
    });

    UIScriptMenu.prototype.constructor = UIScriptMenu;

    modules.uiScriptMenu = new UIScriptMenu();

})(modules.jQuery);(function ($) {
    'use strict';

    var template;

    function UITimers() {
        RoAModule.call(this, "UI Timers");
    }

    UITimers.prototype = Object.spawn(RoAModule.prototype, {
        continueLoad: function() {
            $('#rightWrapper').append($(template));

            RoAModule.prototype.load.apply(this);
        },
        load: function () {
            $.get(modules.urls.html.timers).done(function (x) {
                template = x;
                modules.uiTimers.continueLoad();
            });
        }
    });

    UITimers.prototype.constructor = UITimers;

    modules.uiTimers = new UITimers();

})(modules.jQuery);// Some core modules go before everything
modules.logger.load();
modules.notification.load();

//Check if the user can even support the bot
if (typeof(window.sessionStorage) === "undefined") {
    modules.notification.incompatibility("Session storage");
} else if (typeof(MutationObserver) === "undefined") {
    modules.notification.incompatibility("MutationObserver");
} else {
    modules.loader.load();
}
