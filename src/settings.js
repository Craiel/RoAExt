var AVBUSettings = (function($) {
    'use strict';

    const SettingsHandler = function () {
        /** @type SettingsHandler.defaults */
        this.settings = this.defaults;
        this.load();
    };

    SettingsHandler.prototype = {
        /** Default settings */
        defaults: {
            /**
             * Notification settings.
             * sound: [bool] Whether to play a sound
             * gm: [bool] Whether to show the Greasemonkey notification
             */
            notifications: {
                /** Global overrides */
                all: {
                    sound: false,
                    gm: false
                },
                /** Whisper notifcations */
                whisper: {
                    sound: true,
                    gm: true
                },
                construction: {
                    sound: true,
                    gm: true
                }
            },
            features: {
                house_timer: true
            }
        },

        save: function () {
            GM_setValue("settings", JSON.stringify(this.settings));
        },

        load: function () {
            this.settings = $.extend(true, this.defaults, JSON.parse(GM_getValue("settings") || "{}"));
        }
    };

    return new SettingsHandler();
});