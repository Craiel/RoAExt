var AVBUUtils = (function($) {
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
        $this.html('<img src="' + constants.URLS.img.ajax_loader + '" alt="Loading"/>');
        $.get(url).done(function (r) {
            $this.html($(r).find("svg"));
        });
        return $this;
    };

    module.house_status_update_end = function (interval) {
        interval.clear();
        constants.$DOM.house_monitor.status.addClass("avi-highlight").html(
            $('<span data-delegate-click="#header_house" style="cursor:pointer;text-decoration:underline;padding-right:5px">Ready!</span>')
                .click(handlers.click.delegate_click)
        )
            .append(
                $("<a href='javascript:;'>(refresh)</a>").click(handlers.click.house_state_refresh)
            );
        if (settings.settings.notifications.construction.gm && settings.settings.notifications.all.gm) {
            this.notification(demo.prototype.gm_texts.construction);
        }
        if (settings.settings.notifications.construction.sound && settings.settings.notifications.all.sound) {
            constants.SFX.circ_saw.play();
        }
    };

    module.handle_house_status_update = function (text) {
        if (text !== constants.FUNCTION_PERSISTENT_VARS.house_update_last_msg) {
            constants.FUNCTION_PERSISTENT_VARS.house_update_last_msg = text;
            const intervalFunc = interval("house_status");
            intervalFunc.clear();

            if (text.indexOf("available again") !== -1) { // Working
                const timer = new AloTimer(this.parseTimeStringLong(text));
                intervalFunc.set(function () {
                    if (timer.isFinished) {
                        this.house_status_update_end(intervalFunc);
                    } else {
                        constants.$DOM.house_monitor.status.removeClass("avi-highlight").text(timer.toString());
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
                constants.$DOM.market.navlinks.removeClass("active")
                    .filter("a:contains('" + type + "')").addClass("active").click();
            }
        };

        $document.ajaxComplete($openCategory);
        constants.$DOM.nav.market.click();
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
        constants.$DOM.modal.modal_background.fadeIn();
        constants.$DOM.modal.modal_wrapper.fadeIn();
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

    return module;
});