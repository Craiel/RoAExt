var AVBUToast = (function ($) {
    'use strict';

    /** Create toast messages */
    var module = {};

    module.error = function (msg) {
        console.error(msg);
        $().toastmessage('showErrorToast', msg);
    };

    module.notice = function (msg) {
        $().toastmessage('showNoticeToast', msg);
    };

    module.success = function (msg) {
        $().toastmessage('showSuccessToast', msg);
    };

    module.warn = function (msg) {
        console.warn(msg);
        $().toastmessage('showWarningToast', msg);
    };

    module.incompatibility = function (what) {
        $().toastmessage('showToast', {
            text: "Your browser does not support " + what +
            ". Please <a href='https://www.google.co.uk/chrome/browser/desktop/' target='_blank'>" +
            "Download the latest version of Google Chrome</a>",
            sticky: true,
            position: 'top-center',
            type: 'error'
        });
    };

    return module;
});