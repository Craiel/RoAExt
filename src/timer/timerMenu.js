(function ($) {
    'use strict';

    var template;

    function UITimerMenu() {
        RoAModule.call(this, "UI Timer Menu");
    }

    UITimerMenu.prototype = Object.spawn(RoAModule.prototype, {
        continueLoad: function() {
            $('#rightWrapper').append($(template));

            $('#timerEditorOpen').click(function () {
                modules.uiTimerEditor.show();
            });

            RoAModule.prototype.load.apply(this);
        },
        load: function () {
            $.get(modules.urls.html.timerMenu).done(function (x) {
                template = x;
                modules.uiTimerMenu.continueLoad();
            });
        }
    });

    UITimerMenu.prototype.constructor = UITimerMenu;

    modules.uiTimerMenu = new UITimerMenu();

})(modules.jQuery);