(function ($) {
    'use strict';

    var template;

    var $menuContent;

    function UIScriptMenu() {
        RoAModule.call(this, "UI Script Menu");
    }

    UIScriptMenu.prototype = Object.spawn(RoAModule.prototype, {
        addLink: function (text, callback) {
            var link = $('<a href="javascript:;"/>');
            link.append($('<li class="visible-xs-inline-block visible-sm-inline-block visible-md-block visible-lg-block">' + text + '</li>'));
            link.click(callback);

            $menuContent.append(link);
            /*
             .html('<li class="visible-xs-inline-block visible-sm-inline-block visible-md-block visible-lg-block">Debug</li>')
             .click(onClick);*/
            /*<a href="javascript:;"><li class="visible-xs-inline-block visible-sm-inline-block visible-md-block visible-lg-block">Custom Timer</li></a>*/
        },
        continueLoad: function () {
            $('#navWrapper').prepend($(template));

            $('#roaMenuTitle').text(GM_info.script.name + " " + GM_info.script.version);

            $menuContent = $("#roaMenuContent");

            RoAModule.prototype.load.apply(this);
        },
        load: function () {
            template = modules.templates.scriptMenu;
            this.continueLoad();
        }
    });

    UIScriptMenu.prototype.constructor = UIScriptMenu;

    modules.uiScriptMenu = new UIScriptMenu();

})(modules.jQuery);