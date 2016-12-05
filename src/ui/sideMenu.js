(function ($) {
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

})(modules.jQuery);