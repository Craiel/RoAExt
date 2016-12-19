(function ($) {
    'use strict';

    var template;
    var wnd;

    var updateTimer;

    function update() {
        if(wnd.is(":visible")) {
            rebuildGainTable();
        }
    }

    function rebuildGainTable() {
        if(!modules.settings.settings.gainData) {
            return;
        }

        var tableBody = $('#gainContentTableBody');
        tableBody.empty();

        var keys = modules.playerGainTracker.getKeys().sort(function(a, b) {
            return a - b;
        });

        for (var i = 0; i < keys.length; i++) {
            var data = modules.playerGainTracker.getData(keys[i]);

            var $row = $('<tr></tr>');
            $row.append($('<td>' + keys[i] + '</td>'));
            $row.append($('<td>' + modules.gainTypes.parseInt(keys[i]).stringValue + '</td>'));
            $row.append($('<td>' + "TODO" + '</td>'));
            $row.append($('<td>' + data.getValue() + '</td>'));
            $row.append($('<td>' + data.getCurrentPerHourValue().toFixed(2) + '</td>'));
            $row.append($('<td>' + data.getAbsolutePerHourValue().toFixed(2) + '</td>'));

            tableBody.append($row);
        }

        $('#gainContentTable').tablesorter();
    }

    function createSourceFilters() {
        var wrapper = $('#gainSourceFilters');
        for(var key in modules.gainSources.sources) {
            var source = modules.gainSources.sources[key];
            var input = $('<input type="checkbox" class="gainFilterCheckbox">' + source.stringValue + '</input>');
            wrapper.append(input);
        }
    }

    function createTypeFilters() {
        var wrapper = $('#gainTypeFilters');
        for(var key in modules.gainTypes.types) {
            var type = modules.gainTypes.types[key];
            var input = $('<input type="checkbox" class="gainFilterCheckbox">' + type.stringValue + '</input>');
            wrapper.append(type);
        }
    }

    function onClick() {
        wnd.toggle();
    }

    function PlayerGainWindow() {
        RoAModule.call(this, "Player Gain Window");
    }

    PlayerGainWindow.prototype = Object.spawn(RoAModule.prototype, {
        continueLoad: function () {

            wnd = $(template);
            wnd.appendTo("body");
            wnd.draggable({handle:"#gainWindowTitle"});
            wnd.resizable();
            wnd.hide();

            $('#gainWindowClose').click(function () {
                wnd.hide();
            });

            modules.uiScriptMenu.addLink("Player Gains", onClick);

            createSourceFilters();
            createTypeFilters();

            updateTimer = modules.createInterval("");
            updateTimer.set(update, 2000);

            RoAModule.prototype.load.apply(this);
        },
        load: function () {
            template = modules.templates.playerGainWindow;
            this.continueLoad();
        }
    });

    PlayerGainWindow.prototype.constructor = PlayerGainWindow;

    modules.playerGainWindow = new PlayerGainWindow();

})(modules.jQuery);