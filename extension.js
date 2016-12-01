// ==UserScript==
// @name           Avabur Improved
// @namespace      org.alorel.avaburimproved
// @author         Alorel <a.molcanovas@gmail.com>
// @homepage       https://github.com/Alorel/avabur-improved
// @description    Some welcome additions to Avabur's UI choices
// @include        https://avabur.com/game.php
// @include        http://avabur.com/game.php
// @include        https://www.avabur.com/game.php
// @include        http://www.avabur.com/game.php
// @version        0.7
// @icon           https://cdn.rawgit.com/Alorel/avabur-improved/0.6.3/res/img/logo-16.png
// @icon64         https://cdn.rawgit.com/Alorel/avabur-improved/0.6.3/res/img/logo-64.png
// @run-at         document-end
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_deleteValue
// @grant          GM_notification
// @grant          GM_listValues
// @grant          GM_xmlhttpRequest
// @connect        self
// @require        https://cdn.rawgit.com/Alorel/avabur-improved/0.6.7/lib/toastmessage/jquery.toastmessage.min.js
// @require        https://cdnjs.cloudflare.com/ajax/libs/buzz/1.1.10/buzz.min.js
// @require        https://cdn.rawgit.com/Alorel/avabur-improved/0.6.7/lib/jalc-1.0.1.min.js
// @require        https://cdn.rawgit.com/Alorel/alo-timer/master/src/alotimer.min.js

// @noframes
// ==/UserScript==
'use strict';

var toast = AVBUToast(jquery);
var cache = AVBUCache(jquery);
cache.init(window.sessionStorage, MutationObserver, buzz, AloTimer);

//Check if the user can even support the bot
if (typeof(window.sessionStorage) === "undefined") {
    toast.incompatibility("Session storage");
} else if (typeof(MutationObserver) === "undefined") {
    toast.incompatibility("MutationObserver");
} else {
    var main = AVBU(jQuery);
    main.start();
}
