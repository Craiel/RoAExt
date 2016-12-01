var AVBUCache = (function ($) {

    var module = {};

    module.TRADESKILL_MATS = {};

    module.init = function ($, CACHE_STORAGE, MutationObserver, buzz, AloTimer) {
        this.CACHE_STORAGE = CACHE_STORAGE;
        this.MutationObserver = MutationObserver;
        this.Buzz = buzz;
        this.AloTimer = AloTimer;
    };

    return module;

});