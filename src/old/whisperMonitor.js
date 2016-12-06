(function ($) {
    'use strict';

    var module = {};

    module.enable = function () {
        modules.observers.chat_whispers.observe(document.querySelector("#chatMessageList"), {
            childList: true
        });
    };

    modules.chatWhisperMonitor = module;

})(modules.jQuery);