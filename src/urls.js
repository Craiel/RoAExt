(function($) {
    'use strict';

    var module = {};

    /**
     * Creates a GitHub CDN URL
     * @param {String} path Path to the file without leading slashes
     * @param {String} [author] The author. Defaults to Alorel
     * @param {String} [repo] The repository. Defaults to avabur-improved
     * @returns {String} The URL
     */
    const gitHubUrl = function (path, author, repo, ver) {
        author = author || "Craiel";
        repo = repo || "RoAExt";
        var version = ver || "master"; // GM_info.script.version

        //var rawGitUrl = "https://cdn.rawgit.com/";

        // For dev this is quicker updates
        var rawGitUrl = "https://rawgit.com/";

        return rawGitUrl + author + "/" + repo + "/" + version + "/" + path;
    };

    module.sfx = {
        circ_saw: gitHubUrl("res/sfx/circ_saw.wav"),
        message_ding: gitHubUrl("res/sfx/message_ding.wav")
    };

    module.css = {
        jquery_te: "https://cdnjs.cloudflare.com/ajax/libs/jquery-te/1.4.0/jquery-te.min.css",
        script: gitHubUrl("res/css/roaext.css")
    };

    module.svg = {
        ajax_loader: gitHubUrl("res/img/ajax-loader.gif")
    };

    module.svg = {
        sword_clash: gitHubUrl("res/svg/sword-clash.svg"),
        log: gitHubUrl("res/svg/log.svg"),
        metal_bar: gitHubUrl("res/svg/metal-bar.svg"),
        stone_block: gitHubUrl("res/svg/stone-block.svg"),
        fishing: gitHubUrl("res/svg/fishing.svg")
    };

    module.html = {
        charts: gitHubUrl("res/html/charts.html"),
        house_timers: gitHubUrl("res/html/house-timers.html"),
        settings_modal: gitHubUrl("res/html/script-settings.html"),
        market_tooltip: gitHubUrl("res/html/market-tooltip.html"),
        clan_donation_percent: gitHubUrl("res/html/clan-donation-percent.html"),
        notes: gitHubUrl("res/html/notes.html"),
        custom_timer: gitHubUrl("res/html/custom-timer.html"),
        debug: gitHubUrl("res/html/debug.html")
    };

    modules.urls = module;
})(modules.jQuery);