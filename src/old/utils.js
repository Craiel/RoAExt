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