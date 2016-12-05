(function ($) {
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

})(modules.jQuery);