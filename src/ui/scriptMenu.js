(function ($) {
    'use strict';

    var module = {};

    function setupMenu(template) {
        $('#navWrapper').prepend($(template));
    }

    module.enable = function () {


        $.get(modules.urls.html.script_menu).done(setupMenu);
        // script_menu

        /*var $helpSection = $("#helpSection");

        // Script menu button
        var $menuLink = $('<a id="roaMenu" href="javascript:;"/>')
            .html('<li class="active">' + GM_info.script.name + " " + GM_info.script.version + '</li>');
        //.click(); TODO

        $helpSection.prepend($menuLink);

        this.enabled = true;*/
    };

    modules.uiScriptMenu = module;

})(modules.jQuery);