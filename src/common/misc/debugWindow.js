(function ($) {
    'use strict';

    var template;
    var wnd;

    var requestHistory = {};

    function onClick() {
        wnd.toggle();
    }

    function updateDebugContent() {
        var $tableBody = $('#debugWindowContentBody');
        $tableBody.empty();

        for(var key in requestHistory) {
            var $rowRcvLink = $('<a href="javascript:;">Log to Console</a>').click({key: key}, function (event) {
                console.log('DEBUG: Printing data for ' + event.data.key);
                console.log(requestHistory[event.data.key].data);
            });

            var $rowSentLink = $('<a href="javascript:;">Log to Console</a>').click({key: key}, function (event) {
                console.log('DEBUG: Printing Sent data for ' + event.data.key);
                console.log(requestHistory[event.data.key].dataSent);
            });

            var timeString = requestHistory[key].time.getHours() + ":" + requestHistory[key].time.getMinutes() + ":" + requestHistory[key].time.getSeconds();;

            var $row = $('<tr></tr>');
            $row.append($('<td>' + key + '</td>'));
            $row.append($('<td>' + timeString + '</td>'));
            $row.append($('<td></td>').append($rowSentLink));
            $row.append($('<td></td>').append($rowRcvLink));

            $tableBody.append($row);
        }
    }

    function initEntry(url) {
        if(requestHistory[url]) {
            requestHistory[url].time = new Date();
            return;
        }

        requestHistory[url] = { time: new Date(), data: null, dataSent: null };
    }

    function onAjaxDone(requestData) {
        initEntry(requestData.url);
        requestHistory[requestData.url].data = requestData;

        updateDebugContent();
    }

    function onAjaxSentPending(requestData) {
        initEntry(requestData.url);
        requestHistory[requestData.url].dataSent = requestData;

        updateDebugContent();
    }

    function UIDebugWindow() {
        RoAModule.call(this, "UI Debug Window");
    }

    UIDebugWindow.prototype = Object.spawn(RoAModule.prototype, {
        continueLoad: function () {

            wnd = $(template);
            wnd.appendTo("body");
            wnd.draggable({handle:"#debugWindowTitle"});
            wnd.resizable();
            wnd.hide();

            $('#debugWindowClose').click(function () {
                wnd.hide();
            });

            modules.ajaxHooks.registerAll(onAjaxDone);
            modules.ajaxHooks.registerRcvAll(onAjaxSentPending);

            modules.uiScriptMenu.addLink("Debug", onClick);

            RoAModule.prototype.load.apply(this);
        },
        load: function () {
            template = modules.templates.debugWindow;
            this.continueLoad();
        }
    });

    UIDebugWindow.prototype.constructor = UIDebugWindow;

    modules.uiDebugWindow = new UIDebugWindow();

})(modules.jQuery);