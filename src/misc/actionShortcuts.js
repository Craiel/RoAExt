(function ($) {
    'use strict';

    function UIActionShortcuts() {
        RoAModule.call(this, "UI Action Shortcuts");
    }

    UIActionShortcuts.prototype = Object.spawn(RoAModule.prototype, {
        load: function () {

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

})(modules.jQuery);