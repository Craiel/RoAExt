(function() {
    'use strict';

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

    function URLS() {
        RoAModule.call(this, "URLS");
    }

    URLS.prototype = Object.spawn(RoAModule.prototype, {
        sfx: {
            circ_saw: gitHubUrl("res/sfx/circ_saw.wav"),
            message_ding: gitHubUrl("res/sfx/message_ding.wav")
        },
        css: {
            jquery_te: "https://cdnjs.cloudflare.com/ajax/libs/jquery-te/1.4.0/jquery-te.min.css",
            script: gitHubUrl("res/css/roaext.css")
        },
        gif: {
            ajax_loader: gitHubUrl("res/img/ajax-loader.gif")
        },
        svg: {
            sword_clash: gitHubUrl("res/svg/sword-clash.svg"),
            log: gitHubUrl("res/svg/log.svg"),
            metal_bar: gitHubUrl("res/svg/metal-bar.svg"),
            stone_block: gitHubUrl("res/svg/stone-block.svg"),
            fishing: gitHubUrl("res/svg/fishing.svg")
        },
        html: {
            chartWindow: gitHubUrl("res/html/chartWindow.html"),
            clanDonationPercent: gitHubUrl("res/html/clanDonationPercent.html"),
            debugWindow: gitHubUrl("res/html/debugWindow.html"),
            dungeonWindow: gitHubUrl("res/html/dungeonWindow.html"),
            noteWindow: gitHubUrl("res/html/noteWindow.html"),
            scriptMenu: gitHubUrl("res/html/scriptMenu.html"),
            settingsWindow: gitHubUrl("res/html/settingsWindow.html"),
            timerEditor: gitHubUrl("res/html/timerEditor.html"),
            timerMenu: gitHubUrl("res/html/timerMenu.html"),

        }
    });

    URLS.prototype.constructor = URLS;

    modules.urls = new URLS;

})();