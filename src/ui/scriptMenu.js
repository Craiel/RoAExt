(function ($) {
    'use strict';

    var template;

    function UIScriptMenu() {
        RoAModule.call(this, "UI Script Menu");
    }

    UIScriptMenu.prototype = Object.spawn(RoAModule.prototype, {
        continueLoad: function () {
            $('#navWrapper').prepend($(template));

            $('#roaMenuTitle').text(GM_info.script.name + " " + GM_info.script.version);

            RoAModule.prototype.load.apply(this);
        },
        load: function () {
            $.get(modules.urls.html.script_menu).done(function (x) {
                template = x;
                modules.uiScriptMenu.continueLoad();
            });
        }
    });

    UIScriptMenu.prototype.constructor = UIScriptMenu;

    modules.uiScriptMenu = new UIScriptMenu();

})(modules.jQuery);