(function ($) {
    'use strict';

    var template;
    var wnd;

    var updateTimer;

    var enabledTypes = {};
    var enabledSources = {};

    var tabList = [];
    var tabGainList;
    var tabDropMap;

    function update() {
        if(wnd.is(":visible")) {
            if($('#gainWndList').is(":visible")) {
                rebuildGainTable();
                return;
            }

            if($('#gainWndDropMap').is(":visible")) {
                rebuildDropMapTable();
                return;
            }
        }
    }

    function rebuildDropMapTable() {
        var $tableBody = $('#gainWndDropMapTableContent');
        $tableBody.empty();

        var dropFilter = $('#gainDropMapFilterDropValue').val();
        var sourceFilter = $('#gainDropMapFilterSourceValue').val();

        var data = modules.playerGainTracker.getDropInfoByItem();

        var sortedDropNames = Object.keys(data).sort();
        for(var n = 0; n < sortedDropNames.length; n++) {
            var dropName = sortedDropNames[n];
            if(dropFilter && dropFilter.length > 0 && !dropName.toLowerCase().includes(dropFilter.toLowerCase())) {
                continue;
            }

            for(var i = 0; i < data[dropName].length; i++) {
                var sourceName = data[dropName][i];
                if(sourceFilter && sourceFilter.length > 0 && !sourceName.toLowerCase().includes(sourceFilter.toLowerCase())) {
                    continue;
                }

                var $row = $('<tr></tr>');
                $row.append($('<td>' + dropName + '</td>'));
                $row.append($('<td>' + sourceName + '</td>'));

                $tableBody.append($row);
            }
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

        var sourceFilterArray = [];
        for(var key in enabledSources) {
            if(enabledSources[key]) {
                sourceFilterArray.push(key);
            }
        }

        for (var i = 0; i < keys.length; i++) {
            if(!enabledTypes[keys[i]]) {
                continue;
            }

            var data = modules.playerGainTracker.getData(keys[i]);

            var count = data.getEntryCount();
            var value = data.getFilteredValue(sourceFilterArray);
            if(value === 0) {
                // We will not show 0 entries
                continue;
            }

            var fractionCount = modules.utils.hasFraction(value) ? 2 : 0;
            var average = (value / count).toFixed(2);

            var $row = $('<tr></tr>');
            $row.append($('<td>' + keys[i] + '</td>'));
            $row.append($('<td>' + modules.gainTypes.parseInt(keys[i]).stringValue + '</td>'));
            $row.append($('<td>' + modules.utils.formatNumber(count, 0) + '</td>'));
            $row.append($('<td>' + modules.utils.formatNumber(value, fractionCount) + '</td>'));
            if(count === 1 || average === 1.00) {
                $row.append($('<td></td>'));
            } else {
                $row.append($('<td>' + modules.utils.formatNumber(average, fractionCount) + '</td>'));
            }

            $row.append($('<td>' + modules.utils.formatNumber(data.getCurrentPerHourValue(), fractionCount) + '</td>'));
            $row.append($('<td>' + modules.utils.formatNumber(data.getAbsolutePerHourValue(), fractionCount) + '</td>'));

            tableBody.append($row);
        }

        $('#gainContentTable').tablesorter();
    }

    function createSourceFilters() {
        var wrapper = $('#gainSourceFilters');

        var input = $('<input type="checkbox" class="roaext-gain-filter-checkbox">All Sources</input>');
        var inputWrapper = $('<div class="roaext-gain-window-filter"></div>');
        inputWrapper.append(input);

        input.change(function() {
            for(var key in enabledSources) {
                enabledSources[key] = $(this).is(':checked');
                $('#gainSourceFilter_' + key).prop("checked", enabledSources[key]);
            }
        });

        // Check all boxes by default
        input.prop( "checked", true );

        wrapper.append(inputWrapper);

        var keys = Object.keys(modules.gainSources.sources);
        for(var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var source = modules.gainSources.sources[key];
            input = $('<input id="gainSourceFilter_' + source.id + '" type="checkbox" class="roaext-gain-filter-checkbox">' + source.stringValue + '</input>');
            inputWrapper = $('<div class="' + (i === keys.length - 1 ? "roaext--gain-window-filter-last" : "roaext-gain-window-filter") + '"></div>');
            inputWrapper.append(input);

            input.change({ id: source.id }, function(e) {
                enabledSources[e.data.id] = $(this).is(':checked');
            });

            // Check all boxes by default
            input.prop( "checked", true );

            wrapper.append(inputWrapper);

            enabledSources[source.id] = 1;
        }
    }

    function createTypeFilters() {
        var wrapper = $('#gainTypeFilters');

        var input = $('<input type="checkbox" class="roaext-gain-filter-checkbox">All Types</input>');
        var inputWrapper = $('<div class="roaext-gain-window-filter"></div>');
        inputWrapper.append(input);

        input.change(function() {
            for(var key in enabledTypes) {
                enabledTypes[key] = $(this).is(':checked');
                $('#gainTypeFilter_' + key).prop("checked", enabledSources[key]);
            }
        });

        // Check all boxes by default
        input.prop( "checked", true );

        wrapper.append(inputWrapper);

        var keys = Object.keys(modules.gainTypes.types);
        for(var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var type = modules.gainTypes.types[key];
            var input = $('<input id="gainTypeFilter_' + type.id + '" type="checkbox" class="roaext-gain-filter-checkbox">' + type.stringValue + '</input>');
            var inputWrapper = $('<div class="' + (i === keys.length - 1 ? "roaext--gain-window-filter-last" : "roaext-gain-window-filter") + '"></div>');
            inputWrapper.append(input);

            input.change({ id: type.id }, function(e) {
                enabledTypes[e.data.id] = $(this).is(':checked');
            });

            // Check all boxes by default
            input.prop( "checked", true );

            wrapper.append(inputWrapper);

            enabledTypes[type.id] = 1;
        }
    }

    function createControls() {
        var wrapper = $('#gainControls');

        var button = $('<div id="gameChartReset" class="btn btn-primary">Reset</div>');
        button.click(function () {
            if(window.confirm("Reset gain data?")) {
                modules.playerGainTracker.reset();
            }
        });

        wrapper.append(button);
    }

    function onClick() {
        wnd.toggle();
    }

    function createTab(contentId, toggleId) {
        var tab = $('#' + contentId);
        var toggle = $('#' + toggleId);
        toggle.click({id: contentId, t: toggleId}, function (e) {
            for(var i = 0; i < tabList.length; i++) {
                tabList[i].ta.hide();
                tabList[i].to.removeClass("active");
            }

            $('#' + e.data.id).toggle();

            if($('#' + e.data.id).is(":visible")) {
                $('#' + e.data.t).addClass("active");
            } else {
                $('#' + e.data.t).removeClass("active");
            }
        });

        tab.hide();
        tabList.push({ta: tab, to: toggle});
        return tab;
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

            tabGainList = createTab('gainWndList', 'gainCtrlList');
            tabDropMap = createTab('gainWndDropMap', 'gainCtrlDropMap');

            // Start with the map active by default
            tabGainList.show();

            modules.uiScriptMenu.addLink("Gains & Loot", onClick);

            createSourceFilters();
            createTypeFilters();
            createControls();

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