(function ($) {
    'use strict';

    var module = {};

    var window;

    var requestHistory = {};

    function onClick() {
        window.toggle();
    }

    function updateDebugContent() {
        var $tableBody = $('#debugWindowContentBody');
        $tableBody.clear();

        for(var key in requestHistory) {
            var $rowLink = $('<a href="javascript:;">Log to Console</a>').click({key: key}, function (event) {
                console.log('DEBUG: Printing data for ' + event.data.key);
                console.log(requestHistory[event.data.key].data);
            });

            var $row = $('<tr></tr>');
            $row.append($('<td>' + key + '</td>'));
            $row.append($('<td>' + new Date() - requestHistory[key].time + '</td>'));
            $row.append($('<td></td>').append($rowLink));

            $tableBody.append($row);
        }
    }

    function onAjaxDone(e, res, req, jsonData) {
        requestHistory[req.url] = { time: new Date(), data: jsonData };

        updateDebugContent();
    }

    function setupDebugWindow(template) {
        $("<style>").text("" +
            ".debugWindow{width: 800px; height: 500px;position: absolute; top: 0; left: 0;}")
            .appendTo("body");

        window = $(template);
        window.appendTo("body");
        window.draggable({handle:"#debugWindowTitle"});
        window.resizable();
        window.hide();

        modules.ajaxHooks.registerAll(onAjaxDone);
    }

    module.enable = function () {
        var $helpSection = $("#helpSection");

        var $menuLink = $('<a href="javascript:;"/>')
            .html('<li class="visible-xs-inline-block visible-sm-inline-block visible-md-block visible-lg-block">Debug</li>')
            .click(onClick);

        $helpSection.append($menuLink);

        $.get(modules.urls.html.debug).done(setupDebugWindow);
    };

    modules.uiDebug = module;

})(modules.jQuery);