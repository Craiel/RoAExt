(function ($) {
    'use strict';

    const Request = function (url) {
        this.url = url;
    };

    Request.prototype = {
        url: null,
        args: null,

        get: function () {
            return this.custom({
                method: "GET"
            });
        },

        post: function (data) {
            return this.custom({
                method: "POST",
                data: data || {}
            });
        },

        custom: function (customArgs) {
            var methodArgs = $.extend({
                url: this.url
            }, customArgs || {});

            this.args = methodArgs;

            return this;
        },

        send: function () {
            return $.ajax(this.url, this.args);
        }
    };

    modules.createAjaxRequest = function (url) {
        return new Request(url);
    };

})(modules.jQuery);