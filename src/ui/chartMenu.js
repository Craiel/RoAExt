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
            var $menuSection = $("#roaMenuContent");

            var $menuLink = $('<a href="javascript:;"/>')
                .html('<li class="visible-xs-inline-block visible-sm-inline-block visible-md-block visible-lg-block">Charts</li>')
                .click(onClick);

            $menuSection.append($menuLink);

            RoAModule.prototype.load.apply(this);
        }
    });

    UIChartMenu.prototype.constructor = UIChartMenu;

    modules.uiChartMenu = new UIChartMenu();

})(modules.jQuery);