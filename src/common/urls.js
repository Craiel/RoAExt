(function() {
    'use strict';

    /**
     * Creates a GitHub CDN URL
     * @param {String} path Path to the file without leading slashes
     * @param {String} [author] The author. Defaults to Alorel
     * @param {String} [repo] The repository. Defaults to avabur-improved
     * @returns {String} The URL
     */
    const makeUrl = function (path) {
        return modules.constants.BaseResourceUrl + path;
    };

    function URLS() {
        RoAModule.call(this, "URLS");
    }

    URLS.prototype = Object.spawn(RoAModule.prototype, {
        sfx: {
            circ_saw: makeUrl("sfx/circ_saw.wav"),
            message_ding: makeUrl("sfx/message_ding.wav")
        },
        css: {
            jquery_ui: "https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.11.2/jquery-ui.min.css",
            jquery_te: "https://cdnjs.cloudflare.com/ajax/libs/jquery-te/1.4.0/jquery-te.min.css",
            spectrum: "https://cdnjs.cloudflare.com/ajax/libs/spectrum/1.8.0/spectrum.min.css",
            script: "https://rawgit.com/Craiel/RoAExtRelease/master/RoAExt.css"
        },
        gif: {
            ajax_loader: makeUrl("img/ajax-loader.gif")
        },
        svg: {
            sword_clash: makeUrl("svg/sword-clash.svg"),
            log: makeUrl("svg/log.svg"),
            metal_bar: makeUrl("svg/metal-bar.svg"),
            stone_block: makeUrl("svg/stone-block.svg"),
            fishing: makeUrl("svg/fishing.svg")
        }
    });

    URLS.prototype.constructor = URLS;

    modules.urls = new URLS;

})();