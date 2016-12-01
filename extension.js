var toast = AVBUToast;

//Check if the user can even support the bot
if (typeof(window.sessionStorage) === "undefined") {
    toast.incompatibility("Session storage");
} else if (typeof(MutationObserver) === "undefined") {
    toast.incompatibility("MutationObserver");
} else {
    var cache = AVBUCache(jQuery);
    cache.init(window.sessionStorage, MutationObserver, buzz, AloTimer);

    var constants = AVBUConstants(jQuery);
    var demo = AVBUDemo(jQuery);
    var handlers = AVBUHandlers(jQuery);
    var interval = AVBUInterval();
    var load = AVBULoad(jQuery);
    var observers = AVBUObservers(jQuery);
    var request = AVBURequest(jQuery);
    var settings = AVBUSettings(jQuery);
    var toast = AVBUToast(jQuery);
    var utils = AVBUUtils(jQuery);
    var combat = AVBUCombat(jQuery);
    combat.enable();

    var main = AVBU(jQuery);
    main.start();
}
