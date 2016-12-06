(function () {
    'use strict';

    function onClick() {
        modules.chartWindow.toggle();
    }

    function UIChartMenu() {
        RoAModule.call(this, "UI Chart Menu");
    }

    UIChartMenu.prototype = Object.spawn(RoAModule.prototype, {
        load: function () {

            modules.uiScriptMenu.addLink("Charts", onClick);

            RoAModule.prototype.load.apply(this);
        }
    });

    UIChartMenu.prototype.constructor = UIChartMenu;

    modules.uiChartMenu = new UIChartMenu();

})(modules.jQuery);