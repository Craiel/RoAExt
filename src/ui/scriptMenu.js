(function ($) {
    'use strict';

    var module = { enabled: false };

    module.enable = function () {
        var $helpSection = $("#helpSection");

        // Script menu button
        var $menuLink = $('<a id="roaMenu" href="javascript:;"/>')
            .html('<li class="active">' + GM_info.script.name + " " + GM_info.script.version + '</li>');
        //.click(); TODO

        $helpSection.prepend($menuLink);

        this.enabled = true;
    };

    modules.uiScriptMenu = module;

})(modules.jQuery);