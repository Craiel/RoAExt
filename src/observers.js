var AVBUObservers = (function ($) {
    'use strict';

    var module = {};

    /** Mutation observer for the currency page tooltip */
    module.currency_tooltips = new MutationObserver(
        /** @param {MutationRecord[]} records */
        function (records) {
            if (records.length && constants.$DOM.currency_tooltip.colour_reference.is(":visible")) {
                const cssClass = constants.$DOM.currency_tooltip.colour_reference.attr("class"),
                    marketID = cssClass.replace("crystals", "premium")
                        .replace("materials", "weapon_scraps")
                        .replace("fragments", "gem_fragments"),
                    $allTDs = utils.$DOM.currency_tooltip.table_row.find(">td");

                utils.$DOM.currency_tooltip.table_row.attr("class", cssClass);

                if (cssClass === "gold") {
                    $allTDs.text("N/A");
                    utils.toggleVisibility(constants.$AJAX_SPINNERS.currency_tooltip, false);
                } else {
                    $allTDs.text(" ");
                    utils.toggleVisibility(constants.$AJAX_SPINNERS.currency_tooltip, true);

                    (new Request("/market.php", constants.CACHE_TTL.market)).post({
                        type: "currency",
                        page: 0,
                        st: marketID
                    }).done(request.callbacks.success.currency_tooltip);
                }
            }
    });

        /** Makes sure the script settings modal doesn't get nasty with the other game modals */
    module.script_settings = new MutationObserver(function () {
            if (!constants.$DOM.modal.script_settings.is(":visible")) {
                constants.$DOM.modal.script_settings.hide();
            }
        }
    );

    module.house_status = new MutationObserver(function (records) {
        for (var i = 0; i < records.length; i++) {
            if (records[i].addedNodes.length) {
                utils.handle_house_status_update(records[i].target.innerText.trim());
                break;
            }
        }
    });

    module.chat_whispers = new MutationObserver(
        /** @param {MutationRecord[]} records */
        function (records) {
            const sound_on = settings.settings.notifications.all.sound && settings.settings.notifications.whisper.sound;
            const gm_on = settings.settings.notifications.all.gm && settings.settings.notifications.whisper.gm;

            if (sound_on || gm_on) {
                for (var i = 0; i < records.length; i++) {
                    const addedNodes = records[i].addedNodes;
                    if (addedNodes.length) {
                        for (var j = 0; j < addedNodes.length; j++) {
                            const text = $(addedNodes[j]).text();
                            if (text.match(/^\[[0-9]+:[0-9]+:[0-9]+]\s*Whisper from/)) {
                                if (gm_on) {
                                    utils.notification(text);
                                }
                                if (sound_on) {
                                    constants.SFX.msg_ding.play();
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
                                $tbody.find(">tr>[data-th=Item]").each(handlers.each.inventory_table_ingredients);
                            }
                            break;
                        }
                    }
                    break;
                }
            }
        }
    );

    return module;

});