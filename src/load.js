var AVBULoad = (function ($) {
    'use strict';

    var module = {};

    module["Registering market tooltip users"] = function () {
        $.get(constants.URLS.html.market_tooltip).done(function (r) {
            constants.$DOM.market.market_tooltip = r;

            const $tooltipTable = $(r);

            $tooltipTable.find("th[colspan]").append(constants.$AJAX_SPINNERS.currency_tooltip);
            constants.$DOM.currency_tooltip.table_row = $tooltipTable.find("tr[data-id=prices]");
            constants.$DOM.currency_tooltip.market_low = constants.$DOM.currency_tooltip.table_row.find(">td").first();
            constants.$DOM.currency_tooltip.market_avg = constants.$DOM.currency_tooltip.market_low.next();
            constants.$DOM.currency_tooltip.market_high = constants.$DOM.currency_tooltip.market_avg.next();

            //Add our stuff to the currency tooltips
            constants.$DOM.currency_tooltip.the_tooltip.append($tooltipTable);

            observers.currency_tooltips.observe(constants.$DOM.currency_tooltip.the_tooltip[0], {
                attributes: true
            });

            observers.inventory_table.observe(document.querySelector("#inventoryTable"), {
                childList: true,
                characterData: true
            });
        });
    };

    module["Fixing some game CSS"] = function () {
        $("head").append('<style>.materials{color:' +
            $("#crafting_materials").css("color") +
            '}.fragments{color:' +
            $("#gem_fragments").css("color") + '}</style>');
    };

    module["Applying house monitor"] = function () {
        if (settings.settings.features.house_timer) {
            $.get(constants.URLS.html.house_timers).done(function (r) {
                const $timer = $(r),
                    $body = $("body");

                $("#houseTimerInfo").addClass("avi-force-block");
                $body.append("<style>#constructionNotifier,#houseTimerTable [data-typeid='Construction']{display:none!important}</style>");
                $("#houseTimerTable").prepend($timer);
                constants.$DOM.house_monitor.status = $("#avi-house-construction").click($HANDLERS.click.house_state_refresh);
                observers.house_status.observe(document.querySelector("#house_notification"), {
                    childList: true,
                    characterData: true
                });
                $(document).ajaxComplete(Request.prototype.callbacks.success.house_requery);
                $.get("/house.php")
            });
        } else {
            console.log("(skipped due to user settings)");
        }
    };

    module["Checking if the script has been updated"] = function () {
        if (utils.versionCompare(GM_getValue("last_ver") || "999999", GM_info.script.version) < 0) {
            $().toastmessage('showToast', {
                text: GM_info.script.name + " has been updated! See the changelog " +
                "<a href='https://github.com/Alorel/avabur-improved/releases' target='_blank'>here</a>",
                sticky: true,
                position: 'top-left',
                type: 'success'
            });
        }
        GM_setValue("last_ver", GM_info.script.version);
    };

    module["Loading script CSS"] = function () {
        const $head = $("head"),
            keys = Object.keys(constants.URLS.css);

        for (var i = 0; i < keys.length; i++) {
            $head.append("<link type='text/css' rel='stylesheet' href='" + constants.URLS.css[keys[i]] + "'/>");
        }
    };

    module["Configuring script modal"] = function () {
        $.get(constants.URLS.html.settings_modal).done(function (r) {
            constants.$DOM.modal.script_settings = $(r);
            $("#modalContent").append(constants.$DOM.modal.script_settings);
            utils.tabify(constants.$DOM.modal.script_settings);
            constants.$DOM.modal.script_settings.find("[data-demo]").click(handlers.click.demo);

            constants.$DOM.modal.script_settings.find('[data-setting="notifications"]')
                .each(handlers.each.settings_notification)
                .change(handlers.change.settings_notification);

            constants.$DOM.modal.script_settings.find('[data-setting="features"]')
                .each(handlers.each.settings_features)
                .change(handlers.change.settings_feature);

            observers.script_settings.observe(constants.$DOM.modal.modal_wrapper[0], {attributes: true});
        });
    };

    module["Registering side menu entry"] = function () {
        const $helpSection = $("#helpSection"),
            $menuLink = $('<a href="javascript:;"/>')
                .html('<li class="active">' + GM_info.script.name + " " + GM_info.script.version + '</li>')
                .click(handlers.click.script_menu),
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

        utils.svg($appends.battle, constants.URLS.svg.sword_clash);
        utils.svg($appends.fishing, constants.URLS.svg.fishing);
        utils.svg($appends.wc, constants.URLS.svg.log);
        utils.svg($appends.mine, constants.URLS.svg.metal_bar);
        utils.svg($appends.quarry, constants.URLS.svg.stone_block);
    };

    module["Registering market shortcuts"] = function () {
        $("#allThemTables").find(".currencyWithTooltip:not(:contains(Gold))").css("cursor", "pointer")
            .click(handlers.click.topbar_currency);
    };

    module["Staring whisper monitor"] = function () {
        observers.chat_whispers.observe(document.querySelector("#chatMessageList"), {
            childList: true
        });
    };

    module["Collecting tradeskill material IDs"] = function () {
        const cached_ids = window.sessionStorage.getItem("TRADESKILL_MATERIAL_IDS");
        if (cached_ids) {
            cache.TRADESKILL_MATS = JSON.parse(cached_ids);
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
                cache.TRADESKILL_MATS = mats;
            });
        }
    };

    module["Applying extra event listeners tooltips"] = function () {
        $(".avi-tip").tooltip({
            container: "body",
            viewport: {"selector": "body", "padding": 0}
        });
        $("[data-delegate-click]").click(handlers.click.delegate_click);
    };

    module.loadAll = function () {
        const keys = Object.keys(this);
        for (var i = 0; i < keys.length; i++) {
            if(keys[i] == "loadAll")
            {
                continue;
            }

            console.log("[" + GM_info.script.name + "] " + keys[i]);
            this[keys[i]]();
            delete this[keys[i]];
        }
    };

    return module;
});