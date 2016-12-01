var AVBUDemo = (function ($) {
    'use strict';

    const Demo = function (kind) {
        this.kind = kind;
    };

    Demo.prototype.kinds = {
        SOUND: 1,
        GM_NOTIFICATION: 2
    };
    Demo.prototype.gm_texts = {
        whisper: "[00:00:00] Whisper from Alorel: send me all of your crystals.",
        construction: "Construction finished!"
    };
    Demo.prototype.scenarios = {
        "whisper-sound": {
            kind: Demo.prototype.kinds.SOUND,
            src: SFX.msg_ding
        },
        "whisper-gm": {
            kind: Demo.prototype.kinds.GM_NOTIFICATION,
            src: Demo.prototype.gm_texts.whisper
        },
        "construction-sound": {
            kind: Demo.prototype.kinds.SOUND,
            src: SFX.circ_saw
        },
        "construction-gm": {
            kind: Demo.prototype.kinds.GM_NOTIFICATION,
            src: Demo.prototype.gm_texts.construction
        }
    };
    Demo.prototype.play = function () {
        if (typeof(this.scenarios[this.kind]) !== "undefined") {
            const scenario = this.scenarios[this.kind];

            switch (scenario.kind) {
                case Demo.prototype.kinds.SOUND:
                    if (!buzz.isWAVSupported()) {
                        Toast.incompatibility("WAV sounds");
                    } else {
                        scenario.src.play();
                    }
                    break;
                case Demo.prototype.kinds.GM_NOTIFICATION:
                    fn.notification(scenario.src);
                    break;
                default:
                    Toast.error("Misconfigured demo scenario: " + this.kind);
            }
        } else {
            Toast.error("Invalid demo scenario picked: " + this.kind);
        }
    };

    return Demo;
})