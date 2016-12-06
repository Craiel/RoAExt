(function ($) {
    'use strict';

    var module = {};

    function setupMenu(template) {
        $('#navWrapper').prepend($(template));

        $('#roaMenuTitle').text(GM_info.script.name + " " + GM_info.script.version);
    }

    module.enable = function () {

        $.get(modules.urls.html.script_menu).done(setupMenu);

    };

    modules.uiScriptMenu = module;
    modules.uiScriptMenu.enable();

})(modules.jQuery);