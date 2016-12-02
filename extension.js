var toast = AVBUToast;

//Check if the user can even support the bot
if (typeof(window.sessionStorage) === "undefined") {
    toast.incompatibility("Session storage");
} else if (typeof(MutationObserver) === "undefined") {
    toast.incompatibility("MutationObserver");
} else {
    var cache = AVBUCache(jQuery);
    var constants = AVBUConstants(jQuery);
    var chat = AVBUChat(jQuery);
    var handlers = AVBUHandlers(jQuery);
    var interval = AVBUInterval();
    var load = AVBULoad(jQuery);
    var observers = AVBUObservers(jQuery);
    var request = AVBURequest(jQuery);
    var settings = AVBUSettings(jQuery);
    var toast = AVBUToast(jQuery);
    var utils = AVBUUtils(jQuery);
    var tracker = AVBUTrackers(jQuery);
    var clan = AVBUClan(jQuery);
    var auto = AVBUAuto(jQuery);
    auto.enable();

    var main = AVBU(jQuery);
    main.start();
}
