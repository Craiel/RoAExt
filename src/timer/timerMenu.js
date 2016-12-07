(function ($) {
    'use strict';

    var template;

    function UITimerMenu() {
        RoAModule.call(this, "UI Timer Menu");
    }

    var deleteTimer = function (event) {
        modules.uiTimerMenu.deleteTimer(event.data.name);
    };

    var createListEntry = function (title, canEdit) {
        var $label = $('<div class="col-xs-6 col-md-12 col-lg-5 gold timerLabel">' + title + '</div>');
        var $wrapper = $('<div class="col-xs-6 col-md-12 col-lg-7"/>');
        var $span = $('<span id="avi-house-construction" class="timerValue"/>');
        $wrapper.append($span);

        if (canEdit) {
            var $delete = $('<a href="javascript:;" class="timerDelete"><span>[X]</span></a>');
            $delete.click({name: title}, deleteTimer);
            $wrapper.append($delete);
        }

        var $entry = $('<div/>');
        $entry.append($label).append($wrapper);

        return { entry: $entry, span: $span };
    };

    var refreshTimers = function () {
        modules.uiTimerMenu.refreshTimerList();
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
                var entry = createListEntry(name, this.activeTimers[name].canEdit);
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
                if(this.activeTimers[name].ended === true) {
                    this.activeTimerEntries[name].span.text("Ended (" + this.activeTimers[name].getStartTimeString() + ")");
                } else {
                    this.activeTimerEntries[name].span.text(this.activeTimers[name].getTimeString());
                }
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
        deleteTimer: function (name) {
            this.activeTimers[name].delete();
        },
        continueLoad: function() {
            $('#rightWrapper').append($(template));

            $('#timerEditorOpen').click(function () {
                modules.uiTimerEditor.show();
            });

            modules.createInterval("timerMenuRefresh").set(refreshTimers, 10);

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