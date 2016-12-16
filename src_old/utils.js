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