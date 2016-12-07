(function ($) {
    'use strict';

    var template;

    function UITimerMenu() {
        RoAModule.call(this, "UI Timer Menu");
    }

    var createListEntry = function (title) {
        var $label = $('<div class="col-xs-6 col-md-12 col-lg-5 gold">' + title + '</div>');
        var $wrapper = $('<div class="col-xs-6 col-md-12 col-lg-7"/>');
        var $span = $('<span id="avi-house-construction"/>');
        $wrapper.append($span);

        var $entry = $('<div/>');
        $entry.append($label).append($wrapper);

        return { entry: $entry, span: $span };
    };

    UITimerMenu.prototype = Object.spawn(RoAModule.prototype, {
        activeTimers: {},
        activeTimerEntries: {},
        suspendRefresh: false,
        rebuildTimerList: function () {
            this.suspendRefresh = true;

            var $content = $('#timerMenuContents');
            $content.empty();
            this.activeTimerEntries = {};

            for(var name in this.activeTimers) {
                var entry = createListEntry(name);
                $content.append(entry.entry);
                this.activeTimerEntries[name] = entry;
            }

            this.suspendRefresh = false;
            this.refreshTimerList();
        },
        refreshTimerList: function () {
            if (this.suspendRefresh) {
                return;
            }

            for(var name in this.activeTimers) {
                this.activeTimerEntries[name].span.text(this.activeTimers[name].getTimeString());
            }
        },
        registerTimer: function (timer) {
            this.activeTimers[timer.name] = timer;
            this.rebuildTimerList();
        },
        unregisterTimer: function (name) {
            delete this.activeTimers[name];
            this.rebuildTimerList();
        },
        continueLoad: function() {
            $('#rightWrapper').append($(template));

            $('#timerEditorOpen').click(function () {
                modules.uiTimerEditor.show();
            });

            modules.createInterval("timerMenuRefresh").set(this.refreshTimerList, 10);

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