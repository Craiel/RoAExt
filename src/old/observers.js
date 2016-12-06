(function ($) {
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

})(modules.jQuery);