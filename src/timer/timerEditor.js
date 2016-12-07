(function ($) {
    'use strict';

    var wnd;
    var template;

    function showFeedback(msg) {
        $('#createTimerFeedback').text(msg);
    }

    function clearCreateInput() {
        $('#customTimerOptName').val("");
        $('#customTimerOptHour').val("");
        $('#customTimerOptMinute').val("");
        $('#customTimerOptSecond').val("");
    }

    function createTimer() {
        var name = $('#customTimerOptName').val();
        var hour = parseInt($('#customTimerOptHour').val());
        var minute = parseInt($('#customTimerOptMinute').val());
        var second = parseInt($('#customTimerOptSecond').val());
        var sound = $('#customTimerOptSound').is(':checked');
        var notify = $('#customTimerOptNotify').is(':checked');

        if(!hour || isNaN(hour)) { hour = 0; }
        if(!minute || isNaN(minute)) { minute = 0; }
        if(!second || isNaN(second)) { second = 0; }

        clearCreateInput();

        if(!name || name.length <= 0) {
            showFeedback("Invalid name");
            return;
        }

        if(hour <= 0 && minute <= 0 && second <= 0) {
            showFeedback("Invalid Time set!");
            return;
        }

        var timeInSeconds = (hour * 60 * 60) + (minute * 60) + second;

        console.log("Creating timer " + name+" with " +hour+":"+minute+":"+second+" (" + timeInSeconds+")");

        var timer = modules.createUITimer(name, true);
        timer.sound = sound;
        timer.notify = notify;
        timer.set(timeInSeconds);
        timer.resume();

        console.log(timer);
    }

    function UITimerEditor() {
        RoAModule.call(this, "UI Timer Editor");
    }

    UITimerEditor.prototype = Object.spawn(RoAModule.prototype, {
        show: function () {
            wnd.show();
        },
        continueLoad: function () {
            $("<style>").text("" +
                ".timerEditorWindow{width: 800px; height: 500px;position: absolute; top: 0; left: 0;}")
                .appendTo("body");

            wnd = $(template);
            wnd.appendTo("body");
            wnd.draggable({handle:"#timerEditorTitle"});
            wnd.resizable();
            wnd.hide();

            $('#timerEditorWindowClose').click(function () {
                wnd.hide();
            });

            $('#customTimerCreateButton').click(function () {
                createTimer();
            });

            RoAModule.prototype.load.apply(this);
        },
        load: function () {
            // modules.uiScriptMenu.addLink("Custom Timer", onClick);

            $.get(modules.urls.html.timerEditor).done(function (x) {
                template = x;
                modules.uiTimerEditor.continueLoad();
            });
        }
    });

    UITimerEditor.prototype.constructor = UITimerEditor;

    modules.uiTimerEditor = new UITimerEditor();

})(modules.jQuery);