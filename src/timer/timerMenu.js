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

    var saveTimers = function () {
        modules.uiTimerMenu.save();
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

            var names = Object.keys(this.activeTimers);
            names.sort();

            for(var i = 0; i < names.length; i++) {
                var entry = createListEntry(names[i], this.activeTimers[names[i]].canEdit);
                $content.append(entry.entry);
                this.activeTimerEntries[names[i]] = entry;
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

            // Restore saved timers
            var savedData = modules.settings.settings.timerData;
            if(savedData) {
                console.log("Loading Timers");
                console.log(savedData);

                for (var name in savedData) {
                    var timer = modules.createUITimer(name, true);
                    timer.setFromData(savedData[name]);
                    timer.resume();
                }
            }

            modules.createInterval("timerMenuRefresh").set(refreshTimers, 10);
            modules.createInterval("timerSaveInterval").set(saveTimers, 100);

            RoAModule.prototype.load.apply(this);
        },
        load: function () {
            $.get(modules.urls.html.timerMenu).done(function (x) {
                template = x;
                modules.uiTimerMenu.continueLoad();
            });
        },
        save: function () {
            var data = {};
            for (var name in this.activeTimers) {
                if (!this.activeTimers[name].canEdit || this.activeTimers[name].callback) {
                    // Won't save read-only timers or timers with callbacks
                    continue;
                }

                data[name] = this.activeTimers[name].save();
            }

            modules.settings.settings.timerData = data;
        }
    });

    UITimerMenu.prototype.constructor = UITimerMenu;

    modules.uiTimerMenu = new UITimerMenu();

})(modules.jQuery);