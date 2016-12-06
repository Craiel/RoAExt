(function () {
    'use strict';

    var module = {};

    function onClick() {
        modules.chartWindow.toggle();
    }

    module.enable = function () {
        var $helpSection = $("#helpSection");

        var $menuLink = $('<a href="javascript:;"/>')
            .html('<li class="visible-xs-inline-block visible-sm-inline-block visible-md-block visible-lg-block">Charts</li>')
            .click(onClick);

        $helpSection.append($menuLink);

    };

    modules.uiChartMenu = module;

})(modules.jQuery);