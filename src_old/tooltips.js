(function ($) {
    'use strict';

    var module = {};

    var initialize = function () {
        // Tooltips
        $.get(modules.urls.html.market_tooltip).done(function (r) {
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

})(modules.jQuery);